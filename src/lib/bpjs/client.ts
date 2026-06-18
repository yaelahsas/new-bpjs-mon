import { createHmac } from "crypto";
import { createDecipheriv } from "crypto";
import { getBpjsConfig, type BpjsConfig } from "./config";
import { BPJS_ENDPOINTS } from "./endpoints";
import type { ServiceResult, ServiceType, ServiceStatus, MonitoringUpdate, MonitoringSummary } from "@/types/monitoring";

function getTimestamp(): string {
  return String(Math.floor(Date.now() / 1000));
}

function getSignature(
  consId: string,
  secretKey: string,
  timestamp: string
): string {
  const hmac = createHmac("sha256", secretKey);
  hmac.update(`${consId}&${timestamp}`);
  return hmac.digest("base64");
}

function stringDecrypt(key: string, encrypted: string): string {
  const keyHash = Buffer.from(
    createHmac("sha256", key).update(key).digest("hex").slice(0, 64),
    "hex"
  );
  const iv = keyHash.subarray(0, 16);
  const decipher = createDecipheriv("aes-256-cbc", keyHash, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

function getSpeedStatus(elapsed: number): ServiceStatus {
  if (elapsed <= 500) return "online";
  if (elapsed <= 2000) return "slow";
  return "offline";
}

function validateBpjsResponse(
  response: string,
  httpCode: number,
  elapsed: number
): Pick<ServiceResult, "is_valid" | "status" | "message" | "error_code"> {
  if (httpCode !== 200) {
    return { is_valid: false, status: "offline", message: `HTTP Error: ${httpCode}`, error_code: String(httpCode) };
  }

  const status = getSpeedStatus(elapsed);
  const is_valid = status !== "offline";

  let message = "";
  try {
    const data = JSON.parse(response);
    const meta = (data.metaData ?? data.metadata) as Record<string, unknown> | undefined;
    if (meta?.message) {
      message = String(meta.message);
    } else if (data.message) {
      message = String(data.message);
    }
  } catch {
    // ignore
  }

  if (!message) {
    message = is_valid ? "Connected" : "Slow connection";
  }

  return { is_valid, status, message, error_code: null };
}

async function bpjsRequest(
  endpoint: string,
  type: ServiceType,
  useCdn: boolean,
  config: BpjsConfig
): Promise<{ response: string; httpCode: number; elapsed: number }> {
  const baseUrl =
    type === "vclaim"
      ? useCdn
        ? config.baseUrlVclaimCdn
        : config.baseUrlVclaim
      : useCdn
        ? config.baseUrlAntrolCdn
        : config.baseUrlAntrol;

  const userKey = type === "antrol" ? config.userKeyAntrol : config.userKey;
  const timestamp = getTimestamp();
  const signature = getSignature(config.consId, config.secretKey, timestamp);

  const idHeader = type === "antrol" ? "x-cons-id" : "X-cons-id";
  const tsHeader = type === "antrol" ? "x-timestamp" : "X-timestamp";
  const sigHeader = type === "antrol" ? "x-signature" : "X-signature";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    [idHeader]: config.consId,
    [tsHeader]: timestamp,
    [sigHeader]: signature,
    "user_key": userKey,
  };

  const url = `${baseUrl}${endpoint}`;
  const start = performance.now();

  console.log(`[BPJS Debug] ${type} | ${endpoint}`);
  console.log(`[BPJS Debug] URL: ${url}`);
  console.log(`[BPJS Debug] consId: "${config.consId}"`);
  console.log(`[BPJS Debug] timestamp: "${timestamp}"`);
  console.log(`[BPJS Debug] signData: "${config.consId}&${timestamp}"`);
  console.log(`[BPJS Debug] secretKey (first 4): "${config.secretKey.substring(0, 4)}..."`);
  console.log(`[BPJS Debug] signature: "${signature}"`);
  console.log(`[BPJS Debug] userKey (first 4): "${userKey.substring(0, 4)}..."`);
  console.log(`[BPJS Debug] Headers:`, JSON.stringify(headers, null, 2));

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    const elapsed = Math.round((performance.now() - start) * 100) / 100;
    const response = await res.text();

    console.log(`[BPJS Debug] Response (${res.status}):`, response.substring(0, 500));

    return { response, httpCode: res.status, elapsed };
  } catch (err) {
    const elapsed = Math.round((performance.now() - start) * 100) / 100;
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      response: JSON.stringify({ error: true, message }),
      httpCode: 0,
      elapsed,
    };
  }
}

async function processEndpoint(
  key: string,
  label: string,
  type: ServiceType,
  endpoint: string,
  useCdn: boolean,
  config: BpjsConfig
): Promise<ServiceResult> {
  const { response, httpCode, elapsed } = await bpjsRequest(
    endpoint,
    type,
    useCdn,
    config
  );

  let validation = validateBpjsResponse(response, httpCode, elapsed);

  if (!validation.is_valid && useCdn && httpCode === 0) {
    const fallback = await bpjsRequest(endpoint, type, false, config);
    validation = validateBpjsResponse(fallback.response, fallback.httpCode, fallback.elapsed);
    return {
      key,
      label,
      type,
      status: validation.status,
      is_valid: validation.is_valid,
      message: validation.message,
      error_code: validation.error_code,
      response_time: fallback.elapsed,
      http_code: fallback.httpCode,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    key,
    label,
    type,
    status: validation.status,
    is_valid: validation.is_valid,
    message: validation.message,
    error_code: validation.error_code,
    response_time: elapsed,
    http_code: httpCode,
    timestamp: new Date().toISOString(),
  };
}

export async function checkAllServices(
  useCdn = false
): Promise<MonitoringUpdate> {
  const config = getBpjsConfig();

  const results = await Promise.all(
    BPJS_ENDPOINTS.map((ep) =>
      processEndpoint(ep.key, ep.label, ep.type, ep.endpoint, useCdn, config)
    )
  );

  const total = results.length;
  const online = results.filter((r) => r.status === "online").length;
  const slow = results.filter((r) => r.status === "slow").length;
  const offline = results.filter((r) => r.status === "offline").length;
  const avgResponse =
    total > 0
      ? Math.round(
          results.reduce((sum, r) => sum + r.response_time, 0) / total * 100
        ) / 100
      : 0;

  const summary: MonitoringSummary = {
    total,
    online,
    slow,
    offline,
    success_rate: total > 0 ? Math.round(((online + slow) / total) * 1000) / 10 : 0,
    avg_response: avgResponse,
  };

  return {
    summary,
    services: results,
    timestamp: new Date().toISOString(),
  };
}

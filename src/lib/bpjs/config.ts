export interface BpjsConfig {
  consId: string;
  secretKey: string;
  userKey: string;
  userKeyAntrol: string;
  baseUrlVclaim: string;
  baseUrlVclaimCdn: string;
  baseUrlAntrol: string;
  baseUrlAntrolCdn: string;
}

export function getBpjsConfig(): BpjsConfig {
  return {
    consId: (process.env.BPJS_CONS_ID ?? "1234").trim(),
    secretKey: (process.env.BPJS_SECRET_KEY ?? "secretkey").trim(),
    userKey: (process.env.BPJS_VCLAIM_USER_KEY ?? "").trim(),
    userKeyAntrol: (process.env.BPJS_ANTROL_USER_KEY ?? "").trim(),
    baseUrlVclaim:
      (process.env.BPJS_VCLAIM_BASE_URL ??
      "https://apijkn.bpjs-kesehatan.go.id/vclaim-rest/").trim(),
    baseUrlVclaimCdn:
      (process.env.BPJS_VCLAIM_CDN_URL ??
      "https://apijkn-cdn.bpjs-kesehatan.go.id/vclaim-rest/").trim(),
    baseUrlAntrol:
      (process.env.BPJS_ANTROL_BASE_URL ??
      "https://apijkn.bpjs-kesehatan.go.id/antreanrs/").trim(),
    baseUrlAntrolCdn:
      (process.env.BPJS_ANTROL_CDN_URL ??
      "https://apijkn-cdn.bpjs-kesehatan.go.id/antreanrs/").trim(),
  };
}

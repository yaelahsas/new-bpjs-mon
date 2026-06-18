import type { BpjsEndpoint } from "@/types/monitoring";

export const BPJS_ENDPOINTS: BpjsEndpoint[] = [
  {
    key: "peserta",
    label: "Peserta",
    type: "vclaim",
    endpoint: `Peserta/nokartu/0002057188781/tglSEP/${new Date().toISOString().split("T")[0]}`,
  },
  {
    key: "rujukan",
    label: "Rujukan",
    type: "vclaim",
    endpoint: "Rujukan/Peserta/0002057188781",
  },
  { key: "sep", label: "SEP", type: "vclaim", endpoint: "SEP/0210R0190625V000359" },
  {
    key: "rujukan_kartu",
    label: "Rujukan Kartu",
    type: "vclaim",
    endpoint: "Rujukan/Peserta/0002057188781",
  },
  {
    key: "rujukan_multi",
    label: "Rujukan Multi",
    type: "vclaim",
    endpoint: "Rujukan/List/Peserta/0000109784294",
  },
  {
    key: "diagnosa",
    label: "Diagnosa",
    type: "vclaim",
    endpoint: "referensi/diagnosa/A00",
  },
  {
    key: "surat_kontrol",
    label: "Surat Kontrol",
    type: "vclaim",
    endpoint: "referensi/propinsi",
  },
  { key: "poli", label: "Poli", type: "vclaim", endpoint: "referensi/poli/INT" },
  {
    key: "faskes",
    label: "Faskes",
    type: "vclaim",
    endpoint: "referensi/faskes/daha/2",
  },
  {
    key: "antrol_dokter",
    label: "Dokter",
    type: "antrol",
    endpoint: "ref/dokter",
  },
  {
    key: "antrol_poli",
    label: "Poli",
    type: "antrol",
    endpoint: "ref/poli",
  },
  {
    key: "antrol_jadwal",
    label: "Jadwal",
    type: "antrol",
    endpoint: `jadwaldokter/kodepoli/ANA/tanggal/${new Date(Date.now() + 86400000).toISOString().split("T")[0]}/`,
  },
];

export const VCLAIM_ENDPOINTS = BPJS_ENDPOINTS.filter(
  (e) => e.type === "vclaim"
);
export const ANTROL_ENDPOINTS = BPJS_ENDPOINTS.filter(
  (e) => e.type === "antrol"
);

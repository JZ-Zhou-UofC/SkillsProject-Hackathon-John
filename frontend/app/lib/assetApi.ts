// app/lib/assetApi.ts
import { Asset } from "@/app/components/types";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function fetchAssets(): Promise<Asset[]> {
  const res = await fetch(`${API_URL}/assets`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function archiveAsset(id: number) {
  const res = await fetch(`${API_URL}/assets/${id}/archive`, {
    method: "PATCH",
  });

  if (!res.ok) {
    throw new Error("Failed to archive asset");
  }
}
export async function getAssetRisk(id: string) {
  const res = await fetch(`${API_URL}/assets/${id}/risk`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getAssetDetail(id: string) {
  const res = await fetch(`${API_URL}/assets/${id}/detail`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}
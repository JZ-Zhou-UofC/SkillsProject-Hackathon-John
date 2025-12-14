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

// app/assets/[id]/page.tsx
import { notFound } from "next/navigation";
import RiskTimelineChart from "@/app/components/RiskTimelineChart";

type Asset = {
  id: number;
  asset_name: string;
  asset_type: string;
  city: string;
  address: string;
  manager_name: string;
  manager_phone: string;
  risk_status: string;
  created_at: string;
};

type LatestRisk = {
  shutdown_risk: number;
  pump_risk: number;
  bearing_risk: number;
  compressor_risk: number;
  exhaust_path_risk: number;
  cooling_or_lubrication_risk: number;
  created_at: string;
};

type RiskDetailRow = {
  created_at: string;
  shutdown_risk: number;
  bearing_risk?: number;
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

/* -------------------------
   Data Fetchers
------------------------- */

async function getAsset(id: string): Promise<Asset | null> {
  const res = await fetch(`${BASE}/assets/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function getLatestRisk(id: string): Promise<LatestRisk | null> {
  const res = await fetch(`${BASE}/assets/${id}/risk`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function getRiskDetail(
  id: string
): Promise<{ rows: RiskDetailRow[] } | null> {
  const res = await fetch(`${BASE}/assets/${id}/detail`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

/* -------------------------
   Page
------------------------- */

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ REQUIRED in new Next.js
  const { id } = await params;

  const [asset, latestRisk, detail] = await Promise.all([
    getAsset(id),
    getLatestRisk(id),
    getRiskDetail(id),
  ]);

  if (!asset) notFound();

  return (
    <main className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold">{asset.asset_name}</h1>
        <p className="text-sm text-gray-500">
          {asset.city} · {asset.address}
        </p>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Risk Status" value={asset.risk_status} />
        <Stat label="Manager" value={asset.manager_name} />
        <Stat label="Created At" value={formatDate(asset.created_at)} />
      </section>

      {/* Latest Risk Snapshot */}
      {latestRisk && (
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Stat
            label="Shutdown Risk"
            value={`${Math.round(latestRisk.shutdown_risk * 100)}%`}
          />
          <Stat
            label="Bearing Risk"
            value={`${Math.round(latestRisk.bearing_risk * 100)}%`}
          />
          <Stat
            label="Pump Risk"
            value={`${Math.round(latestRisk.pump_risk * 100)}%`}
          />
        </section>
      )}

      {/* Details */}
      <section className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <Detail label="Asset Type" value={asset.asset_type} />
        <Detail label="Manager Phone" value={asset.manager_phone} />
        <Detail label="Asset ID" value={String(asset.id)} />
      </section>

      {/* Risk Timeline */}
      <section className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Risk Timeline (Last 500)</h2>

        {detail?.rows?.length ? (
          <RiskTimelineChart data={detail.rows} />
        ) : (
          <p className="text-sm text-gray-400 text-center">
            No prediction history available
          </p>
        )}
      </section>
    </main>
  );
}

/* -------------------------
   Helpers
------------------------- */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-medium mt-1">{value}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

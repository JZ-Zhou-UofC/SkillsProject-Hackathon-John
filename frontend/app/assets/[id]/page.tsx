// app/assets/[id]/page.tsx
import { notFound } from "next/navigation";
import DiagnosticsCharts from "@/app/components/DiagnosticsCharts";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [asset, latestRisk, detail] = await Promise.all([
    fetch(`${BASE}/assets/${id}`, { cache: "no-store" }).then(r => r.ok ? r.json() : null),
    fetch(`${BASE}/assets/${id}/risk`, { cache: "no-store" }).then(r => r.ok ? r.json() : null),
    fetch(`${BASE}/assets/${id}/detail`, { cache: "no-store" }).then(r => r.ok ? r.json() : null),
  ]);

  if (!asset) notFound();

  return (
    <main className="min-h-screen bg-slate-50 p-8 space-y-8">

      {/* Header */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {asset.asset_name}
          </h1>
          <p className="text-sm text-slate-500">{asset.asset_type}</p>
        </div>

        <RiskBadge status={asset.risk_status} />
      </section>

      {/* Metadata */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl border">
        <Meta label="Location" value={`${asset.city}, ${asset.address}`} />
        <Meta label="Manager" value={asset.manager_name} />
        <Meta label="Phone" value={asset.manager_phone} />
      </section>

      {/* Risk Summary */}
      {latestRisk && (
        <section className="bg-white p-6 rounded-xl border space-y-6">
          <h2 className="text-lg font-semibold">Risk Overview</h2>

          {/* Shutdown Risk */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Overall Shutdown Risk</span>
            <span className="text-3xl font-semibold text-red-600">
              {Math.round(latestRisk.shutdown_risk * 100)}%
            </span>
          </div>

          {/* Individual Risks */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <RiskMini label="Bearing" value={latestRisk.bearing_risk} />
            <RiskMini label="Pump" value={latestRisk.pump_risk} />
            <RiskMini label="Compressor" value={latestRisk.compressor_risk} />
            <RiskMini label="Exhaust Path" value={latestRisk.exhaust_path_risk} />
            <RiskMini label="Cooling / Lube" value={latestRisk.cooling_or_lubrication_risk} />
          </div>
        </section>
      )}

      {/* Diagnostics (Hidden by default) */}
      {detail?.rows?.length && (
        <DiagnosticsCharts data={detail.rows} />
      )}
    </main>
  );
}
function Meta({ label, value }: any) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function RiskMini({ label, value }: any) {
  return (
    <div className="border rounded-lg p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold">
        {Math.round(value * 100)}%
      </div>
    </div>
  );
}

function RiskBadge({ status }: { status: string }) {
  const color =
    status === "HIGH"
      ? "bg-red-100 text-red-700"
      : status === "MEDIUM"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-green-100 text-green-700";

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {status}
    </span>
  );
}

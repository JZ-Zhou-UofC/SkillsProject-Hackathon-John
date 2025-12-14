// app/assets/[id]/page.tsx
import { notFound } from "next/navigation";

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

async function getAsset(id: string): Promise<Asset | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/assets/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}

export default async function AssetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const asset = await getAsset(params.id);

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

      {/* Details */}
      <section className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <Detail label="Asset Type" value={asset.asset_type} />
        <Detail label="Manager Phone" value={asset.manager_phone} />
        <Detail label="Asset ID" value={String(asset.id)} />
      </section>

      {/* Placeholder: Predictions */}
      <section className="bg-white rounded-lg shadow-sm border p-6 text-gray-400 text-center">
        Prediction results & risk timeline will appear here
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

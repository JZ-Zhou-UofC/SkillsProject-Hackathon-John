"use client";

import { Asset } from "./types";
import { useRouter } from "next/navigation";

type Props = {
  assets: Asset[];
  onArchive: (id: number) => void;
  onUploadCsv: (id: number) => void;
};

export default function AssetTable({
  assets,
  onArchive,
  onUploadCsv,
}: Props) {
  const router = useRouter();

  return (
    <div className="relative overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full border-separate border-spacing-0">
        <thead className="sticky top-0 z-10 bg-gray-50">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-5 py-3">Asset</th>
            <th className="px-5 py-3">Type</th>
            <th className="px-5 py-3">City</th>
            <th className="px-5 py-3">Address</th>
            <th className="px-5 py-3">Manager</th>
            <th className="px-5 py-3">Risk</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {assets.map((asset, idx) => (
            <tr
              key={asset.id}
              className={`
                group transition cursor-pointer
                ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}
                hover:bg-blue-50/60
              `}
            >
              {/* Asset */}
              <td className="px-5 py-4">
                <div className="font-medium text-gray-900">
                  {asset.asset_name}
                </div>
                <div className="text-xs text-gray-500">
                  ID: {asset.id}
                </div>
              </td>

              <td className="px-5 py-4 text-sm text-gray-700">
                {asset.asset_type}
              </td>

              <td className="px-5 py-4 text-sm text-gray-700">
                {asset.city}
              </td>

              <td className="px-5 py-4 text-sm text-gray-600 max-w-xs truncate">
                {asset.address}
              </td>

              <td className="px-5 py-4 text-sm text-gray-700">
                {asset.manager_name}
              </td>

              <td className="px-5 py-4">
                <RiskBadge status={asset.risk_status} />
              </td>

              {/* Actions */}
              <td className="px-4 py-4 text-right">
                <div className="flex justify-end items-center gap-4">
                  {/* Upload CSV (always clickable) */}
                  <button
                    onClick={() => onUploadCsv(asset.id)}
                    className="
        text-blue-500 hover:text-blue-700
        text-xs md:text-sm font-medium
        cursor-pointer
      "
                  >
                    Upload CSV
                  </button>

                  {/* View (clickable OR disabled) */}
                  <a
                    href={asset.risk_status !== "N/A" ? `/assets/${asset.id}` : undefined}
                    target={asset.risk_status !== "N/A" ? "_blank" : undefined}
                    rel={asset.risk_status !== "N/A" ? "noopener noreferrer" : undefined}
                    onClick={(e) => {
                      if (asset.risk_status === "N/A") e.preventDefault();
                    }}
                    className={`
        text-xs md:text-sm font-medium
        ${asset.risk_status !== "N/A"
                        ? "text-gray-600 hover:text-gray-900 cursor-pointer"
                        : "text-gray-300 cursor-not-allowed"
                      }
      `}
                  >
                    View
                  </a>

                  {/* Archive (hover-only + clickable cursor) */}
                  <button
                    onClick={() => onArchive(asset.id)}
                    className="
        sm:opacity-20 sm:group-hover:opacity-100
        transition-opacity duration-200
        text-red-500 hover:text-red-700
        text-xs md:text-sm font-medium
        cursor-pointer
      "
                  >
                    Archive
                  </button>
                </div>
              </td>


            </tr>
          ))}

          {assets.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-5 py-10 text-center text-sm text-gray-500"
              >
                No assets found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------
   Risk Badge
------------------------- */
function RiskBadge({ status }: { status: string }) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";

  const styles: Record<string, string> = {
    HIGH: "bg-red-100 text-red-700 ring-1 ring-red-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200",
    LOW: "bg-green-100 text-green-700 ring-1 ring-green-200",
    "N/A": "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
  };

  return (
    <span className={`${base} ${styles[status] || styles["N/A"]}`}>
      {status}
    </span>
  );
}

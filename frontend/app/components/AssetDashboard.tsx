"use client";

import { useEffect, useMemo, useState } from "react";
import AssetGrid from "./AssetGrid";
import AssetFilters from "./AssetFilters";
import CreateAssetModal from "./CreateAssetModal";
import { Asset } from "./types";

export default function AssetDashboard() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [city, setCity] = useState("");
    const [risk, setRisk] = useState("");
    const [assetName, setAssetName] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    const loadAssets = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/assets`)
            .then((res) => res.json())
            .then(setAssets)
            .catch(console.error);
    };

    useEffect(() => {
        loadAssets();
    }, []);

    const filteredAssets = useMemo(() => {
        return assets.filter((a) => {
            return (
                (assetName === "" ||
                    a.asset_name
                        ?.toLowerCase()
                        .includes(assetName.toLowerCase())) &&
                (city === "" ||
                    a.city.toLowerCase().includes(city.toLowerCase())) &&
                (risk === "" || a.risk_status === risk)
            );
        });
    }, [assets, city, risk, assetName]);

    return (
        <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                        Assets
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Monitor asset risk and operational status
                    </p>
                </div>

                <button
                    onClick={() => setShowCreate(true)}
                    className="
                        inline-flex items-center gap-2
                        rounded-lg border border-gray-200
                        bg-white px-4 py-2
                        text-sm font-medium text-gray-700
                        shadow-sm
                        hover:bg-gray-50 hover:text-gray-900
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        transition
                    "
                >
                    <span className="text-lg leading-none">＋</span>
                    New Asset
                </button>
            </div>

            <AssetFilters
                assetName={assetName}
                city={city}
                risk={risk}
                onAssetNameChange={setAssetName}
                onCityChange={setCity}
                onRiskChange={setRisk}
            />

            <AssetGrid assets={filteredAssets} />

            {showCreate && (
                <CreateAssetModal
                    onClose={() => setShowCreate(false)}
                    onCreated={() => {
                        setShowCreate(false);
                        loadAssets();
                    }}
                />
            )}
        </div>
    );
}

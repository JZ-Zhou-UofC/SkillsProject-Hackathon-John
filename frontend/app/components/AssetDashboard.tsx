"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AssetHeader from "./AssetHeader";
import AssetFilters from "./AssetFilters";
import AssetTable from "./AssetTable";
import CreateAssetModal from "./CreateAssetModal";
import { Asset } from "./types";

import { fetchAssets, archiveAsset } from "@/app/lib/assetApi";
import { uploadAssetCsv, uploadModelCsv } from "@/app/lib/csvUpload";

export default function AssetDashboard() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [city, setCity] = useState("");
    const [risk, setRisk] = useState("");
    const [assetName, setAssetName] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [modelTrainingStatus, setModelTrainingStatus] = useState<
        "idle" | "uploading" | "training" | "complete"
    >("idle");
    const wsRef = useRef<WebSocket | null>(null);


    const assetCsvInputRef = useRef<HTMLInputElement | null>(null);
    const modelCsvInputRef = useRef<HTMLInputElement | null>(null);
    const uploadingAssetIdRef = useRef<number | null>(null);

    const loadAssets = async () => {
        setAssets(await fetchAssets());
    };

    const onArchive = async (id: number) => {
        if (!confirm("Archive this asset?")) return;
        await archiveAsset(id);
        loadAssets();
    };

    const onUploadCsv = (id: number) => {
        uploadingAssetIdRef.current = id;
        assetCsvInputRef.current?.click();
    };

    const onAssetCsvSelected = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        const assetId = uploadingAssetIdRef.current;
        if (!file || !assetId) return;

        await uploadAssetCsv(assetId, file);
        loadAssets();
        e.target.value = "";
    };

    const onModelCsvSelected = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setModelTrainingStatus("uploading");

        try {
            const { job_id } = await uploadModelCsv(file);

            // 🔗 Open WebSocket
            const ws = new WebSocket(
                `${process.env.NEXT_PUBLIC_WS_BASE_URL}/ws/training/${job_id}`
            );

            wsRef.current = ws;

            ws.onopen = () => {
                console.log("WebSocket connected");
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                console.log("WS update:", data);

                if (data.status === "validating" || data.status === "training") {
                    setModelTrainingStatus("training");
                }

                if (data.status === "completed") {
                    setModelTrainingStatus("complete");
                    ws.close();
                }

                if (data.status === "failed") {
                    setModelTrainingStatus("idle");
                    alert(data.message || "Training failed");
                    ws.close();
                }
            };

            ws.onerror = (err) => {
                console.error("WebSocket error", err);
                setModelTrainingStatus("idle");
            };

        } catch (err) {
            console.error(err);
            setModelTrainingStatus("idle");
            alert("Error uploading model CSV.");
        } finally {
            e.target.value = "";
        }
    };

    useEffect(() => {
        loadAssets();
    }, []);

    const filteredAssets = useMemo(
        () =>
            assets.filter(
                (a) =>
                    a.status === "active" &&
                    (assetName === "" ||
                        a.asset_name?.toLowerCase().includes(assetName.toLowerCase())) &&
                    (city === "" || a.city.toLowerCase().includes(city.toLowerCase())) &&
                    (risk === "" || a.risk_status === risk)
            ),
        [assets, assetName, city, risk]
    );

    return (
        <div className="p-6 space-y-4">
            <AssetHeader
                onNewAsset={() => setShowCreate(true)}
                onNewModel={() => modelCsvInputRef.current?.click()}
                modelTrainingStatus={modelTrainingStatus}
            />

            <AssetFilters
                assetName={assetName}
                city={city}
                risk={risk}
                onAssetNameChange={setAssetName}
                onCityChange={setCity}
                onRiskChange={setRisk}
            />

            <input
                ref={assetCsvInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={onAssetCsvSelected}
            />

            <input
                ref={modelCsvInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={onModelCsvSelected}
            />

            <AssetTable
                assets={filteredAssets}
                onArchive={onArchive}
                onUploadCsv={onUploadCsv}
            />

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

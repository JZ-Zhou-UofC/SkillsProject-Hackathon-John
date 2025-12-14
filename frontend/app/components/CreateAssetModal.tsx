"use client";

import { useEffect, useState } from "react";
import { createAssetSchema } from "@/app/validation/createAssetSchema";

interface Props {
    onClose: () => void;
    onCreated: () => void;
}

interface Model {
    id: number;
    asset_type: string;
    name: string;
}

const CITY_OPTIONS = [
    "Calgary, AB",
    "Toronto, ON",
    "Vancouver, BC",
    "Montreal, QC",
    "Houston, TX",
    "Los Angeles, CA",
    "Chicago, IL",
    "New York, NY",
];

export default function CreateAssetModal({ onClose, onCreated }: Props) {
    const [name, setName] = useState("Turbine A-01");
    const [assetType, setAssetType] = useState("");
    const [city, setCity] = useState("Calgary, AB");
    const [address, setAddress] = useState("123 Industrial Way");
    const [managerName, setManagerName] = useState("John Doe");
    const [managerPhone, setManagerPhone] = useState("403-555-1234");

    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/models`)
            .then((res) => res.json())
            .then(setModels)
            .catch(console.error);
    }, []);

    const submit = async () => {
        setErrors([]);

        const payload = {
            asset_name: name,
            asset_type: assetType,
            city,
            address,
            manager_name: managerName,
            manager_phone: managerPhone,
        };

        const result = createAssetSchema.safeParse(payload);
        if (!result.success) {
            setErrors(["incorrect input"]);
            return;
        }

        setLoading(true);

        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/assets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        setLoading(false);
        onCreated();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-5">
                {/* Header */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Create new asset
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Register an asset to begin monitoring risk and performance
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-3">
                    <input
                        placeholder="Asset name (e.g. Turbine A-12)"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <select
                        required
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={assetType}
                        onChange={(e) => setAssetType(e.target.value)}
                    >
                        <option value="">Select asset type</option>
                        {[...new Set(models.map((m) => m.asset_type))].map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>

                    <select
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    >
                        <option value="">Select city</option>
                        {CITY_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>

                    <input
                        placeholder="Street address"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />

                    <input
                        placeholder="Manager name"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={managerName}
                        onChange={(e) => setManagerName(e.target.value)}
                    />

                    <input
                        placeholder="Manager phone"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={managerPhone}
                        onChange={(e) => setManagerPhone(e.target.value)}
                    />
                </div>

                {/* Validation errors */}
                {errors.length > 0 && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 space-y-1">
                        {errors.map((err, i) => (
                            <div key={i}>• {err}</div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={submit}
                        disabled={loading}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        Create asset
                    </button>
                </div>
            </div>
        </div>
    );
}

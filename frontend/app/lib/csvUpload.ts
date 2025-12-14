// app/lib/csvUpload.ts
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function uploadAssetCsv(
    assetId: number,
    file: File
): Promise<any> {
    if (!file || !file.name.toLowerCase().endsWith(".csv")) {
        throw new Error("Only CSV files are allowed");
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
        `${API_URL}/upload-csv-for-an-asset?asset_id=${assetId}`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Prediction CSV upload failed");
    }

    return res.json();
}


export async function uploadModelCsv(file: File): Promise<{ job_id: number }> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
        `${API_URL}/upload-csv-for-model-creation-or-update`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!res.ok) {
        throw new Error("Model CSV upload failed");
    }

    return res.json(); // { job_id, status }
}

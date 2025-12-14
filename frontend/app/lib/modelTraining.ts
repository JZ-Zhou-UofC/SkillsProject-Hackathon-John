// app/lib/modelTraining.ts

import { uploadModelCsv } from "./csvUpload";

export type TrainingStatus =
  | "idle"
  | "uploading"
  | "training"
  | "complete";

type StartTrainingArgs = {
  file: File;
  onStatusChange: (status: TrainingStatus) => void;
  onError?: (message: string) => void;
};

export async function startModelTraining({
  file,
  onStatusChange,
  onError,
}: StartTrainingArgs): Promise<void> {
  onStatusChange("uploading");

  try {
    const { job_id } = await uploadModelCsv(file);

    const WS_BASE =
      process.env.NEXT_PUBLIC_WS_BASE_URL || "ws://localhost:8000";

    const ws = new WebSocket(`${WS_BASE}/ws/training/${job_id}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (
        [
          "validating",
          "feature_engineering",
          "training",
          "saving_model",
          "registering_model",
        ].includes(data.status)
      ) {
        onStatusChange("training");
        return;
      }

      if (data.status === "completed") {
        onStatusChange("complete");
        ws.close();
        return;
      }

      if (data.status === "failed") {
        onStatusChange("idle");
        onError?.(data.message || "Training failed");
        ws.close();
      }
    };

    ws.onerror = () => {
      onStatusChange("idle");
      onError?.("WebSocket error");
      ws.close();
    };

  } catch (err) {
    console.error(err);
    onStatusChange("idle");
    onError?.("Error uploading model CSV.");
  }
}

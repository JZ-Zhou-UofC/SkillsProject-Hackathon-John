// app/components/AssetHeader.tsx
type Props = {
  onNewAsset: () => void;
  onNewModel: () => void;
  modelTrainingStatus:string;
};

// app/components/AssetHeader.tsx
export default function AssetHeader({
  onNewAsset,
  onNewModel,
  modelTrainingStatus = "idle",
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Assets
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor asset risk and operational status
        </p>
      </div>

      {/* Actions + status */}
      <div className="flex items-center gap-4">
        {/* Training status */}
        {modelTrainingStatus !== "idle" && (
          <div className="text-sm text-blue-600">
            {modelTrainingStatus === "uploading" && "Uploading model data…"}
            {modelTrainingStatus === "training" && "Training model…"}
            {modelTrainingStatus === "completed" && "Model ready"}
          </div>
        )}

        <button
          onClick={onNewModel}
          className="
            inline-flex items-center
            rounded-md border border-blue-600
            bg-white px-4 py-2
            text-sm font-medium text-blue-600
            hover:bg-blue-50
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition
          "
        >
          New Model
        </button>

        <button
          onClick={onNewAsset}
          className="
            inline-flex items-center
            rounded-md bg-blue-600 px-4 py-2
            text-sm font-medium text-white
            hover:bg-blue-700
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition
          "
        >
          New Asset
        </button>
      </div>
    </div>
  );
}

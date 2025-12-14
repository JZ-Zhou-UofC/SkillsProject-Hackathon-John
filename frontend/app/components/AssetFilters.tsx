// app/components/AssetFilters.tsx
"use client";

import { MenuItem, Select, TextField } from "@mui/material";

type Props = {
  city: string;
  risk: string;
  assetName: string;
  onCityChange: (v: string) => void;
  onRiskChange: (v: string) => void;
  onAssetNameChange: (v: string) => void;
};

export default function AssetFilters({
  city,
  risk,
  assetName,
  onCityChange,
  onRiskChange,
  onAssetNameChange,
}: Props) {
  return (
    <div className="flex gap-4 mb-4">
      <TextField
        label="Asset Name"
        value={assetName}
        onChange={(e) => onAssetNameChange(e.target.value)}
        size="small"
      />

      <TextField
        label="City"
        value={city}
        onChange={(e) => onCityChange(e.target.value)}
        size="small"
      />

      <Select
        value={risk}
        onChange={(e) => onRiskChange(e.target.value)}
        size="small"
        displayEmpty
      >
        <MenuItem value="">All Risks</MenuItem>
        <MenuItem value="HIGH">High</MenuItem>
        <MenuItem value="MEDIUM">Medium</MenuItem>
        <MenuItem value="LOW">Low</MenuItem>
        <MenuItem value="N/A">N/A</MenuItem>
      </Select>
    </div>
  );
}

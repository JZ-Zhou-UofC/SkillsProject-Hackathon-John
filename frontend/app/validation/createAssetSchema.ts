import { z } from "zod";

export const createAssetSchema = z.object({
  asset_name: z.string().min(1, "Asset name is required"),
  asset_type: z.string().min(1, "Asset type is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
  manager_name: z.string().min(1, "Manager name is required"),
  manager_phone: z.string().min(1, "Manager phone is required"),
});

// DTOs mirroring backend/src/internal/dto/merchant_dto.go. Keep in sync.

export type MerchantResponse = {
  id: number;
  name: string;
  contactNumber: string;
  location: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

/** UI-facing merchant model — used by both the picker and the management list. */
export type MerchantModel = {
  id: number;
  name: string;
  contactNumber: string;
  location: string;
  /** ISO timestamp — the management list sorts by / shows "last updated". */
  updatedAt: string;
};

// Mirror backend/src/internal/dto/merchant_dto.go. `contactNumber`/`location`
// are optional on the wire; only `name` (create) / `id` (update) are required.
export type CreateMerchantRequest = {
  name: string;
  contactNumber?: string;
  location?: string;
};

export type UpdateMerchantRequest = {
  id: number;
  name: string;
  contactNumber?: string;
  location?: string;
};

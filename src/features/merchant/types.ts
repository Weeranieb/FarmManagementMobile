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

/** UI-facing merchant picker option. */
export type MerchantModel = {
  id: number;
  name: string;
  contactNumber: string;
  location: string;
};

// DTOs mirroring backend/src/internal/dto/client_dto.go. Keep in sync as the
// API evolves.

export type ClientResponse = {
  id: number;
  name: string;
  ownerName: string;
  contactNumber: string;
  isActive: boolean;
  /** Per-client feature switch for tourist fishing (ตกปลา), toggled by an
   *  admin in the web master-data screen. When false the client doesn't run
   *  the activity at all, so the daily log must not ask them to log it. */
  isTouristFishingEnabled: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

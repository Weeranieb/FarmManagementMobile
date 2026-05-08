// DTOs mirroring backend/src/internal/dto/farm. Keep in sync as the API evolves.

/** Single row from GET /farm list (`FarmListResponse.farms`). */
export type FarmResponse = {
  id: number;
  clientId: number;
  name: string;
  status: string;
  pondCount: number;
  activePonds: number;
  createdAt?: string;
};

/** GET /farm response body (`data` after unwrapSuccessBody). */
export type FarmListResponse = {
  farms: FarmResponse[];
  total?: number;
  totalActive?: number;
};

export type FarmDetailSummary = {
  totalStock: number;
  activePonds: number;
  totalPonds: number;
  maintenancePonds: number;
};

export type FarmDetailPondItem = {
  id: number;
  name: string;
  status: string;
};

/** GET /farm/:id payload. */
export type FarmDetailResponse = {
  id: number;
  clientId: number;
  name: string;
  status: string;
  createdAt?: string;
  summary: FarmDetailSummary;
  ponds: FarmDetailPondItem[];
};

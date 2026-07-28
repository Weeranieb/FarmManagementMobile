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

/** Body for POST /farm. Mirrors `dto.CreateFarmRequest`.
 *
 *  `clientId` is required by the server and re-checked against the caller's own
 *  client, so it must be the signed-in user's `clientId` — not a free choice.
 *  The server normalizes the name (trims the "ฟาร์ม" display prefix) and rejects
 *  a duplicate within the client with code 500041. New farms start in
 *  `maintenance` status. */
export type CreateFarmRequest = {
  clientId: number;
  name: string;
};

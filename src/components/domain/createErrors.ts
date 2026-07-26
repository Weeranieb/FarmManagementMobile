import { apiErrorMessage } from '@/shared/http';

/**
 * User-facing copy for the two failures a farm/pond create actually hits.
 *
 * Both come back as 409s whose English server message ("Farm already exists")
 * isn't something to show a farmer, and the pond case needs the extra reminder
 * that the batch is transactional — nothing was created, so their other rows are
 * still there to fix.
 *
 * Lives with the sheets rather than in the feature layer: this is presentation
 * copy, and both the Farms and Farm-ponds screens submit through the same forms.
 */
export function createMasterDataErrorMessage(err: unknown, fallback: string): string {
  const code = err && typeof err === 'object' ? (err as { code?: unknown }).code : null;
  if (code === '500041') return 'มีฟาร์มชื่อนี้อยู่แล้ว — ใช้ชื่ออื่น';
  if (code === '500071') return 'มีบ่อชื่อนี้อยู่แล้วในฟาร์มนี้ — ยังไม่มีบ่อไหนถูกเพิ่ม';
  return apiErrorMessage(err, fallback);
}

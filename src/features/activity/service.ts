import { http } from '@/shared/http';
import type { ActivityFeedItem } from './types';

/**
 * Farm-wide activity feed (newest first). Omit `limit` for the full history
 * (the ประวัติกิจกรรม screen); pass e.g. 10 for the Home กิจกรรมล่าสุด strip.
 */
export function listActivityFeed(limit?: number): Promise<ActivityFeedItem[]> {
  return http.get('/activity', limit && limit > 0 ? { limit } : undefined);
}

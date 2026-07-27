import { http } from '@/shared/http';
import type { ActivityFeedItem, SellDetailLine } from './types';

/**
 * Farm-wide activity feed (newest first). Omit `limit` for the full history
 * (the ประวัติกิจกรรม screen); pass e.g. 10 for the Home กิจกรรมล่าสุด strip.
 */
export function listActivityFeed(limit?: number): Promise<ActivityFeedItem[]> {
  return http.get('/activity', limit && limit > 0 ? { limit } : undefined);
}

/** Points at the last row of a page already held. See `listActivityFeedPage`. */
export type ActivityFeedCursor = { activityDate: string; id: number };

/**
 * One page of the feed, continuing after `before`.
 *
 * The cursor is the feed's own sort key (activityDate, id) rather than an
 * offset: this list is append-heavy and every new activity lands at the top, so
 * an offset would make page 2 repeat rows page 1 already showed.
 *
 * The response is a plain array, so a page shorter than `limit` means the end.
 */
export function listActivityFeedPage(
  limit: number,
  before?: ActivityFeedCursor | null,
): Promise<ActivityFeedItem[]> {
  return http.get('/activity', {
    limit,
    ...(before ? { beforeDate: before.activityDate, beforeId: before.id } : {}),
  });
}

/** One sale's size-grade breakdown, smallest grade first. Sells only — any
 *  other activity returns an empty list. */
export function listActivitySellDetails(activityId: number): Promise<SellDetailLine[]> {
  return http.get(`/activity/${activityId}/sell-details`);
}

import { adaptActivityFeedItem } from './adapters';
import type { ActivityFeedItem } from './types';

function feedItem(over: Partial<ActivityFeedItem> = {}): ActivityFeedItem {
  return {
    id: 501,
    mode: 'fill',
    // Date-only at UTC midnight, which is how the backend sends it.
    activityDate: '2026-05-20T00:00:00Z',
    createdAt: '2026-05-20T13:07:00+07:00',
    createdBy: 'boonmee',
    createdByName: 'บุญมี',
    pondId: 7,
    pondName: 'บ่อ 1',
    farmName: 'ฟาร์ม 2',
    fishType: 'kaphong',
    amount: 1000,
    fishWeight: 0.05,
    fishUnit: 'kg',
    pricePerUnit: 120,
    total: 60_600,
    ...over,
  } as ActivityFeedItem;
}

describe('adaptActivityFeedItem', () => {
  it('takes the calendar day from the wire string, not from a local Date', () => {
    // Slicing rather than `new Date(...).getDate()`: a UTC-negative device would
    // read 2026-05-20T00:00:00Z as the 19th and file the row under the wrong day.
    expect(adaptActivityFeedItem(feedItem()).dateKey).toBe('2026-05-20');
  });

  it('marks a row saved on a later day as backdated', () => {
    const e = adaptActivityFeedItem(
      feedItem({ activityDate: '2026-05-18T00:00:00Z', createdAt: '2026-05-20T13:07:00+07:00' }),
    );
    expect(e.detail.backdated).toBe(true);
    expect(e.whenLabel).toBe('บันทึกย้อนหลัง');
  });

  it('shows the save time when the event and the save fall on the same day', () => {
    const e = adaptActivityFeedItem(feedItem());
    expect(e.detail.backdated).toBe(false);
    // Local time on the test machine; assert the shape rather than the hour so
    // this does not depend on the runner's timezone.
    expect(e.whenLabel).toMatch(/^\d{2}:\d{2} น\.$/);
    expect(e.detail.savedTimeLabel).toBe(e.whenLabel);
  });

  it('renders a move as source → destination', () => {
    const e = adaptActivityFeedItem(
      feedItem({ mode: 'move', pondName: 'บ่อ 1', toPondName: 'บ่อ 2', toPondId: 8 }),
    );
    expect(e.pondLabel).toBe('บ่อ 1 → บ่อ 2');
    expect(e.detail.toPondId).toBe(8);
  });

  it('leaves the destination undefined for everything that is not a move', () => {
    const e = adaptActivityFeedItem(feedItem());
    expect(e.pondLabel).toBe('บ่อ 1');
    expect(e.detail.toPond).toBeUndefined();
  });

  it('leaves the species blank for a sell', () => {
    // A sale is priced per size-grade, so it has no single species — the server
    // sends an empty fishType and the detail sheet must not invent one.
    const e = adaptActivityFeedItem(feedItem({ mode: 'sell', fishType: '' }));
    expect(e.detail.fish).toBe('');
  });

  it('carries the figures into the detail payload unrounded', () => {
    const e = adaptActivityFeedItem(feedItem({ amount: 2200, fishWeight: 0.045, total: 1_050_000 }));
    expect(e.detail.amount).toBe(2200);
    expect(e.detail.avgWeightKg).toBeCloseTo(0.045);
    expect(e.detail.total).toBe(1_050_000);
  });
});

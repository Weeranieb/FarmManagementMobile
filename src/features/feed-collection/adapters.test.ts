import { adaptFeedCollection, adaptFeedPriceHistory } from './adapters';
import type { FeedCollectionPageItem, FeedPriceHistoryResponse } from './types';

function feedItem(over: Partial<FeedCollectionPageItem> = {}): FeedCollectionPageItem {
  return {
    id: 1,
    name: 'อาหารเม็ด 9950',
    feedType: 'pellet',
    unit: 'กก.',
    updatedAt: '2026-07-01T00:00:00Z',
    ...over,
  } as FeedCollectionPageItem;
}

describe('adaptFeedCollection', () => {
  it('keeps FCR null when it has never been set', () => {
    // FCR drives the feed-cost side of every cycle's P&L. Null means "not set",
    // and defaulting it to 0 would silently value all feed at nothing.
    expect(adaptFeedCollection(feedItem()).fcr).toBeNull();
  });

  it('coerces a string FCR to a number', () => {
    // The API sends decimals as strings in places; arithmetic downstream would
    // otherwise concatenate.
    expect(adaptFeedCollection(feedItem({ fcr: '1.45' as never })).fcr).toBe(1.45);
  });

  it('keeps an FCR of 0 rather than treating it as unset', () => {
    expect(adaptFeedCollection(feedItem({ fcr: 0 })).fcr).toBe(0);
  });

  it('applies the same rules to pack size', () => {
    expect(adaptFeedCollection(feedItem()).packSizeKg).toBeNull();
    expect(adaptFeedCollection(feedItem({ packSizeKg: '20' as never })).packSizeKg).toBe(20);
    expect(adaptFeedCollection(feedItem({ packSizeKg: 0 })).packSizeKg).toBe(0);
  });

  it('keeps price null until a price history exists', () => {
    expect(adaptFeedCollection(feedItem()).price).toBeNull();
    expect(adaptFeedCollection(feedItem({ latestPrice: 27.5 })).price).toBe(27.5);
  });

  it('classifies anything that is not "fresh" as pellet', () => {
    expect(adaptFeedCollection(feedItem({ feedType: 'fresh' })).kind).toBe('fresh');
    expect(adaptFeedCollection(feedItem({ feedType: 'pellet' })).kind).toBe('pellet');
    expect(adaptFeedCollection(feedItem({ feedType: '' })).kind).toBe('pellet');
  });

  it('falls back to กก. when the unit is blank', () => {
    expect(adaptFeedCollection(feedItem({ unit: '' })).unit).toBe('กก.');
  });

  it('prefers the price date over the record date for "last updated"', () => {
    // The list is sorted and labelled by when the *price* changed; the record's
    // own updatedAt moves for unrelated edits like a renamed supplier.
    const withPriceDate = adaptFeedCollection(
      feedItem({ latestPriceUpdatedDate: '2026-07-20T00:00:00Z' }),
    );
    expect(withPriceDate.updatedAt).toBe('2026-07-20T00:00:00Z');
    expect(adaptFeedCollection(feedItem()).updatedAt).toBe('2026-07-01T00:00:00Z');
  });
});

describe('adaptFeedPriceHistory', () => {
  function entry(over: Partial<FeedPriceHistoryResponse> = {}): FeedPriceHistoryResponse {
    return {
      id: 3,
      feedCollectionId: 1,
      price: 500,
      priceUpdatedDate: '2026-07-20T17:30:00Z',
      ...over,
    } as FeedPriceHistoryResponse;
  }

  it('reduces the timestamp to a UTC calendar day', () => {
    // Read in UTC on purpose: a local-time read would shift 17:30Z into the next
    // day in Bangkok and file the price under the wrong date.
    expect(adaptFeedPriceHistory(entry()).effectiveDate).toBe('2026-07-20');
  });

  it('pads month and day to two digits', () => {
    expect(adaptFeedPriceHistory(entry({ priceUpdatedDate: '2026-01-05T00:00:00Z' })).effectiveDate).toBe(
      '2026-01-05',
    );
  });

  it('falls back to the first ten characters of an unparseable date', () => {
    expect(adaptFeedPriceHistory(entry({ priceUpdatedDate: 'not-a-date' })).effectiveDate).toBe(
      'not-a-date',
    );
  });

  it('coerces string prices and keeps a missing per-kg price null', () => {
    const e = adaptFeedPriceHistory(entry({ price: '480.5' as never }));
    expect(e.price).toBe(480.5);
    expect(e.pricePerKg).toBeNull();
    expect(adaptFeedPriceHistory(entry({ pricePerKg: '24.03' as never })).pricePerKg).toBe(24.03);
  });
});

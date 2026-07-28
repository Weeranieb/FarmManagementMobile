import { adaptActivity, adaptCycle, adaptPond } from './adapters';
import type { ActivityResponse, PondCycleResponse, PondResponse } from './types';

/** A response with only the fields the backend always sends. */
function pondResponse(over: Partial<PondResponse> = {}): PondResponse {
  return {
    id: 1,
    farmId: 2,
    name: 'บ่อ 1',
    status: 'active',
    ageDays: null,
    startDate: null,
    latestActivityType: null,
    ...over,
  } as PondResponse;
}

describe('adaptPond', () => {
  it('defaults a missing head count to 0 but leaves money null', () => {
    // The distinction carries meaning: 0 fish is a fact, whereas a null
    // totalCost means "no active cycle", and rendering that as ฿0 would claim a
    // pond broke even when it has no cycle at all.
    const p = adaptPond(pondResponse());
    expect(p.totalFish).toBe(0);
    expect(p.totalCost).toBeNull();
    expect(p.totalRevenue).toBeNull();
    expect(p.feedCost).toBeNull();
    expect(p.netResult).toBeNull();
  });

  it('passes P&L through untouched, including a loss', () => {
    const p = adaptPond(
      pondResponse({ totalCost: 120_000, totalRevenue: 90_000, feedCost: 30_000, netResult: -30_000 }),
    );
    expect(p.totalCost).toBe(120_000);
    expect(p.totalRevenue).toBe(90_000);
    expect(p.feedCost).toBe(30_000);
    expect(p.netResult).toBe(-30_000);
  });

  it('keeps a real zero rather than turning it into null', () => {
    // `?? null` not `|| null`: a cycle that genuinely cost nothing yet must read
    // as ฿0, not as "no cycle".
    const p = adaptPond(pondResponse({ totalCost: 0, netResult: 0 }));
    expect(p.totalCost).toBe(0);
    expect(p.netResult).toBe(0);
  });

  it('treats any status that is not maintenance as active', () => {
    expect(adaptPond(pondResponse({ status: 'maintenance' })).status).toBe('maintenance');
    expect(adaptPond(pondResponse({ status: 'active' })).status).toBe('active');
    expect(adaptPond(pondResponse({ status: 'something-new' as never })).status).toBe('active');
  });

  it('drops an unrecognised latest-activity type instead of passing it on', () => {
    expect(adaptPond(pondResponse({ latestActivityType: 'sell' })).latestActivityType).toBe('sell');
    expect(
      adaptPond(pondResponse({ latestActivityType: 'buy' as never })).latestActivityType,
    ).toBeNull();
  });

  it('defaults area to null so the edit form shows it as unset, not 0 rai', () => {
    expect(adaptPond(pondResponse()).area).toBeNull();
    expect(adaptPond(pondResponse({ area: 2.5 })).area).toBe(2.5);
  });
});

describe('adaptCycle', () => {
  function cycleResponse(over: Partial<PondCycleResponse> = {}): PondCycleResponse {
    return { id: 9, startDate: '2026-05-01', isActive: true, ...over } as PondCycleResponse;
  }

  it('defaults money to 0 — unlike adaptPond, which keeps it null', () => {
    // A cycle row always belongs to a cycle, so ฿0 is the truthful default here.
    // The asymmetry with adaptPond is deliberate; if one changes, check the other.
    const c = adaptCycle(cycleResponse());
    expect(c.totalCost).toBe(0);
    expect(c.totalRevenue).toBe(0);
    expect(c.netResult).toBe(0);
  });

  it('keeps feedCost null for cycles closed before feed-cost accounting', () => {
    // Null here means "never recorded", which the UI must not print as ฿0.
    expect(adaptCycle(cycleResponse()).feedCost).toBeNull();
    expect(adaptCycle(cycleResponse({ feedCost: 1500 })).feedCost).toBe(1500);
  });

  it('reports an open cycle as active with no end date', () => {
    const c = adaptCycle(cycleResponse({ isActive: true }));
    expect(c.isActive).toBe(true);
    expect(c.endDate).toBeNull();
  });

  it('coerces a truthy non-boolean isActive', () => {
    expect(adaptCycle(cycleResponse({ isActive: 1 as never })).isActive).toBe(true);
    expect(adaptCycle(cycleResponse({ isActive: 0 as never })).isActive).toBe(false);
  });
});

describe('adaptActivity', () => {
  function activityResponse(over: Partial<ActivityResponse> = {}): ActivityResponse {
    return {
      id: 5,
      mode: 'fill',
      direction: 'out',
      activityDate: '2026-05-20',
      amount: 1000,
      fishType: 'kaphong',
      total: 60_600,
      ...over,
    } as ActivityResponse;
  }

  it('carries the figures through', () => {
    const a = adaptActivity(activityResponse({ pricePerUnit: 120, totalWeight: 50 }));
    expect(a.amount).toBe(1000);
    expect(a.total).toBe(60_600);
    expect(a.pricePerUnit).toBe(120);
    expect(a.totalWeightKg).toBe(50);
  });

  it('turns a zero price, weight or extra cost into undefined', () => {
    // `|| undefined`, so 0 is indistinguishable from absent. That is what the UI
    // wants — it hides "฿0/กก." on a sell, whose price lives per size-grade —
    // but it means these fields cannot express a genuine zero. Pinned so a
    // change to `??` is a deliberate one.
    const a = adaptActivity(activityResponse({ pricePerUnit: 0, totalWeight: 0, additionalCost: 0 }));
    expect(a.pricePerUnit).toBeUndefined();
    expect(a.totalWeightKg).toBeUndefined();
    expect(a.additionalCost).toBeUndefined();
  });

  it('treats any direction that is not "in" as outgoing', () => {
    expect(adaptActivity(activityResponse({ direction: 'in' })).direction).toBe('in');
    expect(adaptActivity(activityResponse({ direction: 'out' })).direction).toBe('out');
    expect(adaptActivity(activityResponse({ direction: '' as never })).direction).toBe('out');
  });
});

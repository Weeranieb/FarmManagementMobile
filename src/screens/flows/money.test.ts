import {
  additionalCostsTotal,
  fishValue,
  moveSplit,
  sellRowSubtotal,
  sellTotals,
  toCount,
  toDecimal,
  totalWeightKg,
} from './money';

describe('text → number', () => {
  it('treats a blank field as zero', () => {
    expect(toCount('')).toBe(0);
    expect(toDecimal('')).toBe(0);
  });

  it('truncates a decimal head count rather than rounding it', () => {
    // parseInt, not Math.round: 12.9 fish is 12 fish.
    expect(toCount('12.9')).toBe(12);
  });

  it('keeps decimals on weights and prices', () => {
    expect(toDecimal('0.045')).toBeCloseTo(0.045);
    expect(toDecimal('118.5')).toBeCloseTo(118.5);
  });

  it('yields NaN for non-numeric text', () => {
    // Documents today's behaviour rather than endorsing it: the numeric
    // keyboards make this unreachable, and a silent 0 would hide an input bug.
    // If this ever needs to be 0, change it deliberately and update this test.
    expect(Number.isNaN(toCount('abc'))).toBe(true);
    expect(Number.isNaN(toDecimal('abc'))).toBe(true);
  });
});

describe('fishValue — the cost basis behind fill and move', () => {
  it('multiplies head count by average weight by price per kg', () => {
    // 2,000 fish × 0.05 kg = 100 kg × ฿120 = ฿12,000
    expect(fishValue(2000, 0.05, 120)).toBe(12000);
  });

  it('rounds to whole baht', () => {
    // 1,234 × 0.037 kg × ฿113.25 = ฿5,171.06...
    expect(fishValue(1234, 0.037, 113.25)).toBe(5171);
  });

  it('rounds halves upward, matching Math.round', () => {
    // 1 × 0.5 kg × ฿5 = ฿2.5 → ฿3, not ฿2.
    expect(fishValue(1, 0.5, 5)).toBe(3);
  });

  it('is zero when any factor is zero', () => {
    expect(fishValue(0, 0.05, 120)).toBe(0);
    expect(fishValue(2000, 0, 120)).toBe(0);
    expect(fishValue(2000, 0.05, 0)).toBe(0);
  });

  it('does not lose the fractional part before multiplying', () => {
    // A regression guard: rounding weight or price first would give ฿0 here,
    // because 0.004 kg and ฿0.4 both round to zero on their own.
    expect(fishValue(1_000_000, 0.004, 0.4)).toBe(1600);
  });
});

describe('totalWeightKg', () => {
  it('stays unrounded so ฿/kg displays stay honest', () => {
    expect(totalWeightKg(3, 0.045)).toBeCloseTo(0.135);
  });
});

describe('additionalCostsTotal', () => {
  it('sums the rows', () => {
    expect(additionalCostsTotal([{ amount: '500' }, { amount: '250.5' }])).toBeCloseTo(750.5);
  });

  it('counts a blank or half-typed row as zero instead of breaking the total', () => {
    expect(additionalCostsTotal([{ amount: '500' }, { amount: '' }, { amount: '.' }])).toBe(500);
  });

  it('is zero for no rows', () => {
    expect(additionalCostsTotal([])).toBe(0);
  });
});

describe('moveSplit', () => {
  it('halves the additional costs across both ponds', () => {
    const s = moveSplit(12000, 800);
    expect(s.halfExtra).toBe(400);
    expect(s.sourceNetEffect).toBe(11600);
    expect(s.destTotalCost).toBe(12400);
  });

  it('books the same fish value as source revenue and destination cost', () => {
    // This is the transfer price: the source is credited exactly what the
    // destination is charged, so a move cannot create or destroy value.
    const s = moveSplit(12000, 800);
    expect(s.sourceFishRevenue).toBe(s.destFishCost);
  });

  it('over-allocates by one baht on an odd extras total', () => {
    // ฿101 splits into ฿51 + ฿51 = ฿102. Documented rather than fixed: the
    // backend's CalcMovePond rounds the same way, and the two must agree.
    const s = moveSplit(0, 101);
    expect(s.halfExtra).toBe(51);
    expect(s.sourceAdditionalCost + s.destAdditionalCost).toBe(102);
  });

  it('leaves both sides at the fish value when there are no extras', () => {
    const s = moveSplit(9000, 0);
    expect(s.halfExtra).toBe(0);
    expect(s.sourceNetEffect).toBe(9000);
    expect(s.destTotalCost).toBe(9000);
  });
});

describe('sellRowSubtotal', () => {
  it('multiplies kg by price per kg', () => {
    expect(sellRowSubtotal(7000, 150)).toBe(1_050_000);
  });

  it('rounds each line to whole baht', () => {
    expect(sellRowSubtotal(12.34, 118.5)).toBe(1462); // 1462.29
  });
});

describe('sellTotals', () => {
  const rows = [
    { weightKg: '7000', pricePerKg: '150' },
    { weightKg: '3000', pricePerKg: '120' },
  ];

  it('reports each line and their sum', () => {
    const t = sellTotals(rows, 0);
    expect(t.subtotals).toEqual([1_050_000, 360_000]);
    expect(t.grossRevenue).toBe(1_410_000);
  });

  it('subtracts additional costs to get the net', () => {
    expect(sellTotals(rows, 15_000).netRevenue).toBe(1_395_000);
  });

  it('rounds per line, so the visible lines add up to the printed total', () => {
    // Rounding once at the end would give ฿3 while the two lines show ฿2 each.
    const t = sellTotals(
      [
        { weightKg: '1', pricePerKg: '1.5' },
        { weightKg: '1', pricePerKg: '1.5' },
      ],
      0,
    );
    expect(t.subtotals).toEqual([2, 2]);
    expect(t.grossRevenue).toBe(4);
  });

  it('counts a half-typed row as zero rather than NaN', () => {
    const t = sellTotals([{ weightKg: '100', pricePerKg: '50' }, { weightKg: '', pricePerKg: '' }], 0);
    expect(t.subtotals).toEqual([5000, 0]);
    expect(t.grossRevenue).toBe(5000);
  });

  it('can go negative when the costs exceed the sale', () => {
    // Not clamped: a sale that lost money must read as a loss, not as ฿0.
    expect(sellTotals([{ weightKg: '1', pricePerKg: '100' }], 500).netRevenue).toBe(-400);
  });

  it('is zero for no rows', () => {
    const t = sellTotals([], 0);
    expect(t.subtotals).toEqual([]);
    expect(t.grossRevenue).toBe(0);
  });
});

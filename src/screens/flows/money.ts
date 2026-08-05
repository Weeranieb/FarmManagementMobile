/**
 * The arithmetic behind every fill / move / sell. Pure and dependency-free so it
 * can be tested without rendering a flow.
 *
 * Extracted from the three flow hooks, which each carried their own copy of
 * `Math.round(amount * weight * price)`. One copy, one set of tests.
 *
 * Every function mirrors a backend formula (`CalculateMoveCost`, `CalcMovePond`,
 * `CalcSellPond`). When one changes, both sides must.
 */

/** A row of the additional-costs editor. Amounts are raw text from a TextInput. */
export type AmountRow = { amount: string };

/**
 * Parses a text field the way the flows already did.
 *
 * Deliberately preserves the existing semantics, including that non-numeric text
 * yields NaN rather than 0 — the numeric keyboards and digits-only sanitizers
 * make that unreachable today, and silently turning it into 0 would hide an
 * input bug rather than fix one. `''` maps to 0 because every caller passed
 * `field || '0'`.
 */
export function toCount(text: string): number {
  return parseInt(text || '0', 10);
}

export function toDecimal(text: string): number {
  return parseFloat(text || '0');
}

/**
 * Fish value / cost basis: head count × average weight per fish × price per kg,
 * rounded to whole baht.
 *
 * The same number is a cost on a fill, a transfer price on a move, and the
 * source's revenue on that move.
 */
export function fishValue(count: number, avgWeightKg: number, pricePerKg: number): number {
  return Math.round(count * avgWeightKg * pricePerKg);
}

/** Total weight moved/filled, unrounded — it feeds ฿/kg displays. */
export function totalWeightKg(count: number, avgWeightKg: number): number {
  return count * avgWeightKg;
}

/** Sum of the additional-cost rows. Blank and unparseable rows count as 0, which
 *  is what lets a half-typed row sit in the editor without breaking the total. */
export function additionalCostsTotal(rows: AmountRow[]): number {
  return rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
}

export type MoveSplit = {
  /** Each side's share of the additional costs. */
  halfExtra: number;
  /** Source books the fish value as revenue and half the extras as its cost. */
  sourceFishRevenue: number;
  sourceAdditionalCost: number;
  sourceNetEffect: number;
  /** Destination books the fish value plus half the extras as its cost. */
  destFishCost: number;
  destAdditionalCost: number;
  destTotalCost: number;
};

/**
 * Splits a move across both ponds — mirrors the backend's `CalcMovePond`.
 *
 * Additional costs are halved, so an odd total does not split evenly: rounding
 * each side up means the two halves can sum to one baht MORE than the original
 * (฿101 → ฿51 + ฿51). That is the backend's behaviour too, and it is why the
 * source's net and the destination's total are derived here rather than
 * recomputed independently in each screen.
 */
export function moveSplit(fishVal: number, extraTotal: number): MoveSplit {
  const halfExtra = Math.round(extraTotal / 2);
  return {
    halfExtra,
    sourceFishRevenue: fishVal,
    sourceAdditionalCost: halfExtra,
    sourceNetEffect: fishVal - halfExtra,
    destFishCost: fishVal,
    destAdditionalCost: halfExtra,
    destTotalCost: fishVal + halfExtra,
  };
}

/** One size-grade line of a sale: kg × ฿/kg, rounded to whole baht. */
export function sellRowSubtotal(weightKg: number, pricePerKg: number): number {
  return Math.round(weightKg * pricePerKg);
}

export type SellTotals = {
  /** Per-row subtotals, in row order. */
  subtotals: number[];
  /** Σ subtotals — what the buyer pays. */
  grossRevenue: number;
  /** Gross minus additional costs — what the sale actually earned. */
  netRevenue: number;
};

/**
 * A sale's totals. Each row is rounded before summing, matching what the review
 * screen shows line by line — summing first and rounding once would print a
 * total that the visible lines do not add up to.
 */
export function sellTotals(
  rows: { weightKg: string; pricePerKg: string }[],
  extraTotal: number,
): SellTotals {
  // `parseFloat(x) || 0` rather than toDecimal: a half-typed row must contribute
  // 0 to the running total while the user is still editing it, not NaN.
  const subtotals = rows.map((r) =>
    sellRowSubtotal(parseFloat(r.weightKg) || 0, parseFloat(r.pricePerKg) || 0),
  );
  const grossRevenue = subtotals.reduce((sum, v) => sum + v, 0);
  return { subtotals, grossRevenue, netRevenue: grossRevenue - extraTotal };
}

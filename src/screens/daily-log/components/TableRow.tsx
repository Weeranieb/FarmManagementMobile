import { memo, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import {
  CELL_HIGHLIGHT,
  CELL_PAD_H,
  MAINT,
  NAME_W,
  ROW_H,
  TABLE_SURFACE,
  VIBRANT_BRAND,
  fmtTh,
  isCellValueInvalid,
  type ColKey,
  type ColSpec,
} from '../constants';
import type { ActiveCell, PondRow } from '../hook';

type Props = {
  pond: PondRow;
  /** Visible columns for this client — see `UseDailyLogV6['cols']`. */
  cols: readonly ColSpec[];
  idx: number;
  activeCell: ActiveCell;
  /** Live numpad buffer for this row's active cell — `undefined` for every
   *  row except the one currently being typed into. Kept out of `pond.v` /
   *  `overrides` on purpose: this changes every keystroke, and stuffing it
   *  into shared state would rebuild `ponds` and re-render every row instead
   *  of just this one. */
  liveValue?: number | '';
  onCellTap: (pondKey: string, col: ColKey) => void;
  /** Called with this row's on-screen position (window Y + height) when it
   *  becomes the active row, so the screen can lift it clear of the numpad. */
  onActiveMeasure?: (pageY: number, height: number) => void;
};

function TableRowImpl({ pond, cols, idx, activeCell, liveValue, onCellTap, onActiveMeasure }: Props) {
  // Any locked row — whether `status === 'maintenance'` or `notYetActive`
  // (cycle hasn't started yet on the selected day) — uses the same striped
  // + central-lock visual so the table reads as a single "can't enter data
  // here" pattern. The pill text below the pond code distinguishes them
  // ("ซ่อมบำรุง" vs "ปิดบ่อ").
  if (pond.disabled) {
    return <LockedRow pond={pond} cols={cols} />;
  }

  return (
    <ActiveRow
      pond={pond}
      cols={cols}
      idx={idx}
      activeCell={activeCell}
      liveValue={liveValue}
      onCellTap={onCellTap}
      onActiveMeasure={onActiveMeasure}
    />
  );
}

function ActiveRow({ pond, cols, idx, activeCell, liveValue, onCellTap, onActiveMeasure }: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const rowRef = useRef<View>(null);

  const accentByState = {
    saved: t.fill,
    dirty: t.warn,
    empty: 'transparent',
  } as const;
  const accent = accentByState[pond.state];
  const zebra = idx % 2 === 1 ? TABLE_SURFACE.zebra : TABLE_SURFACE.even;
  const rowActive = activeCell?.pondKey === pond.key;
  const rowBg = rowActive ? VIBRANT_BRAND[50] : zebra;

  // Report this row's on-screen position when it becomes active (tap or ถัดไป)
  // so the screen can scroll it clear of the numpad if it's covered. Keyed on
  // `rowActive` only, so typing digits doesn't re-measure.
  useEffect(() => {
    if (!rowActive) return;
    const id = requestAnimationFrame(() => {
      rowRef.current?.measureInWindow((_x, y, _w, h) => {
        if (h > 0) onActiveMeasure?.(y, h);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [rowActive, onActiveMeasure]);
  // Row-label sync (Daily Log v7 frame Y / Z / AA — the highlighted cell's
  // row pulls the pond label cell into focus too). Stripe gets thicker + a
  // soft brand ring, label text gets extra tracking. Color swaps to red on
  // the error variant so the row reads "something is wrong here" at a
  // glance, matching the cell's red border. The row is flagged as "error"
  // whenever it carries any out-of-range cell — not only on the active
  // row — so a scrolled-away dirty row with `25,000` still pulls the
  // user's eye via the red label.
  const hasInvalidCell = cols.some((c) => isCellValueInvalid(pond.v[c.key]));
  const isErrorRow = hasInvalidCell;
  const stripeColor = isErrorRow
    ? CELL_HIGHLIGHT.errorBorder
    : rowActive
      ? VIBRANT_BRAND[600]
      : accent === 'transparent'
        ? t.border
        : accent;
  const stripeRingColor = isErrorRow ? CELL_HIGHLIGHT.errorRing : CELL_HIGHLIGHT.ring;

  return (
    <View
      ref={rowRef}
      style={{
        flexDirection: 'row',
        minHeight: ROW_H,
        backgroundColor: rowBg,
        borderBottomWidth: 1,
        borderBottomColor: t.border,
      }}
    >
      <View
        style={{
          width: NAME_W,
          backgroundColor: rowBg,
          paddingLeft: 8,
          paddingRight: 6,
          paddingVertical: 6,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          borderRightWidth: 1,
          borderRightColor: t.borderStrong,
        }}
      >
        {rowActive ? (
          // Soft 2px ring around the stripe — emulates the inset box-shadow
          // from the prototype (`0 0 0 2px rgba(31,95,212,.18)`). React Native
          // has no `box-shadow`, so a wrapper View with the ring color sits
          // under the stripe and renders the halo.
          <View
            style={{
              padding: 2,
              backgroundColor: stripeRingColor,
              borderRadius: 4,
            }}
          >
            <View
              style={{
                width: 4,
                height: 34,
                borderRadius: 2,
                backgroundColor: stripeColor,
              }}
            />
          </View>
        ) : (
          <View
            style={{
              width: 3,
              height: 30,
              borderRadius: 2,
              backgroundColor: stripeColor,
            }}
          />
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontSize: 14,
              // 1.5× — pond names are free text, and a low vowel plus a stacked
              // upper mark in the same name ("บ่อกุ้งขาวที่ 3") inks 19.5px, so
              // anything under 20 clips the tone mark. Content height stays
              // 21+1+16+12 = 50 ≤ ROW_H, so the row does not grow.
              lineHeight: 21,
              fontFamily: type.familyBold,
              color: t.ink,
              // 700 is the heaviest IBM Plex weight available — bump the
              // tracking on the highlight row so the label still reads
              // "more emphasised" than its neighbours.
              letterSpacing: rowActive ? 0.2 : 0.1,
            }}
            numberOfLines={1}
          >
            {pond.id}
          </Text>
          <Text
            style={{
              fontSize: 11,
              lineHeight: 16,
              fontFamily: type.familyNum,
              color: t.inkSoft,
              marginTop: 1,
            }}
            numberOfLines={1}
          >
            {tx('daily.stockFish', { count: pond.stock.toLocaleString('th-TH') })}
          </Text>
        </View>
      </View>

      {cols.map((c, ci) => {
        // Hairline only at column-GROUP boundaries (not between the pellet
        // เช้า/เย็น sub-cells) — enough structure to keep columns legible
        // without the full spreadsheet gridlines.
        const isGroupEnd = ci < cols.length - 1 && cols[ci + 1]?.group !== c.group;
        const cellDisabled =
          (c.group === 'pellet' && !pond.hasPellet) || (c.group === 'fresh' && !pond.hasFresh);
        const isActive = activeCell?.pondKey === pond.key && activeCell?.col === c.key;
        // While this exact cell is being typed into, mirror the numpad's
        // live buffer instead of the committed value — see `liveValue` doc.
        const value = isActive && liveValue !== undefined ? liveValue : pond.v[c.key];
        // Zero == "no data" — mirrors saveAll's `hasAnyData` filter in hook.ts
        // so the cell visually agrees with what the backend will treat as a
        // skipped column.
        const filled = value !== '' && value != null && Number(value) !== 0;
        const isCellDirty = pond.dirtyCols.has(c.key);
        // Validation — flags any cell whose value exceeds CELL_MAX_VALUE.
        // Derived directly from the displayed value so saved-but-out-of-range
        // entries (rare, but possible if the limit changes after the fact)
        // still surface red.
        const isError = isCellValueInvalid(value);
        // Pill overlay — Daily Log v7 frames Y / Z / AA + legend. Renders
        // whenever the cell is in a "highlighted" state: actively being
        // edited (Y / AA), carrying an unsaved value vs. the saved baseline
        // (Z), OR holding an out-of-range value (AA). The spec callout on
        // state Z is explicit that the pill+dot pair should be legible
        // "ตั้งแต่ระดับเซลล์ ไม่ต้องดูแค่ป้ายของแถว", so non-active dirty /
        // invalid cells get the same treatment.
        const showPill = isActive || isCellDirty || isError;
        // Amber dot — paired with the pill on dirty cells. Suppressed when
        // the cell is in the error variant since the red `!` badge already
        // occupies the same top-right corner.
        const showChangedDot = isCellDirty && !isError;
        const bg = showPill
          ? TABLE_SURFACE.even
          : rowActive
            ? 'rgba(255,255,255,.55)'
            : 'transparent';

        const accentColor = isError ? CELL_HIGHLIGHT.errorBorder : CELL_HIGHLIGHT.border;
        const accentTint = isError ? CELL_HIGHLIGHT.errorTint : CELL_HIGHLIGHT.tint;
        const accentRing = isError ? CELL_HIGHLIGHT.errorRing : CELL_HIGHLIGHT.ring;

        return (
          <Tappable
            key={c.key}
            disabled={cellDisabled}
            onPress={() => !cellDisabled && onCellTap(pond.key, c.key)}
            style={{
              // Data columns share the row's remaining width evenly, so the
              // table always fits the viewport — no horizontal pan.
              flex: 1,
              minWidth: 0,
              backgroundColor: bg,
              paddingHorizontal: CELL_PAD_H,
              // Centered rather than right-aligned: at ~56px the pill overlay
              // is only 6px narrower than the cell, and centering keeps the
              // value clear of both the pill border and the corner badges.
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              borderRightWidth: isGroupEnd ? 1 : 0,
              borderRightColor: t.border,
            }}
          >
            {/* Pill highlight overlay — sits inside the cell so column
             *  dividers stay clean. Two stacked Views emulate the
             *  prototype's `border + box-shadow ring` since React Native
             *  has no `outline` / `box-shadow` ring.
             *  · Outer view is a 3px *ring* (border only, transparent
             *    centre) so the inner pill's tint sits on the cell
             *    background, not on top of the ring fill — keeping the
             *    centre at the intended 7% blue instead of compositing
             *    to ~21%.
             *  · Inner pill carries the 2px solid border + 7% tint. */}
            {showPill ? (
              <>
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: 1,
                    bottom: 1,
                    left: 2,
                    right: 2,
                    borderRadius: 10,
                    borderWidth: 3,
                    borderColor: accentRing,
                  }}
                />
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: 4,
                    bottom: 4,
                    left: 5,
                    right: 5,
                    borderRadius: 7,
                    borderWidth: 2,
                    borderColor: accentColor,
                    backgroundColor: accentTint,
                  }}
                />
              </>
            ) : null}

            {/* Changed indicator — small amber dot in the top-right of any
             *  cell whose value differs from the saved baseline. Renders
             *  whether or not the cell is currently active so the dirty
             *  state is legible without opening the keypad. */}
            {showChangedDot ? (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 7,
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: t.warn,
                  borderWidth: 1.5,
                  borderColor: t.surface,
                  zIndex: 2,
                }}
              />
            ) : null}

            {/* Error glyph — red "!" badge in the top-right of the active
             *  cell on validation failures. The validator isn't wired yet,
             *  so this only renders when callers pass
             *  `activeCellVariant='error'` (see Props). */}
            {isError ? (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: 3,
                  right: 5,
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  backgroundColor: accentColor,
                  borderWidth: 1.5,
                  borderColor: t.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    lineHeight: 10,
                    fontFamily: type.familyNumBold,
                    color: '#ffffff',
                  }}
                >
                  !
                </Text>
              </View>
            ) : null}

            {cellDisabled ? (
              <Text style={{ fontSize: 11, color: t.borderStrong }}>—</Text>
            ) : (
              <Text
                style={{
                  // Highlighted cells (active or dirty) render heavier and
                  // slightly larger so the live / changed value pops out of
                  // the table grid — matches the bold "14.5" in the v7
                  // state Y / Z legend glyphs.
                  fontSize: showPill ? 16 : filled ? 15.5 : 16,
                  fontFamily: showPill
                    ? type.familyNumBold
                    : filled
                      ? type.familyNumSemi
                      : type.familyNum,
                  color: isError ? CELL_HIGHLIGHT.errorInk : filled ? t.ink : t.borderStrong,
                  lineHeight: 16,
                }}
              >
                {filled ? fmtTh(value as number) : '–'}
              </Text>
            )}
          </Tappable>
        );
      })}
    </View>
  );
}

// ────────────────────────────────────────────────────────────
// Locked row — `status === 'maintenance'` OR `notYetActive`. Spec:
// Daily Log v7 frames P / Q, callout lines 1697-1699. No data entry
// possible: taps are absorbed (no toast — per user note in chat10)
// and the data columns render as a striped pattern with a single
// central lock glyph instead of column placeholders. Pill text and
// glyph differ by reason: maintenance shows a wrench + "ซ่อมบำรุง",
// pre-start ponds show a lock + "ปิดบ่อ".
// ────────────────────────────────────────────────────────────
function LockedRow({ pond, cols }: { pond: PondRow; cols: readonly ColSpec[] }) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const PillIcon = pond.maintenance ? Icon.wrench : Icon.lock;
  const pillLabel = pond.maintenance ? tx('daily.maintenance') : tx('pond.maintenance');
  return (
    <View
      style={{
        flexDirection: 'row',
        minHeight: ROW_H,
        backgroundColor: MAINT.bg,
        borderBottomWidth: 1,
        borderBottomColor: t.border,
      }}
    >
      <View
        style={{
          width: NAME_W,
          backgroundColor: MAINT.bg,
          paddingLeft: 8,
          paddingRight: 6,
          // Tighter than ActiveRow's 6: the locked row stacks name + status pill
          // (21 + 3 + 18 = 42), so 6 would put it exactly at ROW_H with no slack
          // and any growth would make this row taller than its neighbours.
          paddingVertical: 4,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          borderRightWidth: 1,
          borderRightColor: t.borderStrong,
        }}
      >
        <View
          style={{
            width: 3,
            height: 30,
            borderRadius: 2,
            backgroundColor: MAINT.accent,
          }}
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontSize: 14,
              // Same mark clearance as ActiveRow's pond name.
              lineHeight: 21,
              fontFamily: type.familyBold,
              color: MAINT.ink,
              opacity: 0.7,
              letterSpacing: 0.1,
            }}
            numberOfLines={1}
          >
            {pond.id}
          </Text>
          <View
            style={{
              marginTop: 3,
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              paddingVertical: 1,
              paddingLeft: 4,
              paddingRight: 6,
              borderRadius: 5,
              backgroundColor: MAINT.pillBg,
              borderWidth: 1,
              borderColor: MAINT.stroke,
            }}
          >
            <PillIcon size={9} color={MAINT.ink} />
            <Text
              style={{
                fontSize: 9.5,
                // "ซ่อมบำรุง" stacks ◌่ over ซ and drops ◌ุ under ร — inks
                // 11.6px, so the default line box is too tight to trust.
                lineHeight: 14,
                fontFamily: type.familyBold,
                color: MAINT.ink,
                letterSpacing: 0.1,
              }}
              numberOfLines={1}
            >
              {pillLabel}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, flexDirection: 'row', position: 'relative' }}>
        {cols.map((c) => (
          <View
            key={c.key}
            style={{
              flex: 1,
              minWidth: 0,
              borderRightWidth: 1,
              borderRightColor: MAINT.stroke,
              overflow: 'hidden',
            }}
          >
            <StripePattern />
          </View>
        ))}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.lock size={14} color={MAINT.inkSoft} />
        </View>
      </View>
    </View>
  );
}

// React Native has no CSS `background: repeating-linear-gradient`, so we
// emulate the 135° stripe pattern with absolutely-positioned thin diagonal
// bars. Stripe spacing matches the web spec: 1px line every 8px, 135°.
// Drawn as wide rectangles rotated 45° so they cover full rotated width.
const STRIPE_COUNT = 14;
const STRIPE_GAP = 8;
function StripePattern() {
  return (
    <View style={{ flex: 1 }}>
      {Array.from({ length: STRIPE_COUNT }).map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: -ROW_H,
            left: -ROW_H + i * STRIPE_GAP,
            width: 1,
            height: ROW_H * 3,
            backgroundColor: 'rgba(124,140,170,.05)',
            transform: [{ rotate: '45deg' }],
          }}
        />
      ))}
    </View>
  );
}

export const TableRow = memo(TableRowImpl);

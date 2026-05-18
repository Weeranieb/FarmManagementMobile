import { memo } from 'react';
import { Pressable, View, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import {
  COLS,
  GROUP_LIGHT,
  MAINT,
  NAME_W,
  ROW_H,
  TABLE_SURFACE,
  VIBRANT_BRAND,
  colW,
  fmtTh,
  type ColKey,
} from '../constants';
import type { ActiveCell, PondRow } from '../hook';

type Props = {
  pond: PondRow;
  idx: number;
  activeCell: ActiveCell;
  onCellTap: (pondKey: string, col: ColKey) => void;
};

function TableRowImpl({ pond, idx, activeCell, onCellTap }: Props) {
  // Any locked row — whether `status === 'maintenance'` or `notYetActive`
  // (cycle hasn't started yet on the selected day) — uses the same striped
  // + central-lock visual so the table reads as a single "can't enter data
  // here" pattern. The pill text below the pond code distinguishes them
  // ("ซ่อมบำรุง" vs "ปิดบ่อ").
  if (pond.disabled) {
    return <LockedRow pond={pond} />;
  }

  return <ActiveRow pond={pond} idx={idx} activeCell={activeCell} onCellTap={onCellTap} />;
}

function ActiveRow({ pond, idx, activeCell, onCellTap }: Props) {
  const { t } = useTheme();

  const accentByState = {
    saved: t.fill,
    dirty: t.warn,
    empty: 'transparent',
  } as const;
  const accent = accentByState[pond.state];
  const zebra = idx % 2 === 1 ? TABLE_SURFACE.zebra : TABLE_SURFACE.even;
  const rowActive = activeCell?.pondKey === pond.key;
  const rowBg = rowActive ? VIBRANT_BRAND[50] : zebra;

  return (
    <View
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
          paddingHorizontal: 8,
          paddingVertical: 6,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderRightWidth: 1,
          borderRightColor: t.borderStrong,
        }}
      >
        <View
          style={{
            width: 3,
            height: 30,
            borderRadius: 2,
            backgroundColor: accent === 'transparent' ? t.border : accent,
          }}
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: type.familyBold,
              color: t.ink,
              letterSpacing: 0.1,
            }}
            numberOfLines={1}
          >
            {pond.id}
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontFamily: type.familyNum,
              color: t.inkSoft,
              marginTop: 1,
            }}
            numberOfLines={1}
          >
            {`${pond.stock.toLocaleString('th-TH')} ตัว`}
          </Text>
        </View>
      </View>

      {COLS.map((c) => {
        const g = GROUP_LIGHT[c.group];
        const cellDisabled =
          (c.group === 'pellet' && !pond.hasPellet) ||
          (c.group === 'fresh' && !pond.hasFresh);
        const value = pond.v[c.key];
        const isActive =
          activeCell?.pondKey === pond.key && activeCell?.col === c.key;
        // Zero == "no data" — mirrors saveAll's `hasAnyData` filter in hook.ts
        // so the cell visually agrees with what the backend will treat as a
        // skipped column.
        const filled = value !== '' && value != null && Number(value) !== 0;
        const bg = isActive
          ? TABLE_SURFACE.even
          : rowActive
            ? 'rgba(255,255,255,.55)'
            : filled
              ? 'transparent'
              : g.tint;

        return (
          <Pressable
            key={c.key}
            disabled={cellDisabled}
            onPress={() => !cellDisabled && onCellTap(pond.key, c.key)}
            style={{
              width: colW(c.key),
              backgroundColor: bg,
              borderWidth: isActive ? 2 : 0,
              borderColor: isActive ? VIBRANT_BRAND[600] : 'transparent',
              paddingHorizontal: 8,
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            {cellDisabled ? (
              <Text style={{ fontSize: 11, color: t.borderStrong }}>—</Text>
            ) : (
              <Text
                style={{
                  fontSize: filled ? 15.5 : 16,
                  fontFamily: filled ? type.familyNumSemi : type.familyNum,
                  color: filled ? t.ink : t.borderStrong,
                  lineHeight: 16,
                }}
              >
                {filled ? fmtTh(value as number) : '–'}
              </Text>
            )}
          </Pressable>
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
function LockedRow({ pond }: { pond: PondRow }) {
  const { t } = useTheme();
  const PillIcon = pond.maintenance ? Icon.wrench : Icon.lock;
  const pillLabel = pond.maintenance ? 'ซ่อมบำรุง' : 'ปิดบ่อ';
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
          paddingHorizontal: 8,
          paddingVertical: 6,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
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
        {COLS.map((c) => (
          <View
            key={c.key}
            style={{
              width: colW(c.key),
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
            backgroundColor: 'rgba(124,140,170,.10)',
            transform: [{ rotate: '45deg' }],
          }}
        />
      ))}
    </View>
  );
}

export const TableRow = memo(TableRowImpl);

import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { warnInk } from '@/theme/ink';
import { thaiDate } from '@/locale/thaiDate';
import { Tappable } from '@/components/ui';
import { DAY_W, ROW_H, LEDGER_LEAVES, colWash, fmtCell } from '../ui';
import type { CellValues } from '../hook';
import type { ColKey } from '@/screens/daily-log/constants';

type Props = {
  day: number;
  dow: number;
  values: CellValues;
  isToday: boolean;
  isFuture: boolean;
  editingCol: ColKey | null;
  hasEvent: boolean;
  /** Stable across renders (the hook's `openCell`) so the memo holds — the row
   *  passes its own `day`, tapping the day cell opens its first column. */
  onCell: (day: number, col: ColKey) => void;
};

/** One day-of-month row. Logged days show emphasized values; empty days recede
 *  to a faint "–"; today gets a brand rail; future is dimmed. Memoized: with a
 *  stable `values` ref + `onCell`, only the row being edited re-renders. */
export const LedgerDayRow = memo(function LedgerDayRow({
  day,
  dow,
  values,
  isToday,
  isFuture,
  editingCol,
  hasEvent,
  onCell,
}: Props) {
  const { t: tx } = useTranslation();
  const { t, mode } = useTheme();
  // "Logged" drives the emphasized treatment (bold day number, size-15 values).
  // Key it off what actually renders — fmtCell hides zeros — so an all-zero day
  // recedes like an empty one instead of looking emphasized-but-blank.
  const logged = LEDGER_LEAVES.some((l) => fmtCell(values[l.key]) != null);

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: t.border, opacity: isFuture ? 0.55 : 1 }}>
      <View style={{ flexDirection: 'row', height: ROW_H }}>
        <Tappable
          feedback="opacity"
          onPress={isFuture ? undefined : () => onCell(day, 'pm')}
          disabled={isFuture}
          accessibilityRole="button"
          accessibilityLabel={tx('daily.dayA11y', { day })}
          style={{
            width: DAY_W,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isToday ? t.brandSoft : 'transparent',
          }}
        >
          {isToday ? (
            <View
              style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 3, borderRadius: 2, backgroundColor: t.brand }}
            />
          ) : null}
          <Text
            style={{
              fontFamily: type.familyNumBold,
              fontSize: 15,
              lineHeight: 18,
              color: isFuture ? t.inkMute : isToday ? t.brandInk : logged ? t.ink : t.inkMute,
            }}
          >
            {day}
          </Text>
          <Text style={{ fontSize: 9.5, lineHeight: 12, color: t.inkMute, fontFamily: type.family }}>
            {thaiDate.weekdayShort(dow)}
          </Text>
          {hasEvent ? (
            <View
              style={{ position: 'absolute', top: 5, right: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: t.brand }}
            />
          ) : null}
        </Tappable>

        {LEDGER_LEAVES.map((l) => {
          const active = editingCol === l.key;
          const raw = values[l.key];
          const disp = isFuture ? null : fmtCell(raw);
          const show = disp != null;
          const emphasizeDeath = l.key === 'death' && Number(raw) > 0;
          const family = emphasizeDeath ? type.familyNumBold : show ? type.familyNumSemi : type.familyNum;
          return (
            <Tappable
              key={l.key}
              feedback="opacity"
              onPress={isFuture ? undefined : () => onCell(day, l.key)}
              disabled={isFuture}
              style={{
                flex: 1,
                borderLeftWidth: 1,
                borderLeftColor: t.border,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? t.brandSoft : colWash(l.group, t, mode),
              }}
            >
              <Text
                style={{
                  fontFamily: family,
                  fontSize: logged ? 15 : 13,
                  color: isFuture
                    ? 'transparent'
                    : show
                      ? emphasizeDeath
                        ? warnInk(mode, t)
                        : t.ink
                      : t.inkMute,
                  opacity: show ? 1 : 0.5,
                }}
              >
                {show ? disp : isFuture ? '' : '–'}
              </Text>
              {active ? (
                <View
                  pointerEvents="none"
                  style={[StyleSheet.absoluteFillObject, { borderWidth: 2, borderColor: t.brand }]}
                />
              ) : null}
            </Tappable>
          );
        })}
      </View>
    </View>
  );
});

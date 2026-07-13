import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { warnInk } from '@/theme/ink';
import { thaiDate } from '@/locale/thaiDate';
import { DAY_W, ROW_H_LOGGED, ROW_H_EMPTY, LEDGER_LEAVES, colWash, fmtCell } from '../ui';
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
  onCell: (col: ColKey) => void;
  onOpenDay: () => void;
};

/** One day-of-month row. Logged days sit taller with emphasized values; empty
 *  days recede to a short faint "–"; today gets a brand rail; future is dimmed. */
export function LedgerDayRow({
  day,
  dow,
  values,
  isToday,
  isFuture,
  editingCol,
  hasEvent,
  onCell,
  onOpenDay,
}: Props) {
  const { t, mode } = useTheme();
  const logged = LEDGER_LEAVES.some((l) => values[l.key] !== '');
  const rowH = logged ? ROW_H_LOGGED : ROW_H_EMPTY;

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: t.border, opacity: isFuture ? 0.55 : 1 }}>
      <View style={{ flexDirection: 'row', height: rowH }}>
        <Pressable
          onPress={isFuture ? undefined : onOpenDay}
          disabled={isFuture}
          accessibilityRole="button"
          accessibilityLabel={`วันที่ ${day}`}
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
        </Pressable>

        {LEDGER_LEAVES.map((l) => {
          const active = editingCol === l.key;
          const raw = values[l.key];
          const disp = isFuture ? null : fmtCell(raw);
          const show = disp != null;
          const emphasizeDeath = l.key === 'death' && Number(raw) > 0;
          const family = emphasizeDeath ? type.familyNumBold : show ? type.familyNumSemi : type.familyNum;
          return (
            <Pressable
              key={l.key}
              onPress={isFuture ? undefined : () => onCell(l.key)}
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
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

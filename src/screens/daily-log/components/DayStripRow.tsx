import { useEffect, useMemo, useRef } from 'react';
import { Pressable, ScrollView, View, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { toIsoDate } from '@/shared/time';
import { CHROME, DAY_PILL_H, DAY_STRIP_PAD_V, VIBRANT_BRAND, thDow } from '../constants';

type Props = {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  /** Set of YYYY-MM-DD keys that have unsaved local edits. Pills for these
   *  days show a small amber dot so the user can navigate back. */
  daysWithDrafts?: ReadonlySet<string>;
};

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const PILL_WIDTH = 42;
const PILL_GAP = 6;
const STRIP_PADDING = 14;

export function DayStripRow({ selectedDate, onSelectDate, daysWithDrafts }: Props) {
  const { t } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Build the list of valid days for the SELECTED MONTH (1 .. last day).
  // `new Date(year, month + 1, 0).getDate()` gives the last day of the
  // selected month — handles 28/29/30/31 correctly without manual rules.
  const days = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const out: { date: Date; num: number; dow: string }[] = [];
    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(year, month, d);
      out.push({ date, num: d, dow: thDow(date.getDay()) });
    }
    return out;
  }, [selectedDate]);

  // Auto-scroll so the selected date is roughly centered when the month changes.
  useEffect(() => {
    const idx = days.findIndex((d) => sameDay(d.date, selectedDate));
    if (idx < 0) return;
    const x = Math.max(0, idx * (PILL_WIDTH + PILL_GAP) - 140);
    scrollRef.current?.scrollTo({ x, animated: true });
  }, [days, selectedDate]);

  return (
    <View
      style={{
        height: CHROME.day,
        paddingTop: DAY_STRIP_PAD_V,
        paddingBottom: DAY_STRIP_PAD_V,
        backgroundColor: t.surface,
      }}
    >
      <ScrollView
        delaysContentTouches={false}
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: STRIP_PADDING,
          alignItems: 'center',
        }}
      >
        {days.map((d, i) => {
          const isSelected = sameDay(d.date, selectedDate);
          const isToday = sameDay(d.date, today);
          const isFuture = d.date.getTime() > today.getTime();
          const hasDraft = daysWithDrafts?.has(toIsoDate(d.date)) ?? false;
          return (
            <Pressable
              key={i}
              onPress={() => onSelectDate(d.date)}
              disabled={isFuture}
              style={{
                width: PILL_WIDTH,
                height: DAY_PILL_H,
                borderRadius: 14,
                marginRight: PILL_GAP,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isSelected ? VIBRANT_BRAND[600] : t.surface,
                borderWidth: isSelected ? 0 : 1,
                borderColor: isToday ? VIBRANT_BRAND[600] : t.border,
                opacity: isFuture ? 0.4 : 1,
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: isSelected ? 1 : 0 },
                shadowOpacity: isSelected ? 0.08 : 0.04,
                shadowRadius: isSelected ? 2 : 1,
                elevation: isSelected ? 1 : 0,
              }}
              accessibilityRole="button"
              accessibilityLabel={d.date.toDateString()}
              accessibilityState={{ disabled: isFuture, selected: isSelected }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: type.familySemi,
                  color: isSelected ? '#fff' : t.inkSoft,
                  letterSpacing: 0.3,
                }}
              >
                {d.dow}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: type.familyNumBold,
                  color: isSelected ? '#fff' : t.ink,
                  marginTop: 1,
                }}
              >
                {d.num}
              </Text>
              {isSelected ? (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 5,
                    width: 14,
                    height: 3,
                    borderRadius: 999,
                    backgroundColor: 'rgba(255,255,255,.55)',
                  }}
                />
              ) : null}
              {hasDraft ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 6,
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: isSelected ? '#fff' : t.warn,
                  }}
                />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

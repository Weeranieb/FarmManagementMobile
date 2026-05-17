import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { TH_MONTH_NAMES_SHORT, thaiDate, TH_WEEKDAYS_SHORT } from '@/locale/thaiDate';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';

type Props = {
  value: Date;
  onChange: (next: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
};

type Panel = 'days' | 'monthYear';

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function clampDate(d: Date, minimumDate?: Date, maximumDate?: Date): Date {
  let next = startOfDay(d);
  if (maximumDate && next.getTime() > startOfDay(maximumDate).getTime()) {
    next = startOfDay(maximumDate);
  }
  if (minimumDate && next.getTime() < startOfDay(minimumDate).getTime()) {
    next = startOfDay(minimumDate);
  }
  return next;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isDisabledDay(day: Date, minimumDate?: Date, maximumDate?: Date): boolean {
  const t = startOfDay(day).getTime();
  if (minimumDate && t < startOfDay(minimumDate).getTime()) return true;
  if (maximumDate && t > startOfDay(maximumDate).getTime()) return true;
  return false;
}

function isMonthDisabled(
  year: number,
  month: number,
  minimumDate?: Date,
  maximumDate?: Date,
): boolean {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  if (maximumDate && startOfDay(first).getTime() > startOfDay(maximumDate).getTime()) return true;
  if (minimumDate && startOfDay(last).getTime() < startOfDay(minimumDate).getTime()) return true;
  return false;
}

function canShiftMonth(
  viewMonth: Date,
  delta: number,
  minimumDate?: Date,
  maximumDate?: Date,
): boolean {
  const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1);
  if (maximumDate && startOfMonth(next).getTime() > startOfMonth(maximumDate).getTime())
    return false;
  if (minimumDate && startOfMonth(next).getTime() < startOfMonth(minimumDate).getTime())
    return false;
  return true;
}

function canShiftYear(
  year: number,
  delta: number,
  minimumDate?: Date,
  maximumDate?: Date,
): boolean {
  const nextYear = year + delta;
  if (maximumDate && nextYear > maximumDate.getFullYear()) return false;
  if (minimumDate && nextYear < minimumDate.getFullYear()) return false;
  return true;
}

function buildMonthCells(viewMonth: Date): (Date | null)[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = new Date(year, month, 1).getDay();
  const cells: (Date | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function dateInMonth(value: Date, year: number, month: number, maximumDate?: Date): Date {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const day = Math.min(value.getDate(), lastDay);
  return clampDate(new Date(year, month, day), undefined, maximumDate);
}

/**
 * Centered month calendar with Thai labels and Buddhist year (พ.ศ.).
 * Tap month/year header to pick month and year; future dates are disabled via maximumDate.
 */
export function InlineThaiCalendar({ value, onChange, minimumDate, maximumDate }: Props) {
  const { t } = useTheme();
  const [panel, setPanel] = useState<Panel>('days');
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(value));
  const [viewYear, setViewYear] = useState(() => value.getFullYear());

  useEffect(() => {
    setViewMonth(startOfMonth(value));
    setViewYear(value.getFullYear());
  }, [value.getTime()]);

  const cells = useMemo(() => buildMonthCells(viewMonth), [viewMonth]);
  const today = useMemo(() => startOfDay(new Date()), []);

  const shiftMonth = (delta: number) => {
    if (!canShiftMonth(viewMonth, delta, minimumDate, maximumDate)) return;
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const shiftYear = (delta: number) => {
    if (!canShiftYear(viewYear, delta, minimumDate, maximumDate)) return;
    setViewYear((y) => y + delta);
  };

  const openMonthYear = () => {
    setViewYear(viewMonth.getFullYear());
    setPanel('monthYear');
  };

  const selectMonth = (month: number) => {
    if (isMonthDisabled(viewYear, month, minimumDate, maximumDate)) return;
    const nextMonth = new Date(viewYear, month, 1);
    setViewMonth(nextMonth);
    onChange(dateInMonth(value, viewYear, month, maximumDate));
    setPanel('days');
  };

  const navBtn = (enabled: boolean) => ({
    width: 36,
    height: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    opacity: enabled ? 1 : 0.25,
  });

  if (panel === 'monthYear') {
    return (
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <Row justify="space-between" style={{ alignItems: 'center', marginBottom: 16 }}>
          <Pressable
            onPress={() => setPanel('days')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="กลับไปเลือกวัน"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Icon.chevL size={18} color={t.brand} />
            <Text style={{ fontFamily: type.familySemi, fontSize: 16, color: t.ink }}>
              เลือกเดือนและปี
            </Text>
          </Pressable>
          <Row gap={4}>
            <Pressable
              onPress={() => shiftYear(-1)}
              disabled={!canShiftYear(viewYear, -1, minimumDate, maximumDate)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="ปีก่อนหน้า"
              style={navBtn(canShiftYear(viewYear, -1, minimumDate, maximumDate))}
            >
              <Icon.chevL size={20} color={t.brand} />
            </Pressable>
            <Text
              style={{
                fontFamily: type.familyBold,
                fontSize: 16,
                color: t.ink,
                minWidth: 56,
                textAlign: 'center',
              }}
            >
              {viewYear + 543}
            </Text>
            <Pressable
              onPress={() => shiftYear(1)}
              disabled={!canShiftYear(viewYear, 1, minimumDate, maximumDate)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="ปีถัดไป"
              style={navBtn(canShiftYear(viewYear, 1, minimumDate, maximumDate))}
            >
              <Icon.chevR size={20} color={t.brand} />
            </Pressable>
          </Row>
        </Row>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {TH_MONTH_NAMES_SHORT.map((label, month) => {
            const selected = value.getFullYear() === viewYear && value.getMonth() === month;
            const disabled = isMonthDisabled(viewYear, month, minimumDate, maximumDate);
            return (
              <Pressable
                key={label}
                onPress={() => selectMonth(month)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled }}
                style={{
                  width: '25%',
                  paddingVertical: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: selected ? t.brand : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: selected ? type.familyBold : type.familyMedium,
                      fontSize: 14,
                      color: disabled ? t.inkMute : selected ? '#fff' : t.ink,
                      opacity: disabled ? 0.35 : 1,
                    }}
                  >
                    {label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
      <Row justify="space-between" style={{ alignItems: 'center', marginBottom: 12 }}>
        <Pressable
          onPress={openMonthYear}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="เลือกเดือนและปี"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <Text style={{ fontFamily: type.familySemi, fontSize: 16, color: t.ink }}>
            {thaiDate.monthYear(viewMonth)}
          </Text>
          <Icon.chevR size={16} color={t.brand} />
        </Pressable>
        <Row gap={4}>
          <Pressable
            onPress={() => shiftMonth(-1)}
            disabled={!canShiftMonth(viewMonth, -1, minimumDate, maximumDate)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="เดือนก่อนหน้า"
            style={navBtn(canShiftMonth(viewMonth, -1, minimumDate, maximumDate))}
          >
            <Icon.chevL size={20} color={t.brand} />
          </Pressable>
          <Pressable
            onPress={() => shiftMonth(1)}
            disabled={!canShiftMonth(viewMonth, 1, minimumDate, maximumDate)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="เดือนถัดไป"
            style={navBtn(canShiftMonth(viewMonth, 1, minimumDate, maximumDate))}
          >
            <Icon.chevR size={20} color={t.brand} />
          </Pressable>
        </Row>
      </Row>

      <Row>
        {TH_WEEKDAYS_SHORT.map((label) => (
          <View key={label} style={{ flex: 1, alignItems: 'center', paddingBottom: 8 }}>
            <Text style={{ fontFamily: type.familyMedium, fontSize: 12, color: t.inkMute }}>
              {label}
            </Text>
          </View>
        ))}
      </Row>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, index) => {
          if (!day) {
            return <View key={`empty-${index}`} style={{ width: '14.2857%', height: 44 }} />;
          }

          const selected = isSameDay(day, value);
          const disabled = isDisabledDay(day, minimumDate, maximumDate);
          const isToday = isSameDay(day, today);

          return (
            <Pressable
              key={day.toISOString()}
              onPress={() => !disabled && onChange(day)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
              accessibilityLabel={thaiDate.long(day)}
              style={{
                width: '14.2857%',
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selected ? t.brand : 'transparent',
                  borderWidth: isToday && !selected ? 1.5 : 0,
                  borderColor: isToday && !selected ? t.brand : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontFamily: selected ? type.familyBold : type.familyNum,
                    fontSize: 15,
                    color: disabled ? t.inkMute : selected ? '#fff' : t.ink,
                    opacity: disabled ? 0.35 : 1,
                  }}
                >
                  {day.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

import { useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { thaiDate } from '@/locale/thaiDate';
import { fmt, FISH_TH } from '@/utils/fmt';
import { Numpad } from '@/screens/daily-log/components/Numpad';
import { SaveBar } from '@/screens/daily-log/components/SaveBar';
import { LedgerTableHeader } from './components/LedgerTableHeader';
import { LedgerDayRow } from './components/LedgerDayRow';
import { DayAnnotation } from './components/DayAnnotation';
import { MonthStatStrip } from './components/MonthStatStrip';
import { TotalsRow } from './components/TotalsRow';
import type { PondLedgerState } from './hook';

export function PondLedgerView({ state, onBack }: { state: PondLedgerState; onBack?: () => void }) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    pond,
    isLoading,
    isError,
    monthDate,
    nDays,
    year,
    m0,
    isCurrentMonth,
    todayDate,
    valuesForDay,
    totals,
    eventsByDay,
    dirtyDays,
    invalidCount,
    editing,
    lastUsedFeedId,
    isLastCell,
    isFutureDay,
    canGoPrev,
    setCell,
    openCell,
    advance,
    closeKeypad,
    goPrevMonth,
    goNextMonth,
    save,
  } = state;

  const fishType = pond?.fishTypes?.[0] ? FISH_TH[pond.fishTypes[0]] ?? pond.fishTypes[0] : '';
  const subtitle = [pond?.farmName, fishType, pond ? `${fmt.num(pond.totalFish)} ตัว` : '']
    .filter(Boolean)
    .join(' · ');

  const scrollRef = useRef<ScrollView>(null);
  const rowY = useRef<Record<number, number>>({});
  const editingDay = editing?.day ?? null;
  useEffect(() => {
    // Lift the row being edited above the keypad sheet (it covers the lower
    // half of the screen), so the live value + active-cell ring stay visible.
    if (editingDay == null) return;
    const y = rowY.current[editingDay];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
  }, [editingDay]);

  const denom = isCurrentMonth ? todayDate : nDays;
  const days = Array.from({ length: nDays }, (_, i) => i + 1);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* fixed chrome */}
      <View style={{ backgroundColor: t.bg }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 12,
            paddingTop: 8,
            paddingBottom: 10,
          }}
        >
          {onBack ? <IconBtn onPress={onBack} icon="back" label="ย้อนกลับ" /> : null}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontFamily: type.familyBold, fontSize: 18, lineHeight: 24, color: t.ink }}>
              {pond?.name ?? 'บ่อ'}
            </Text>
            {subtitle ? (
              <Text numberOfLines={1} style={{ fontSize: 11.5, lineHeight: 16, color: t.inkMute, fontFamily: type.family }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <IconBtn onPress={goPrevMonth} icon="chevL" label="เดือนก่อน" size={34} disabled={!canGoPrev} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontFamily: type.familyBold, fontSize: 15, lineHeight: 22, color: t.ink }}>
                {thaiDate.monthYear(monthDate)}
              </Text>
            </View>
            <IconBtn onPress={goNextMonth} icon="chevR" label="เดือนถัดไป" size={34} disabled={isCurrentMonth} />
          </View>
          <View style={{ height: 6 }} />
          <MonthStatStrip loggedDays={totals.loggedDays} denom={denom} feedKg={totals.feedKg} death={totals.death} />
        </View>

        <LedgerTableHeader />
      </View>

      {/* rows */}
      {isLoading ? (
        <Centered text="กำลังโหลดตาราง…" />
      ) : isError ? (
        <Centered text="โหลดข้อมูลไม่สำเร็จ — โปรดลองใหม่" />
      ) : (
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: (dirtyDays.length ? 96 : 24) + insets.bottom }}
        >
          {days.map((day) => {
            const dow = new Date(year, m0, day).getDay();
            const events = eventsByDay[day];
            const future = isFutureDay(day);
            return (
              <View
                key={day}
                onLayout={(e) => {
                  rowY.current[day] = e.nativeEvent.layout.y;
                }}
              >
                <LedgerDayRow
                  day={day}
                  dow={dow}
                  values={valuesForDay(day)}
                  isToday={isCurrentMonth && day === todayDate}
                  isFuture={future}
                  editingCol={editing?.day === day ? editing.col : null}
                  hasEvent={!!events?.length}
                  onCell={(col) => openCell(day, col)}
                  onOpenDay={() => openCell(day, 'pm')}
                />
                {events?.length && !future ? <DayAnnotation events={events} /> : null}
              </View>
            );
          })}
          <TotalsRow totals={totals} />
          <View style={{ height: 10 }} />
        </ScrollView>
      )}

      {/* month save bar (hidden while the keypad — with its own commit — is up) */}
      {dirtyDays.length > 0 && !editing ? (
        <SaveBar
          daysCount={dirtyDays.length}
          editsCount={dirtyDays.length}
          invalidCount={invalidCount}
          onSavePress={save}
          bottomInset={insets.bottom}
        />
      ) : null}

      {/* inline keypad */}
      {editing ? (
        <Numpad
          visible
          pondId={pond?.name ?? ''}
          col={editing.col}
          initialValue={valuesForDay(editing.day)[editing.col]}
          lastUsedFeedId={lastUsedFeedId}
          isLastCell={isLastCell}
          bottomInset={insets.bottom}
          onChange={(v) => setCell(editing.day, editing.col, v)}
          onCancel={closeKeypad}
          onCommit={(v, feedId) => {
            setCell(editing.day, editing.col, v, feedId);
            closeKeypad();
          }}
          onNext={(v, feedId) => {
            setCell(editing.day, editing.col, v, feedId);
            advance();
          }}
        />
      ) : null}
    </View>
  );
}

function IconBtn({
  onPress,
  icon,
  label,
  size = 38,
  disabled,
}: {
  onPress: () => void;
  icon: keyof typeof Icon;
  label: string;
  size?: number;
  disabled?: boolean;
}) {
  const { t } = useTheme();
  const IconCmp = Icon[icon];
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: t.border,
        backgroundColor: t.surface,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <IconCmp size={size >= 38 ? 20 : 16} color={t.inkSoft} />
    </Pressable>
  );
}

function Centered({ text }: { text: string }) {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 15, lineHeight: 24, color: t.inkSoft, fontFamily: type.family, textAlign: 'center' }}>
        {text}
      </Text>
    </View>
  );
}

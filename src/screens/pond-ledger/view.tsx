import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Tappable } from '@/components/ui';
import { thaiDate } from '@/locale/thaiDate';
import { fmt, FISH_TH } from '@/utils/fmt';
import { Numpad } from '@/screens/daily-log/components/Numpad';
import { SaveBar } from '@/screens/daily-log/components/SaveBar';
import { MonthYearPickerSheet } from '@/screens/daily-log/components/MonthYearPickerSheet';
import { ConfirmMonthSaveSheet } from '@/screens/daily-log/components/ConfirmMonthSaveSheet';
import { UnsavedChangesDialog } from '@/screens/daily-log/components/UnsavedChangesDialog';
import {
  SaveStatusToast,
  type SaveToastStatus,
} from '@/screens/daily-log/components/SaveStatusToast';
import { numpadSheetHeight } from '@/screens/daily-log/constants';
import { LedgerTableHeader } from './components/LedgerTableHeader';
import { LedgerDayRow } from './components/LedgerDayRow';
import { DayAnnotation } from './components/DayAnnotation';
import { MonthStatStrip } from './components/MonthStatStrip';
import { TotalsRow } from './components/TotalsRow';
import { ROW_H } from './ui';
import type { PondLedgerState } from './hook';

// Breathing room kept between the lifted row and the top edge of the numpad
// sheet, so the active cell sits clearly separated from the keypad rather than
// hugging its top edge. Exactly one row-height: a fixed dp gap reads
// consistently across screen sizes (a screen-relative gap would look bigger on
// small devices, smaller on large), and deriving it from ROW_H keeps it honest
// instead of a magic number — the earlier 64 was ~1.45 rows and read as too
// much empty space on shorter (iOS) viewports.
const NUMPAD_REVEAL_MARGIN = 1.2 * ROW_H;

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
    saveSummary,
    editing,
    lastUsedFeedId,
    isLastCell,
    isFutureDay,
    canGoPrev,
    startYm,
    todayYm,
    setCell,
    openCell,
    advance,
    closeKeypad,
    goPrevMonth,
    goNextMonth,
    goToMonth,
    save,
    discardMonth,
  } = state;

  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<{
    status: SaveToastStatus;
    days: number;
    error?: string;
  } | null>(null);

  const runSave = useCallback(async () => {
    if (saveToast?.status === 'saving') return; // single-flight guard
    const days = dirtyDays.length; // snapshot before drafts clear on success
    setConfirmOpen(false);
    setSaveToast({ status: 'saving', days });
    const result = await save();
    setSaveToast(
      result.ok ? { status: 'success', days } : { status: 'error', days, error: result.error },
    );
  }, [saveToast, dirtyDays.length, save]);
  const dismissToast = useCallback(() => setSaveToast(null), []);

  // Prompt when leaving with drafts (nav/back tappable behind keypad).
  type LeaveIntent =
    | { kind: 'prev' }
    | { kind: 'next' }
    | { kind: 'goto'; y: number; m: number }
    | { kind: 'back' };
  const [leave, setLeave] = useState<LeaveIntent | null>(null);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  const doLeave = useCallback(
    (intent: LeaveIntent) => {
      if (intent.kind === 'prev') goPrevMonth();
      else if (intent.kind === 'next') goNextMonth();
      else if (intent.kind === 'goto') goToMonth(intent.y, intent.m);
      else onBack?.();
    },
    [goPrevMonth, goNextMonth, goToMonth, onBack],
  );

  const requestLeave = useCallback(
    (intent: LeaveIntent) => {
      if (dirtyDays.length > 0) {
        closeKeypad();
        setLeaveError(null);
        setLeave(intent);
        return;
      }
      doLeave(intent);
    },
    [dirtyDays.length, closeKeypad, doLeave],
  );

  const onLeaveDiscard = useCallback(() => {
    const intent = leave;
    if (!intent) return;
    setLeave(null);
    discardMonth();
    doLeave(intent);
  }, [leave, discardMonth, doLeave]);

  const onLeaveSaveAndExit = useCallback(async () => {
    const intent = leave;
    if (!intent) return;
    if (invalidCount > 0) {
      setLeaveError('มีค่าที่เกินกำหนด แก้ไขก่อนจึงจะบันทึกได้');
      return;
    }
    const result = await save();
    if (result.ok) {
      setLeave(null);
      doLeave(intent);
    } else {
      setLeaveError(result.error ?? 'บันทึกไม่สำเร็จ — โปรดลองใหม่');
    }
  }, [leave, invalidCount, save, doLeave]);

  const onLeaveDismiss = useCallback(() => {
    setLeave(null);
    setLeaveError(null);
  }, []);

  const fishType = pond?.fishTypes?.[0] ? (FISH_TH[pond.fishTypes[0]] ?? pond.fishTypes[0]) : '';
  const subtitle = [pond?.farmName, fishType, pond ? `${fmt.num(pond.totalFish)} ตัว` : '']
    .filter(Boolean)
    .join(' · ');

  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const rowNodes = useRef<Record<number, View | null>>({});
  const rowY = useRef<Record<number, number>>({}); // content offset (y within scroll content) per day
  // Numpad feed pick — written with the amount on every keystroke.
  const liveFeedIdRef = useRef<number | null>(null);
  const onNumpadFeedChange = useCallback((feedId: number | null) => {
    liveFeedIdRef.current = feedId;
  }, []);
  // Actual rendered numpad height, measured on layout (Numpad's `onHeight`).
  // Drives both the scroll-to-reveal target and the scroll padding so the
  // edited cell clears the *real* keypad — correct on any screen size /
  // density / column, not the `numpadSheetHeight` estimate. Falls back to that
  // estimate only for the first frame before the sheet has measured.
  const [numpadH, setNumpadH] = useState(0);
  const editingDay = editing?.day ?? null;
  useEffect(() => {
    // Keyboard-style avoidance: when a cell becomes active, measure the row and
    // scroll only if it's outside the band between the table top and the numpad
    // sheet — DOWN to lift it clear of the keypad, or UP when "ถัดไป" wraps back
    // to an earlier day that's scrolled off the top. Rows already in view don't
    // move. Bottom padding (below) guarantees the last day can lift clear.
    if (editingDay == null) return;
    const node = rowNodes.current[editingDay];
    const contentY = rowY.current[editingDay];
    if (!node || contentY == null) return;
    node.measureInWindow((_x, y) => {
      const screenH = Dimensions.get('window').height;
      const sheetH = numpadH || numpadSheetHeight(insets.bottom);
      const sheetTop = screenH - sheetH;
      // Derive the scroll area's on-screen top from this row:
      // windowY = areaTop + (contentY − scrollY)  ⇒  areaTop = windowY − contentY + scrollY.
      const areaTop = y - contentY + scrollYRef.current;
      const rowTop = y;
      const rowBottom = y + ROW_H;
      let delta = 0;
      if (rowBottom > sheetTop - NUMPAD_REVEAL_MARGIN) {
        delta = rowBottom - (sheetTop - NUMPAD_REVEAL_MARGIN); // below the sheet → scroll down
      } else if (rowTop < areaTop + NUMPAD_REVEAL_MARGIN) {
        delta = rowTop - (areaTop + NUMPAD_REVEAL_MARGIN); // above the table → scroll up (negative)
      } else {
        return; // comfortably visible — leave it
      }
      scrollRef.current?.scrollTo({ y: Math.max(0, scrollYRef.current + delta), animated: true });
    });
  }, [editingDay, insets.bottom, numpadH]);

  const denom = isCurrentMonth ? todayDate : nDays;
  // Day number + weekday, computed once per month (not per keystroke render) so
  // editing doesn't re-allocate ~31 Date objects on every keypress.
  const dayMeta = useMemo(
    () =>
      Array.from({ length: nDays }, (_, i) => ({
        day: i + 1,
        dow: new Date(year, m0, i + 1).getDay(),
      })),
    [nDays, year, m0],
  );

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
          {onBack ? (
            <IconBtn onPress={() => requestLeave({ kind: 'back' })} icon="back" label="ย้อนกลับ" />
          ) : null}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{ fontFamily: type.familyBold, fontSize: 18, lineHeight: 24, color: t.ink }}
            >
              {pond ? `บ่อ ${pond.name}` : 'บ่อ'}
            </Text>
            {subtitle ? (
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 11.5,
                  lineHeight: 16,
                  color: t.inkMute,
                  fontFamily: type.family,
                }}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <IconBtn
              onPress={() => requestLeave({ kind: 'prev' })}
              icon="chevL"
              label="เดือนก่อน"
              size={34}
              disabled={!canGoPrev}
            />
            <Tappable
              onPress={() => setPickerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`เลือกเดือน · ปี · ${thaiDate.monthYear(monthDate)}`}
              style={{
                flex: 1,
                height: 34,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Text
                style={{ fontFamily: type.familyBold, fontSize: 15, lineHeight: 22, color: t.ink }}
              >
                {thaiDate.monthYear(monthDate)}
              </Text>
              <Icon.arrowDown size={13} color={t.inkSoft} />
            </Tappable>
            <IconBtn
              onPress={() => requestLeave({ kind: 'next' })}
              icon="chevR"
              label="เดือนถัดไป"
              size={34}
              disabled={isCurrentMonth}
            />
          </View>
          <View style={{ height: 6 }} />
          <MonthStatStrip
            loggedDays={totals.loggedDays}
            denom={denom}
            feedKg={totals.feedKg}
            death={totals.death}
          />
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
          scrollEventThrottle={16}
          onScroll={(e) => {
            scrollYRef.current = e.nativeEvent.contentOffset.y;
          }}
          contentContainerStyle={{
            // While editing, reserve the sheet's height so any row — including
            // the last day of the month — can scroll up clear of the numpad.
            paddingBottom: editing
              ? (numpadH || numpadSheetHeight(insets.bottom)) + 24
              : (dirtyDays.length ? 96 : 24) + insets.bottom,
          }}
        >
          {dayMeta.map(({ day, dow }) => {
            const events = eventsByDay[day];
            const future = isFutureDay(day);
            return (
              <View
                key={day}
                ref={(node) => {
                  rowNodes.current[day] = node;
                }}
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
                  onCell={openCell}
                />
                {events?.length && !future ? <DayAnnotation events={events} /> : null}
              </View>
            );
          })}
          <TotalsRow totals={totals} />
          <View style={{ height: 10 }} />
        </ScrollView>
      )}

      {/* Save flow (mirrors the farm daily-log): SaveBar → confirm summary sheet
          → status toast (saving → success/error). The toast is state-driven so
          it survives the drafts clearing on success. SaveBar hides while the
          keypad — which has its own commit — is up. */}
      {saveToast ? (
        <SaveStatusToast
          status={saveToast.status}
          days={saveToast.days}
          message={saveToast.error}
          bottom={insets.bottom}
          onRetry={runSave}
          onDismiss={dismissToast}
        />
      ) : dirtyDays.length > 0 && !editing ? (
        <SaveBar
          daysCount={dirtyDays.length}
          editsCount={dirtyDays.length}
          invalidCount={invalidCount}
          onSavePress={() => setConfirmOpen(true)}
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
          cellKey={`${editing.day}:${editing.col}`}
          lastUsedFeedId={lastUsedFeedId}
          isLastCell={isLastCell}
          bottomInset={insets.bottom}
          onHeight={setNumpadH}
          onFeedChange={onNumpadFeedChange}
          onChange={(v) => setCell(editing.day, editing.col, v, liveFeedIdRef.current)}
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

      {/* month · year picker — clamped to the pond's cycle (no earlier than
          เริ่มรอบ, no future months) */}
      <MonthYearPickerSheet
        visible={pickerOpen}
        current={{ y: year, m: m0 }}
        today={todayYm}
        outOfRangeBefore={startYm}
        bottomInset={insets.bottom}
        onClose={() => setPickerOpen(false)}
        onConfirm={(y, monthIdx) => {
          setPickerOpen(false);
          if (y === year && monthIdx === m0) return; // same month — nothing to leave
          requestLeave({ kind: 'goto', y, m: monthIdx });
        }}
      />

      {/* pre-save summary — confirm before the upsert */}
      {confirmOpen ? (
        <ConfirmMonthSaveSheet
          visible={confirmOpen}
          summary={saveSummary}
          bottomInset={insets.bottom}
          showPondCount={false}
          showOfflineNote={false}
          onClose={() => setConfirmOpen(false)}
          onConfirm={runSave}
        />
      ) : null}

      <UnsavedChangesDialog
        visible={leave !== null}
        dirtyCount={dirtyDays.length}
        unit="วัน"
        source={leave?.kind === 'back' ? 'back' : 'month'}
        error={leaveError}
        onDismiss={onLeaveDismiss}
        onDiscard={onLeaveDiscard}
        onSaveAndExit={onLeaveSaveAndExit}
      />
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
    <Tappable
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
    </Tappable>
  );
}

function Centered({ text }: { text: string }) {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text
        style={{
          fontSize: 15,
          lineHeight: 24,
          color: t.inkSoft,
          fontFamily: type.family,
          textAlign: 'center',
        }}
      >
        {text}
      </Text>
    </View>
  );
}

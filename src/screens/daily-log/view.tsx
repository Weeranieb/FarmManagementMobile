import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  InteractionManager,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { FarmModel } from '@/features/farm';
import { AppBar } from './components/AppBar';
import { CollapsingChrome } from './components/CollapsingChrome';
import { ConfirmSaveSheet } from './components/ConfirmSaveSheet';
import { FarmPickerSheet, type FarmOption } from './components/FarmPickerSheet';
import {
  MonthYearPickerSheet,
  type MonthMarksMap,
} from './components/MonthYearPickerSheet';
import { Numpad } from './components/Numpad';
import { SaveBar } from './components/SaveBar';
import { TableHeader } from './components/TableHeader';
import { TableRow } from './components/TableRow';
import { UnsavedChangesDialog } from './components/UnsavedChangesDialog';
import { CHROME, CHROME_SCROLL, COLS, NAME_W, ROW_H, TABLE_W, colW, thMonth } from './constants';
import type { SaveResult, UseDailyLogV6 } from './hook';

function formatSaveError(result: SaveResult): string {
  // Prefer the backend's wrapped detail when present — it names the actual
  // missing field. Fall back to a code-specific hint, then to the generic
  // network copy.
  if (result.errorDetails) {
    return `บันทึกไม่สำเร็จ — ${result.errorDetails}`;
  }
  if (result.errorCode === '500010') {
    return 'บันทึกไม่สำเร็จ — บ่อนี้ยังไม่ได้ตั้งค่าชนิดอาหาร';
  }
  return 'บันทึกไม่สำเร็จ — ตรวจสอบสัญญาณแล้วลองอีกครั้ง';
}

type Pending = { kind: 'month'; delta: number } | { kind: 'farm'; farmId: number };

type Props = {
  state: UseDailyLogV6;
  farmName: string;
  farms: FarmModel[];
  activeFarmId: number | null;
  onChangeFarm: (id: number) => void;
  onBack?: () => void;
  /** Bottom safe-area inset — added under the floating SaveBar and to the
   *  scroll content so the last row clears it. 0 on tablet (its pane already
   *  sits inside a bottom-edge SafeAreaView). */
  bottomInset?: number;
};

const SAVE_BAR_HEIGHT_PADDING = 96;

export function DailyLogView({
  state,
  farmName,
  farms,
  activeFarmId,
  onChangeFarm,
  onBack,
  bottomInset = 0,
}: Props) {
  const { t } = useTheme();

  const {
    ponds,
    loading,
    selectedDate,
    setSelectedDate,
    activeCell,
    setActiveCell,
    dirtyCount,
    savedCount,
    invalidCount,
    total,
    unsavedMonths,
    daysWithDrafts,
    setCellValue,
    setFeedSelection,
    previousValueForActiveCell,
    lastUsedFeedIdForActiveCell,
    advanceActive,
    saveAll,
    discardDirty,
  } = state;

  const verticalRef = useRef<ScrollView>(null);
  const headerHRef = useRef<ScrollView>(null);

  const tableWidth = TABLE_W;

  const onRowsHorizontalScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    headerHRef.current?.scrollTo({ x, animated: false });
  }, []);

  // scrollT ∈ [0, 1] — collapse progress driven by JS-thread onScroll.
  // Plain useState (not Reanimated SharedValue) so the chrome animates
  // without any worklet compilation dependency.
  const [scrollT, setScrollT] = useState(0);
  // Defer the heavy table body (each maintenance row paints ~14 rotated stripe
  // Views — dozens of ponds × cols = hundreds of Views) until the push has
  // presented. The first frame renders only the cheap chrome + skeleton, so the
  // native slide starts immediately instead of waiting on the full grid commit;
  // the real rows mount one tick later behind the skeleton.
  const [contentReady, setContentReady] = useState(false);
  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => setContentReady(true));
    return () => handle.cancel();
  }, []);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const dateLabel = useMemo(
    () =>
      `${selectedDate.getDate()} ${thMonth(selectedDate.getMonth()).slice(0, 3)}. ${selectedDate.getFullYear() + 543}`,
    [selectedDate],
  );

  const nextMonthDisabled = useMemo(() => {
    const now = new Date();
    const cur = now.getFullYear() * 12 + now.getMonth();
    const sel = selectedDate.getFullYear() * 12 + selectedDate.getMonth();
    return sel >= cur;
  }, [selectedDate]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const next = Math.min(1, Math.max(0, y / CHROME_SCROLL));
    setScrollT((prev) => (Math.abs(prev - next) > 0.01 ? next : prev));
  }, []);

  const handleCellTap = useCallback(
    (pondKey: string, col: (typeof COLS)[number]['key']) => {
      setActiveCell({ pondKey, col });
    },
    [setActiveCell],
  );

  const scrollToFirstDirty = useCallback(() => {
    const idx = ponds.findIndex((p) => p.state === 'dirty');
    if (idx < 0) return;
    const target = idx * ROW_H + 54;
    verticalRef.current?.scrollTo({ y: target, animated: true });
  }, [ponds]);

  const navigateMonth = useCallback(
    (delta: number) => {
      if (delta > 0 && nextMonthDisabled) return;
      // Clamp the day to the target month's last day (e.g. May 31 → Apr 30
      // instead of JS's silent rollover into May 1).
      const next = new Date(selectedDate);
      next.setDate(1);
      next.setMonth(next.getMonth() + delta);
      const now = new Date();
      const nextIdx = next.getFullYear() * 12 + next.getMonth();
      const nowIdx = now.getFullYear() * 12 + now.getMonth();
      if (nextIdx > nowIdx) return;
      const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      next.setDate(Math.min(selectedDate.getDate(), lastDay));
      setSelectedDate(next);
    },
    [selectedDate, setSelectedDate, nextMonthDisabled],
  );

  const dispatchPending = useCallback(
    (p: Pending) => {
      if (p.kind === 'month') navigateMonth(p.delta);
      else onChangeFarm(p.farmId);
    },
    [navigateMonth, onChangeFarm],
  );

  const requestMonthChange = useCallback(
    (delta: number) => {
      if (dirtyCount > 0) {
        setSaveError(null);
        setPending({ kind: 'month', delta });
        return;
      }
      navigateMonth(delta);
    },
    [dirtyCount, navigateMonth],
  );

  const onPrevMonth = useCallback(() => requestMonthChange(-1), [requestMonthChange]);
  const onNextMonth = useCallback(() => requestMonthChange(1), [requestMonthChange]);

  const today = useMemo(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  }, []);
  const currentYM = useMemo(
    () => ({ y: selectedDate.getFullYear(), m: selectedDate.getMonth() }),
    [selectedDate],
  );

  // Translate the hook's set of dirty months into the picker's marks map.
  // Closed-cycle / has-data indicators are not surfaced here yet — the
  // picker accepts them via the same map once those become available.
  const monthPickerMarks = useMemo<MonthMarksMap>(() => {
    const out: Record<string, 'unsaved'> = {};
    for (const key of unsavedMonths) out[key] = 'unsaved';
    return out;
  }, [unsavedMonths]);

  const onMonthLabelPress = useCallback(() => setMonthPickerOpen(true), []);

  const onMonthPickerConfirm = useCallback(
    (year: number, monthIdx: number) => {
      setMonthPickerOpen(false);
      const cur = selectedDate.getFullYear() * 12 + selectedDate.getMonth();
      const target = year * 12 + monthIdx;
      const delta = target - cur;
      if (delta === 0) return;
      if (dirtyCount > 0) {
        setSaveError(null);
        setPending({ kind: 'month', delta });
        return;
      }
      navigateMonth(delta);
    },
    [selectedDate, dirtyCount, navigateMonth],
  );

  const onFarmPress = useCallback(() => setPickerOpen(true), []);

  const onPickerSelect = useCallback(
    (id: number) => {
      setPickerOpen(false);
      if (id === activeFarmId) return;
      if (dirtyCount > 0) {
        setSaveError(null);
        setPending({ kind: 'farm', farmId: id });
        return;
      }
      onChangeFarm(id);
    },
    [activeFarmId, dirtyCount, onChangeFarm],
  );

  const onGuardDismiss = useCallback(() => {
    setPending(null);
    setSaveError(null);
  }, []);

  const onGuardDiscard = useCallback(() => {
    const p = pending;
    discardDirty();
    if (p) dispatchPending(p);
    setPending(null);
    setSaveError(null);
  }, [pending, discardDirty, dispatchPending]);

  const onGuardSaveAndExit = useCallback(async () => {
    // Refuse to save while any row carries an out-of-range value — same
    // rule the SaveBar enforces, just at the guard layer too so the user
    // can't sneak a bad upsert through the "บันทึกแล้วออก" path. The
    // dialog stays open with an inline error so they can fix the value
    // before navigating.
    if (invalidCount > 0) {
      setSaveError('แก้ไขค่าที่ผิดเงื่อนไขก่อนบันทึก');
      return;
    }
    const p = pending;
    const result = await saveAll();
    if (result.ok) {
      if (p) dispatchPending(p);
      setPending(null);
      setSaveError(null);
    } else {
      setSaveError(formatSaveError(result));
    }
  }, [pending, invalidCount, saveAll, dispatchPending]);

  const pickerFarms = useMemo<FarmOption[]>(
    () =>
      farms.map((f) => {
        const raw = f.name?.trim() ?? '';
        const display = raw ? (raw.startsWith('ฟาร์ม') ? raw : `ฟาร์ม ${raw}`) : 'ฟาร์ม';
        return {
          id: f.id,
          name: display,
          pondCount: f.pondCount,
          selected: f.id === activeFarmId,
          dirtyCount: f.id === activeFarmId ? dirtyCount : 0,
        };
      }),
    [farms, activeFarmId, dirtyCount],
  );

  const activePond = useMemo(
    () => (activeCell ? (ponds.find((p) => p.key === activeCell.pondKey) ?? null) : null),
    [ponds, activeCell],
  );

  const activeValue = useMemo<number | ''>(() => {
    if (!activeCell || !activePond) return '';
    return activePond.v[activeCell.col];
  }, [activeCell, activePond]);

  const rememberFeedPick = useCallback(
    (cell: NonNullable<typeof activeCell>, feedId: number | null) => {
      if (feedId == null) return;
      const group = COLS.find((c) => c.key === cell.col)?.group;
      if (group === 'pellet' || group === 'fresh') {
        setFeedSelection(cell.pondKey, group, feedId);
      }
    },
    [setFeedSelection],
  );

  const onNumpadCommit = useCallback(
    (value: number | '', feedId: number | null) => {
      if (!activeCell) return;
      rememberFeedPick(activeCell, feedId);
      setCellValue(activeCell.pondKey, activeCell.col, value);
      setActiveCell(null);
    },
    [activeCell, rememberFeedPick, setCellValue, setActiveCell],
  );

  const onNumpadNext = useCallback(
    (value: number | '', feedId: number | null) => {
      if (!activeCell) return;
      rememberFeedPick(activeCell, feedId);
      setCellValue(activeCell.pondKey, activeCell.col, value);
      advanceActive();
    },
    [activeCell, rememberFeedPick, setCellValue, advanceActive],
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.surface }}>
      <AppBar
        scrollT={scrollT}
        dirtyCount={dirtyCount}
        dateLabel={dateLabel}
        onBack={onBack}
        onPillPress={scrollToFirstDirty}
      />

      <View style={{ flex: 1 }}>
        <ScrollView
          delaysContentTouches={false}
          ref={verticalRef}
          onScroll={onScroll}
          scrollEventThrottle={16}
          stickyHeaderIndices={[1]}
          contentContainerStyle={{ paddingBottom: SAVE_BAR_HEIGHT_PADDING + bottomInset }}
        >
          <CollapsingChrome
            scrollT={scrollT}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            farmName={farmName}
            savedCount={savedCount}
            total={total}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
            nextMonthDisabled={nextMonthDisabled}
            onFarmPress={onFarmPress}
            onMonthLabelPress={onMonthLabelPress}
            daysWithDrafts={daysWithDrafts}
          />

          <View
            collapsable={false}
            style={{
              backgroundColor: t.surface,
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <ScrollView
              delaysContentTouches={false}
              ref={headerHRef}
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
            >
              <View style={{ width: tableWidth }}>
                <TableHeader />
              </View>
            </ScrollView>
          </View>

          <ScrollView
            delaysContentTouches={false}
            horizontal
            onScroll={onRowsHorizontalScroll}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            bounces={false}
          >
            <View style={{ width: tableWidth }}>
              {loading || !contentReady ? (
                <TableSkeleton />
              ) : (
                ponds.map((pond, i) => (
                  <TableRow
                    key={pond.key}
                    pond={pond}
                    idx={i}
                    activeCell={activeCell}
                    onCellTap={handleCellTap}
                  />
                ))
              )}
            </View>
          </ScrollView>
        </ScrollView>

        <SaveBar
          dirtyCount={dirtyCount}
          invalidCount={invalidCount}
          onSavePress={() => setConfirmOpen(true)}
          bottomInset={bottomInset}
        />
      </View>

      {activeCell && activePond ? (
        <Numpad
          visible={true}
          pondId={activePond.id}
          col={activeCell.col}
          initialValue={activeValue}
          yesterday={previousValueForActiveCell}
          lastUsedFeedId={lastUsedFeedIdForActiveCell}
          onCancel={() => setActiveCell(null)}
          onCommit={onNumpadCommit}
          onNext={onNumpadNext}
        />
      ) : null}

      {confirmOpen ? (
        <ConfirmSaveSheet
          visible={confirmOpen}
          ponds={ponds}
          selectedDate={selectedDate}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            void saveAll();
            setConfirmOpen(false);
          }}
        />
      ) : null}

      <UnsavedChangesDialog
        visible={pending !== null}
        dirtyCount={dirtyCount}
        source={pending?.kind === 'farm' ? 'farm' : 'month'}
        error={saveError}
        onDismiss={onGuardDismiss}
        onDiscard={onGuardDiscard}
        onSaveAndExit={onGuardSaveAndExit}
      />

      <FarmPickerSheet
        visible={pickerOpen}
        farms={pickerFarms}
        anchorTop={CHROME.title + CHROME.farm + 4}
        onDismiss={() => setPickerOpen(false)}
        onSelect={onPickerSelect}
      />

      <MonthYearPickerSheet
        visible={monthPickerOpen}
        current={currentYM}
        today={today}
        marks={monthPickerMarks}
        onClose={() => setMonthPickerOpen(false)}
        onConfirm={onMonthPickerConfirm}
      />
    </View>
  );
}

const SKELETON_ROWS = 6;

/**
 * Loading placeholder for the pond table. Shown while the farm/pond list is
 * still resolving so the screen never lands as a blank grid — opened cold from
 * Home, the table used to flash empty until the scoped, Home-warmed pond query
 * took over. Mirrors TableRow's name-column + per-column layout so the swap to
 * real rows is visually stable; rows fade down so it reads as a placeholder.
 */
function TableSkeleton() {
  const { t } = useTheme();
  const bar = t.surfaceSunk;
  return (
    <View>
      {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            minHeight: ROW_H,
            borderBottomWidth: 1,
            borderBottomColor: t.border,
            opacity: 1 - i * 0.12,
          }}
        >
          <View
            style={{
              width: NAME_W,
              paddingHorizontal: 8,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderRightWidth: 1,
              borderRightColor: t.borderStrong,
            }}
          >
            <View style={{ width: 3, height: 30, borderRadius: 2, backgroundColor: bar }} />
            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ width: '70%', height: 12, borderRadius: 4, backgroundColor: bar }} />
              <View style={{ width: '45%', height: 9, borderRadius: 4, backgroundColor: bar }} />
            </View>
          </View>
          {COLS.map((c) => (
            <View
              key={c.key}
              style={{ width: colW(c.key), alignItems: 'center', justifyContent: 'center' }}
            >
              <View style={{ width: 22, height: 12, borderRadius: 4, backgroundColor: bar }} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

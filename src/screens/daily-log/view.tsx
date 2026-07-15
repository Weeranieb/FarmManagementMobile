import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  InteractionManager,
  RefreshControl,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { FarmModel } from '@/features/farm';
import { AppBar } from './components/AppBar';
import { CollapsingChrome } from './components/CollapsingChrome';
import { ConfirmMonthSaveSheet } from './components/ConfirmMonthSaveSheet';
import { SaveStatusToast, type SaveToastStatus } from './components/SaveStatusToast';
import { FarmPickerSheet, type FarmOption } from './components/FarmPickerSheet';
import { MonthYearPickerSheet, type MonthMarksMap } from './components/MonthYearPickerSheet';
import { Numpad } from './components/Numpad';
import { SaveBar } from './components/SaveBar';
import { TableHeader } from './components/TableHeader';
import { TableRow } from './components/TableRow';
import { UnsavedChangesDialog } from './components/UnsavedChangesDialog';
import {
  CHROME,
  CHROME_SCROLL,
  COLS,
  NAME_W,
  ROW_H,
  TABLE_W,
  VIBRANT_BRAND,
  colW,
  numpadSheetHeight,
  thMonthAbbr,
} from './constants';
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

type Pending =
  | { kind: 'month'; delta: number }
  | { kind: 'farm'; farmId: number }
  | { kind: 'back' };

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

// Gap kept between the active row and the top of the numpad sheet when we have
// to scroll the row out from behind it.
const NUMPAD_REVEAL_MARGIN = 12;

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
    total,
    unsavedMonths,
    daysWithDrafts,
    monthEditsCount,
    monthDaysCount,
    monthPondCount,
    monthInvalidCount,
    monthSummary,
    setCellValue,
    setFeedSelection,
    lastUsedFeedIdForActiveCell,
    advanceActive,
    activeCellIsLast,
    saveAll,
    discardDirty,
    refresh,
  } = state;

  const verticalRef = useRef<ScrollView>(null);
  const headerHRef = useRef<ScrollView>(null);
  // Live vertical scroll offset, used to turn a measured row position into an
  // absolute scrollTo target when the numpad covers the active row.
  const scrollYRef = useRef(0);
  // Numpad's actual rendered height, measured on layout (its `onHeight`). Used
  // for the scroll-to-reveal target so the active row clears the *real* keypad
  // on any screen size / density, not the `numpadSheetHeight` estimate. The
  // estimate is the fallback only until the sheet first measures.
  const [numpadH, setNumpadH] = useState(0);

  // Latest cell / typed value / feed pick for commit-on-switch + leave-flush
  // (callbacks below are memoized without these in deps). `.current` synced
  // after `liveValue` / `activeValue` are computed.
  const activeCellRef = useRef(activeCell);
  const liveValueRef = useRef<number | ''>('');
  const activeValueRef = useRef<number | ''>('');
  const liveFeedIdRef = useRef<number | null>(null);

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

  // Commit the in-progress keypad amount + feed id (backend requires the id
  // when logging pellet/fresh amounts).
  const commitLiveEdit = useCallback(
    (cell: NonNullable<typeof activeCell>) => {
      rememberFeedPick(cell, liveFeedIdRef.current);
      setCellValue(cell.pondKey, cell.col, liveValueRef.current);
    },
    [rememberFeedPick, setCellValue],
  );

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
  const [saveToast, setSaveToast] = useState<{
    status: SaveToastStatus;
    days: number;
    failedCount: number;
  } | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const dateLabel = useMemo(
    () =>
      `${selectedDate.getDate()} ${thMonthAbbr(selectedDate.getMonth())} ${selectedDate.getFullYear() + 543}`,
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
    scrollYRef.current = y;
    const next = Math.min(1, Math.max(0, y / CHROME_SCROLL));
    setScrollT((prev) => (Math.abs(prev - next) > 0.01 ? next : prev));
  }, []);

  const handleCellTap = useCallback(
    (pondKey: string, col: (typeof COLS)[number]['key']) => {
      // Tapping another cell while one is being edited commits the outgoing cell
      // first, then opens the tapped one. The in-progress value lives only in
      // `liveValue` (which resets on switch), so without this commit the typed
      // digits would be lost.
      const cur = activeCellRef.current;
      if (cur && (cur.pondKey !== pondKey || cur.col !== col)) {
        commitLiveEdit(cur);
      }
      setActiveCell({ pondKey, col });
    },
    [commitLiveEdit, setActiveCell],
  );

  const scrollToFirstDirty = useCallback(() => {
    const idx = ponds.findIndex((p) => p.state === 'dirty');
    if (idx < 0) return;
    const target = idx * ROW_H + 54;
    verticalRef.current?.scrollTo({ y: target, animated: true });
  }, [ponds]);

  // The active row's last measurement, so the reveal can be re-applied when the
  // numpad reports its real height (the effect below).
  const lastRowMeasure = useRef<{ pageY: number; height: number; scrollY: number } | null>(null);

  // Keyboard-avoidance for the numpad, keyboard-style: the active row measures
  // its own on-screen position when it becomes active (tap or ถัดไป). We only
  // scroll if the numpad would cover it, and just enough to lift it clear —
  // rows already visible (e.g. the first one) don't move, and the header chrome
  // is left untouched so it never vanishes/reappears.
  const revealActiveRow = useCallback(
    (m: { pageY: number; height: number; scrollY: number }) => {
      const screenH = Dimensions.get('window').height;
      const sheetTop = screenH - (numpadH || numpadSheetHeight(bottomInset));
      // Current on-screen bottom = measured bottom, adjusted by how far we've
      // scrolled since it was measured — so re-applying after a scroll (below)
      // stays correct.
      const rowBottom = m.pageY + m.height - (scrollYRef.current - m.scrollY);
      const limit = sheetTop - NUMPAD_REVEAL_MARGIN;
      if (rowBottom <= limit) return; // already fully visible above the sheet
      const target = Math.max(0, scrollYRef.current + (rowBottom - limit));
      verticalRef.current?.scrollTo({ y: target, animated: true });
    },
    [bottomInset, numpadH],
  );

  const onActiveRowMeasure = useCallback(
    (pageY: number, height: number) => {
      const m = { pageY, height, scrollY: scrollYRef.current };
      lastRowMeasure.current = m;
      revealActiveRow(m);
    },
    [revealActiveRow],
  );

  // Re-apply the reveal once the numpad reports its real height (or changes it
  // for a different column). Without this the first cell of a session — measured
  // while `numpadH` is still 0 (estimate) — stays under a taller-than-estimated
  // keypad until the next cell. `revealActiveRow` is recreated when `numpadH`
  // changes, so this effect fires exactly then. Mirrors the pond-ledger fix.
  useEffect(() => {
    const m = lastRowMeasure.current;
    if (m) revealActiveRow(m);
  }, [revealActiveRow]);

  const navigateMonth = useCallback(
    (delta: number) => {
      if (delta > 0 && nextMonthDisabled) return;
      // Default to day 1 of the target month rather than carrying the
      // current day-of-month forward — avoids landing on an arbitrary day
      // (or JS's silent month-end rollover) when switching months.
      const next = new Date(selectedDate);
      next.setDate(1);
      next.setMonth(next.getMonth() + delta);
      const now = new Date();
      const nextIdx = next.getFullYear() * 12 + next.getMonth();
      const nowIdx = now.getFullYear() * 12 + now.getMonth();
      if (nextIdx > nowIdx) return;
      setSelectedDate(next);
    },
    [selectedDate, setSelectedDate, nextMonthDisabled],
  );

  const dispatchPending = useCallback(
    (p: Pending) => {
      if (p.kind === 'month') navigateMonth(p.delta);
      else if (p.kind === 'farm') onChangeFarm(p.farmId);
      else onBack?.();
    },
    [navigateMonth, onChangeFarm, onBack],
  );

  // Flush the in-progress keypad edit before leaving (nav/back/picker are
  // tappable behind the sheet). Without this the typed value — only in
  // `liveValue` — is dropped and the dirty guard misses it.
  const flushActiveEdit = useCallback(() => {
    const cur = activeCellRef.current;
    let flushedDirty = false;
    if (cur) {
      flushedDirty = liveValueRef.current !== activeValueRef.current;
      commitLiveEdit(cur);
      setActiveCell(null);
    }
    return monthEditsCount > 0 || flushedDirty;
  }, [monthEditsCount, commitLiveEdit, setActiveCell]);

  const requestMonthChange = useCallback(
    (delta: number) => {
      // Guard on the whole month's drafts (incl. the in-progress edit), not just
      // the visible day — leaving a month with any unsaved edit prompts
      // save/discard so drafts can't be stranded on a day the user can't see.
      if (flushActiveEdit()) {
        setSaveError(null);
        setPending({ kind: 'month', delta });
        return;
      }
      navigateMonth(delta);
    },
    [flushActiveEdit, navigateMonth],
  );

  const onPrevMonth = useCallback(() => requestMonthChange(-1), [requestMonthChange]);
  const onNextMonth = useCallback(() => requestMonthChange(1), [requestMonthChange]);

  const onBackPress = useCallback(() => {
    if (flushActiveEdit()) {
      setSaveError(null);
      setPending({ kind: 'back' });
      return;
    }
    onBack?.();
  }, [flushActiveEdit, onBack]);

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
      if (flushActiveEdit()) {
        setSaveError(null);
        setPending({ kind: 'month', delta });
        return;
      }
      navigateMonth(delta);
    },
    [selectedDate, flushActiveEdit, navigateMonth],
  );

  const onFarmPress = useCallback(() => setPickerOpen(true), []);

  const onPickerSelect = useCallback(
    (id: number) => {
      setPickerOpen(false);
      if (id === activeFarmId) return;
      if (flushActiveEdit()) {
        setSaveError(null);
        setPending({ kind: 'farm', farmId: id });
        return;
      }
      onChangeFarm(id);
    },
    [activeFarmId, flushActiveEdit, onChangeFarm],
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
    // A background save is already in flight — don't fire a second concurrent
    // saveAll for the same month.
    if (saveToast?.status === 'saving') return;
    // Refuse to save while any row carries an out-of-range value — same
    // rule the SaveBar enforces, just at the guard layer too so the user
    // can't sneak a bad upsert through the "บันทึกแล้วออก" path. The
    // dialog stays open with an inline error so they can fix the value
    // before navigating.
    if (monthInvalidCount > 0) {
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
  }, [pending, monthInvalidCount, saveAll, dispatchPending, saveToast]);

  // Non-blocking save: close the sheet immediately and report the server
  // round-trip through the status toast (saving → success / error). Pessimistic
  // — rows stay "unsaved" until the server confirms (saveAll drops overrides
  // only on success), so nothing looks committed before it actually is.
  const runSave = useCallback(async () => {
    if (saveToast?.status === 'saving') return; // single-flight guard
    const days = monthDaysCount; // snapshot before overrides drop on success
    setConfirmOpen(false);
    setSaveToast({ status: 'saving', days, failedCount: 0 });
    const result = await saveAll();
    setSaveToast(
      result.ok
        ? { status: 'success', days, failedCount: 0 }
        : { status: 'error', days, failedCount: result.failedCount },
    );
  }, [saveToast, monthDaysCount, saveAll]);

  const dismissToast = useCallback(() => setSaveToast(null), []);

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

  // Live typed-value preview for the active cell — deliberately kept out of
  // `overrides`/`setCellValue` so a keystroke doesn't rebuild the `ponds`
  // array (and re-render every row) on every digit; only the one active
  // row receives a changed prop (wired below). Committed to real state via
  // `setCellValue` only on Next/Done. Re-seed only when the cell identity
  // changes (not when pond data refreshes mid-edit).
  const cellKey = activeCell ? `${activeCell.pondKey}:${activeCell.col}` : null;
  const [liveValue, setLiveValue] = useState<number | ''>('');
  const seededCell = useRef<string | null>(null);
  if (cellKey !== seededCell.current) {
    seededCell.current = cellKey;
    setLiveValue(activeValue);
  }

  activeCellRef.current = activeCell;
  liveValueRef.current = liveValue;
  activeValueRef.current = activeValue;

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

  // Mirrors every keystroke into the table cell behind the sheet — local
  // `liveValue` only, never `overrides`. The cell itself stays a Pressable
  // (opens the numpad), never a direct text input.
  const onNumpadChange = useCallback((value: number | '') => setLiveValue(value), []);

  const onNumpadFeedChange = useCallback((feedId: number | null) => {
    liveFeedIdRef.current = feedId;
  }, []);

  const onNumpadCancel = useCallback(() => setActiveCell(null), [setActiveCell]);

  return (
    <View style={{ flex: 1, backgroundColor: t.surface }}>
      <AppBar
        scrollT={scrollT}
        dirtyCount={dirtyCount}
        dateLabel={dateLabel}
        onBack={onBackPress}
        onPillPress={scrollToFirstDirty}
      />

      <View style={{ flex: 1 }}>
        <ScrollView
          delaysContentTouches={false}
          ref={verticalRef}
          onScroll={onScroll}
          scrollEventThrottle={16}
          stickyHeaderIndices={[1]}
          contentContainerStyle={{
            // While editing, reserve the keypad's real height so any row can
            // scroll clear of it (mirrors the pond-ledger table). Otherwise
            // leave room for the floating SaveBar.
            paddingBottom: activeCell
              ? (numpadH || numpadSheetHeight(bottomInset)) + 24
              : SAVE_BAR_HEIGHT_PADDING + bottomInset,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={VIBRANT_BRAND[600]}
              colors={[VIBRANT_BRAND[600]]}
            />
          }
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
                    // `undefined` for every non-active row keeps that prop
                    // reference-stable across keystrokes so React.memo skips
                    // re-rendering rows the user isn't typing into.
                    liveValue={pond.key === activeCell?.pondKey ? liveValue : undefined}
                    onCellTap={handleCellTap}
                    onActiveMeasure={onActiveRowMeasure}
                  />
                ))
              )}
            </View>
          </ScrollView>
        </ScrollView>

        {saveToast ? (
          <SaveStatusToast
            status={saveToast.status}
            days={saveToast.days}
            failedCount={saveToast.failedCount}
            bottom={bottomInset}
            onRetry={runSave}
            onDismiss={dismissToast}
          />
        ) : (
          <SaveBar
            daysCount={monthDaysCount}
            editsCount={monthEditsCount}
            invalidCount={monthInvalidCount}
            onSavePress={() => setConfirmOpen(true)}
            bottomInset={bottomInset}
          />
        )}
      </View>

      {activeCell && activePond && cellKey ? (
        <Numpad
          visible={true}
          pondId={activePond.id}
          col={activeCell.col}
          initialValue={activeValue}
          cellKey={cellKey}
          lastUsedFeedId={lastUsedFeedIdForActiveCell}
          isLastCell={activeCellIsLast}
          bottomInset={bottomInset}
          onHeight={setNumpadH}
          onFeedChange={onNumpadFeedChange}
          onChange={onNumpadChange}
          onCancel={onNumpadCancel}
          onCommit={onNumpadCommit}
          onNext={onNumpadNext}
        />
      ) : null}

      {confirmOpen ? (
        <ConfirmMonthSaveSheet
          visible={confirmOpen}
          summary={monthSummary}
          bottomInset={bottomInset}
          onClose={() => setConfirmOpen(false)}
          onConfirm={runSave}
        />
      ) : null}

      <UnsavedChangesDialog
        visible={pending !== null}
        dirtyCount={monthPondCount}
        source={pending?.kind ?? 'month'}
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
        bottomInset={bottomInset}
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

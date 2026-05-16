import { useCallback, useEffect, useMemo, useState } from 'react';
import { today } from '@/shared/time';
import { useDailyLogData, type DailyLogResponse, type DailyLogEntry } from '@/features/daily-log';
import { useAuthStore } from '@/features/auth';

function monthStrFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthStrToStartDate(ym: string): Date {
  const parts = ym.split('-');
  const y = Number(parts[0]);
  const mo = Number(parts[1]);
  return new Date(y, mo - 1, 1);
}

function addMonthsStr(ym: string, delta: number): string {
  const d = monthStrToStartDate(ym);
  d.setMonth(d.getMonth() + delta);
  return monthStrFromDate(d);
}

function daysInMonthFromStr(ym: string): number {
  const d = monthStrToStartDate(ym);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function startOfCalendarMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export type PondDailyLogState = ReturnType<typeof usePondDailyLog>;

export function usePondDailyLog(pondId: number) {
  const refNow = today;
  const [month, setMonth] = useState(() => monthStrFromDate(refNow));
  const [selectedDay, setSelectedDay] = useState(() => {
    const m = monthStrFromDate(refNow);
    return Math.min(refNow.getDate(), daysInMonthFromStr(m));
  });
  const hasToken = useAuthStore((s) => s.token != null);
  const { data, isLoading, isError } = useDailyLogData(pondId, month);

  const monthDate = useMemo(() => monthStrToStartDate(month), [month]);
  const daysInMonth = useMemo(() => daysInMonthFromStr(month), [month]);
  const isViewingCurrentMonth = month === monthStrFromDate(refNow);
  const maxSelectableDay = isViewingCurrentMonth
    ? Math.min(refNow.getDate(), daysInMonth)
    : daysInMonth;

  useEffect(() => {
    const m = monthStrFromDate(refNow);
    const dim = daysInMonthFromStr(m);
    setMonth(m);
    setSelectedDay(Math.min(refNow.getDate(), dim));
  }, [pondId, refNow]);

  useEffect(() => {
    setSelectedDay((d) => Math.min(Math.max(1, d), maxSelectableDay));
  }, [month, maxSelectableDay]);

  const logData: DailyLogResponse | null = data;
  const entries = useMemo<DailyLogEntry[]>(() => logData?.entries ?? [], [logData]);
  const hasDataSet = useMemo(() => new Set(entries.map((e) => e.day)), [entries]);
  const entry = entries.find((e) => e.day === selectedDay);

  const [freshMorning, setFreshMorning] = useState('');
  const [freshEvening, setFreshEvening] = useState('');
  const [pelletMorning, setPelletMorning] = useState('');
  const [pelletEvening, setPelletEvening] = useState('');
  const [deaths, setDeaths] = useState('');
  const [tourist, setTourist] = useState('');

  useEffect(() => {
    if (!logData) return;
    const e = logData.entries.find((x) => x.day === selectedDay);
    setFreshMorning(e != null ? String(e.freshMorning) : '');
    setFreshEvening(e != null ? String(e.freshEvening) : '');
    setPelletMorning(e != null ? String(e.pelletMorning) : '');
    setPelletEvening(e != null ? String(e.pelletEvening) : '');
    setDeaths(e != null ? String(e.deathFishCount) : '');
    setTourist(e != null ? String(e.touristCatchCount) : '');
  }, [logData, selectedDay]);

  const selectedFullDate = useMemo(
    () => new Date(monthDate.getFullYear(), monthDate.getMonth(), selectedDay),
    [monthDate, selectedDay],
  );

  const nextMonthStr = addMonthsStr(month, 1);
  const nextMonthStart = startOfCalendarMonth(monthStrToStartDate(nextMonthStr));
  const nowMonthStart = startOfCalendarMonth(refNow);
  const canGoNext = nextMonthStart.getTime() <= nowMonthStart.getTime();

  const goPrevMonth = useCallback(() => {
    setMonth((m) => addMonthsStr(m, -1));
  }, []);
  const goNextMonth = useCallback(() => {
    if (canGoNext) setMonth((m) => addMonthsStr(m, 1));
  }, [canGoNext]);

  const goToNextDay = useCallback(() => {
    setSelectedDay((d) => Math.min(d + 1, maxSelectableDay));
  }, [maxSelectableDay]);

  const freshSubtitle = logData?.freshFeedCollectionName?.trim() || '';
  const pelletSubtitle = logData?.pelletFeedCollectionName?.trim() || '';

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return {
    refNow,
    monthDate,
    isViewingCurrentMonth,
    selectedDay,
    setSelectedDay,
    days,
    hasDataSet,
    canGoNext,
    goPrevMonth,
    goNextMonth,
    goToNextDay,
    isLoading,
    isError,
    hasToken,
    entry,
    selectedFullDate,
    freshSubtitle,
    pelletSubtitle,
    freshMorning,
    setFreshMorning,
    freshEvening,
    setFreshEvening,
    pelletMorning,
    setPelletMorning,
    pelletEvening,
    setPelletEvening,
    deaths,
    setDeaths,
    tourist,
    setTourist,
  };
}

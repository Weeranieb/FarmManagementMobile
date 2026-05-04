import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { warnInk } from '@/theme/ink';
import { Btn, Card, Input, Pill } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { thaiDate, TH_WEEKDAYS_SHORT } from '@/locale/thaiDate';
import { today } from '@/mock/data';
import { useDailyLogData } from '@/data';
import type { DailyLogResponse } from '@/api/types';

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

type Props = {
  pondId: number;
  /** Extra bottom padding when embedded in an outer ScrollView (e.g. tab). */
  contentPaddingBottom?: number;
};

export function PondDailyLogPanel({ pondId, contentPaddingBottom = 0 }: Props) {
  const { t, mode } = useTheme();
  const refNow = today;
  const [month, setMonth] = useState(() => monthStrFromDate(refNow));
  const [selectedDay, setSelectedDay] = useState(() => {
    const m = monthStrFromDate(refNow);
    return Math.min(refNow.getDate(), daysInMonthFromStr(m));
  });
  const { data, isLoading, isError, source } = useDailyLogData(pondId, month);

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
  }, [pondId]);

  useEffect(() => {
    setSelectedDay((d) => Math.min(Math.max(1, d), maxSelectableDay));
  }, [month, maxSelectableDay]);

  const logData: DailyLogResponse | null = data;
  const entries = logData?.entries ?? [];
  const hasData = useMemo(() => new Set(entries.map((e) => e.day)), [entries]);
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

  const freshSubtitle = logData ? `${logData.freshFeedCollectionName} · —/กก.` : '—';
  const pelletSubtitle = logData ? `${logData.pelletFeedCollectionName} · —/กก.` : '—';

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <View style={{ paddingBottom: contentPaddingBottom }}>
      <Row
        justify="space-between"
        style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 }}
      >
        <Pressable
          onPress={goPrevMonth}
          style={{
            width: 40,
            height: 40,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: t.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.chevL size={18} color={t.ink} />
        </Pressable>
        <Col gap={1} align="center">
          <Text style={{ fontFamily: type.familyBold, fontSize: 17, color: t.ink }}>
            {thaiDate.monthYear(monthDate)}
          </Text>
          <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>
            เลือกวันเพื่อบันทึก
          </Text>
        </Col>
        <Pressable
          onPress={goNextMonth}
          disabled={!canGoNext}
          style={{
            width: 40,
            height: 40,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: t.border,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: canGoNext ? 1 : 0.35,
          }}
        >
          <Icon.chevR size={18} color={t.ink} />
        </Pressable>
      </Row>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 14 }}
      >
        <Row gap={6}>
          {days.map((d) => {
            const sel = d === selectedDay;
            const has = hasData.has(d);
            const isFuture = isViewingCurrentMonth && d > refNow.getDate();
            const dt = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
            return (
              <Pressable
                key={d}
                disabled={isFuture}
                onPress={() => setSelectedDay(d)}
                style={{
                  minWidth: 46,
                  height: 64,
                  borderRadius: 12,
                  backgroundColor: sel ? t.brand : isFuture ? t.surfaceAlt : t.surface,
                  borderWidth: 1,
                  borderColor: sel ? t.brand : t.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 4,
                  gap: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    color: sel ? '#fff' : isFuture ? t.inkMute : t.inkSoft,
                    fontFamily: type.familyMedium,
                  }}
                >
                  {TH_WEEKDAYS_SHORT[dt.getDay()]}
                </Text>
                <Text
                  style={{
                    fontFamily: type.familyNumBold,
                    fontSize: 17,
                    color: sel ? '#fff' : isFuture ? t.inkMute : t.ink,
                  }}
                >
                  {d}
                </Text>
                {has && !sel ? (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: t.success,
                    }}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </Row>
      </ScrollView>

      {isError ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
          <Text style={{ fontSize: 13, color: t.danger, fontFamily: type.family }}>
            โหลดบันทึกรายเดือนไม่สำเร็จ
          </Text>
        </View>
      ) : null}

      <View style={{ paddingHorizontal: 20 }}>
        <Card padded={false}>
          {isLoading && source === 'api' ? (
            <View style={{ padding: 28, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: t.inkMute, fontFamily: type.family }}>
                กำลังโหลดบันทึก…
              </Text>
            </View>
          ) : (
            <>
              <View style={{ padding: 16, paddingBottom: 6 }}>
                <Row justify="space-between">
                  <Text style={{ fontSize: 15, fontFamily: type.familyBold, color: t.ink }}>
                    {thaiDate.long(selectedFullDate)}
                  </Text>
                  {entry ? (
                    <Pill tone="success">
                      <Row gap={4}>
                        <Icon.check size={11} color={t.statusActive} />
                        <Text
                          style={{
                            color: t.statusActive,
                            fontSize: 12,
                            fontFamily: type.familyMedium,
                          }}
                        >
                          บันทึกแล้ว
                        </Text>
                      </Row>
                    </Pill>
                  ) : (
                    <Pill tone="warn">
                      <Row gap={4}>
                        <Icon.clock size={11} color={warnInk(mode, t)} />
                        <Text
                          style={{
                            color: warnInk(mode, t),
                            fontSize: 12,
                            fontFamily: type.familyMedium,
                          }}
                        >
                          ยังไม่บันทึก
                        </Text>
                      </Row>
                    </Pill>
                  )}
                </Row>
              </View>
              <FeedSection
                title="เหยื่อสด"
                subtitle={freshSubtitle}
                morning={freshMorning}
                evening={freshEvening}
                onMorningChange={setFreshMorning}
                onEveningChange={setFreshEvening}
              />
              <Sep />
              <FeedSection
                title="อาหารเม็ด"
                subtitle={pelletSubtitle}
                morning={pelletMorning}
                evening={pelletEvening}
                onMorningChange={setPelletMorning}
                onEveningChange={setPelletEvening}
              />
              <Sep />
              <View style={{ padding: 16, gap: 10 }}>
                <Row gap={10}>
                  <NumField label="ปลาตาย" unit="ตัว" value={deaths} onChange={setDeaths} />
                  <NumField
                    label="จับปลาเป็น"
                    optional
                    unit="ตัว"
                    value={tourist}
                    onChange={setTourist}
                  />
                </Row>
              </View>
            </>
          )}
        </Card>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
        <Row gap={8}>
          <Btn tone="brand" size="lg" style={{ flex: 1 }}>
            บันทึก
          </Btn>
          <Btn
            tone="brand"
            variant="soft"
            size="lg"
            style={{ flex: 1 }}
            onPress={() => setSelectedDay((d) => Math.min(d + 1, maxSelectableDay))}
          >
            บันทึก & วันถัดไป
          </Btn>
        </Row>
      </View>
    </View>
  );
}

function FeedSection({
  title,
  subtitle,
  morning,
  evening,
  onMorningChange,
  onEveningChange,
}: {
  title: string;
  subtitle: string;
  morning: string;
  evening: string;
  onMorningChange: (v: string) => void;
  onEveningChange: (v: string) => void;
}) {
  const { t } = useTheme();
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 }}>
      <Row justify="space-between" style={{ marginBottom: 8 }}>
        <Col gap={1}>
          <Text style={{ fontFamily: type.familyBold, fontSize: 14, color: t.ink }}>{title}</Text>
          <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
            {subtitle}
          </Text>
        </Col>
        <Pressable>
          <Text style={{ color: t.brand, fontSize: 13, fontFamily: type.familySemi }}>เปลี่ยน</Text>
        </Pressable>
      </Row>
      <Row gap={10}>
        <NumField label="เช้า" unit="กก." value={morning} onChange={onMorningChange} />
        <NumField label="เย็น" unit="กก." value={evening} onChange={onEveningChange} />
      </Row>
    </View>
  );
}

function NumField({
  label,
  unit,
  value,
  onChange,
  optional,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  optional?: boolean;
}) {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Row justify="space-between" style={{ marginBottom: 4 }}>
        <Text style={{ fontSize: 11, color: t.inkSoft, fontFamily: type.familySemi }}>
          {label}
          {optional ? (
            <Text style={{ color: t.inkMute, fontFamily: type.family }}> · ไม่บังคับ</Text>
          ) : null}
        </Text>
        <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.familyNum }}>{unit}</Text>
      </Row>
      <Input big value={value} onChangeText={onChange} keyboardType="numeric" placeholder="0" />
    </View>
  );
}

function Sep() {
  const { t } = useTheme();
  return <View style={{ height: 1, backgroundColor: t.border, marginHorizontal: 16 }} />;
}

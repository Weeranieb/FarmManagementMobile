import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { warnInk } from '@/theme/ink';
import { Btn, Card, Pill } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { thaiDate, TH_WEEKDAYS_SHORT } from '@/locale/thaiDate';
import { today } from '@/mock/data';
import { useDailyLogData } from '@/data';
import { useAuthStore } from '@/store/auth';
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

/** Horizontal inset inside the activity card (prototype ~20px). */
const CARD_PAD = space[5];

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
        <Card
          padded={false}
          style={{
            borderRadius: radii.xl,
            borderColor: t.border,
          }}
        >
          {isLoading && hasToken ? (
            <View style={{ padding: 28, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: t.inkMute, fontFamily: type.family }}>
                กำลังโหลดบันทึก…
              </Text>
            </View>
          ) : (
            <>
              <View
                style={{
                  paddingHorizontal: CARD_PAD,
                  paddingTop: 18,
                  paddingBottom: space[2],
                }}
              >
                <Row justify="space-between" align="flex-start">
                  <Text
                    style={{
                      flex: 1,
                      marginRight: space[3],
                      fontSize: type.sizes.lg,
                      fontFamily: type.familyBold,
                      color: t.ink,
                      lineHeight: 24,
                    }}
                  >
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
              <View
                style={{
                  paddingHorizontal: CARD_PAD,
                  paddingVertical: space[3],
                  gap: space[3],
                }}
              >
                <Row gap={10}>
                  <AmountTile label="ปลาตาย" unit="ตัว" value={deaths} onChange={setDeaths} />
                  <AmountTile
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
    <View
      style={{
        paddingHorizontal: CARD_PAD,
        paddingTop: space[3],
        paddingBottom: space[3],
      }}
    >
      <Row justify="space-between" style={{ marginBottom: space[3] }} align="flex-start">
        <Col gap={2} style={{ flex: 1, marginRight: space[3] }}>
          <Text style={{ fontFamily: type.familyBold, fontSize: 14, color: t.ink }}>{title}</Text>
          <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
            {subtitle}
          </Text>
        </Col>
        <Pressable hitSlop={8}>
          <Text style={{ color: t.brand, fontSize: 13, fontFamily: type.familySemi }}>เปลี่ยน</Text>
        </Pressable>
      </Row>
      <Row gap={10}>
        <AmountTile label="เช้า" unit="กก." value={morning} onChange={onMorningChange} />
        <AmountTile label="เย็น" unit="กก." value={evening} onChange={onEveningChange} />
      </Row>
    </View>
  );
}

/** Bordered inner tile: label + unit on top row, centered numeric value (daily log prototype). */
function AmountTile({
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
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={{
        flex: 1,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: focused ? t.brand : t.border,
        backgroundColor: t.surface,
        minHeight: 88,
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 10,
      }}
    >
      <Row justify="space-between" style={{ marginBottom: 6 }}>
        <Text
          style={{ fontSize: 11, color: t.inkSoft, fontFamily: type.familySemi }}
          numberOfLines={2}
        >
          {label}
          {optional ? (
            <Text style={{ color: t.inkMute, fontFamily: type.family }}> · ไม่บังคับ</Text>
          ) : null}
        </Text>
        <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.familyNum }}>{unit}</Text>
      </Row>
      <View style={{ flex: 1, justifyContent: 'center', minHeight: 42 }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={t.inkMute}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            textAlign: 'center',
            fontSize: type.sizes.xl,
            fontFamily: type.familyNumSemi,
            color: t.ink,
            paddingVertical: 4,
          }}
        />
      </View>
    </View>
  );
}

function Sep() {
  const { t } = useTheme();
  return <View style={{ height: 1, backgroundColor: t.border, marginHorizontal: CARD_PAD }} />;
}

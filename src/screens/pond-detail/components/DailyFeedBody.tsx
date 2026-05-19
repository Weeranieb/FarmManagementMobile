import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, type LayoutChangeEvent } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { warnInk } from '@/theme/ink';
import { Card, Pill } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { thaiDate, TH_WEEKDAYS_SHORT } from '@/locale/thaiDate';
import { fmt } from '@/utils/fmt';
import { today } from '@/shared/time';
import { useDailyLogData, type DailyLogEntry } from '@/features/daily-log';
import { useFeedCollectionsData, type FeedCollectionModel } from '@/features/feed-collection';

const CARD_PAD = space[4];
const FALLBACK_PELLET_PRICE = 32;
const FALLBACK_FRESH_PRICE = 12;
const DAY_CELL_WIDTH = 46;
const DAY_CELL_GAP = 6;

type Props = {
  pondId: number;
  onOpenDailyLog: () => void;
};

function monthStrFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthStrToStartDate(ym: string): Date {
  const parts = ym.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  return new Date(y, m - 1, 1);
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

function n(x: unknown): number {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
}

function feedPrice(
  id: number | undefined,
  collections: FeedCollectionModel[],
  fallback: number,
): number {
  if (id == null) return fallback;
  const c = collections.find((x) => x.id === id);
  return c?.price ?? fallback;
}

function totalKg(e: DailyLogEntry): number {
  return n(e.pelletMorning) + n(e.pelletEvening) + n(e.fresh);
}

export function DailyFeedBody({ pondId, onOpenDailyLog }: Props) {
  const { data: feedCollections } = useFeedCollectionsData();
  const refNow = today;
  const currentMonthStr = monthStrFromDate(refNow);
  const todayDay = refNow.getDate();

  const [monthStr, setMonthStr] = useState(currentMonthStr);
  const monthDate = useMemo(() => monthStrToStartDate(monthStr), [monthStr]);
  const daysInMonth = useMemo(() => daysInMonthFromStr(monthStr), [monthStr]);
  const isCurrentMonth = monthStr === currentMonthStr;
  const maxSelectableDay = isCurrentMonth ? Math.min(todayDay, daysInMonth) : daysInMonth;

  const { data: log } = useDailyLogData(pondId, monthStr);
  const { data: currentLog } = useDailyLogData(
    isCurrentMonth ? undefined : pondId,
    currentMonthStr,
  );
  const entriesByDay = useMemo<Record<number, DailyLogEntry>>(() => {
    const out: Record<number, DailyLogEntry> = {};
    (log?.entries ?? []).forEach((e) => {
      out[e.day] = e;
    });
    return out;
  }, [log]);

  const [selected, setSelected] = useState(() => Math.min(todayDay, daysInMonth));
  useEffect(() => {
    setSelected(Math.min(todayDay, daysInMonthFromStr(currentMonthStr)));
    setMonthStr(currentMonthStr);
  }, [pondId, currentMonthStr, todayDay]);
  useEffect(() => {
    setSelected((d) => Math.min(Math.max(1, d), maxSelectableDay));
  }, [maxSelectableDay]);

  const canGoNext = !isCurrentMonth;
  const goPrev = useCallback(() => setMonthStr((m) => addMonthsStr(m, -1)), []);
  const goNext = useCallback(() => {
    setMonthStr((m) => (m === currentMonthStr ? m : addMonthsStr(m, 1)));
  }, [currentMonthStr]);

  const selectedDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), selected);
  const selectedEntry = entriesByDay[selected];
  const isToday = isCurrentMonth && selected === todayDay;
  const isFuture = isCurrentMonth && selected > todayDay;
  const todayEntry = isCurrentMonth
    ? entriesByDay[todayDay]
    : currentLog?.entries.find((e) => e.day === todayDay);

  const pelletPrice = feedPrice(
    log?.pelletFeedCollectionId,
    feedCollections,
    FALLBACK_PELLET_PRICE,
  );
  const freshPrice = feedPrice(log?.freshFeedCollectionId, feedCollections, FALLBACK_FRESH_PRICE);

  const monthStats = useMemo(() => {
    let pellet = 0;
    let fresh = 0;
    let death = 0;
    Object.values(entriesByDay).forEach((e) => {
      pellet += n(e.pelletMorning) + n(e.pelletEvening);
      fresh += n(e.fresh);
      death += n(e.deathFishCount);
    });
    return {
      pellet,
      fresh,
      death,
      days: Object.keys(entriesByDay).length,
    };
  }, [entriesByDay]);
  const monthCost = monthStats.pellet * pelletPrice + monthStats.fresh * freshPrice;

  return (
    <View style={{ paddingTop: 12, paddingBottom: 24 }}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
        <TodayBanner entry={todayEntry} onOpenDailyLog={onOpenDailyLog} />
      </View>

      <MonthPicker
        monthDate={monthDate}
        loggedDays={monthStats.days}
        daysInMonth={daysInMonth}
        onPrev={goPrev}
        onNext={goNext}
        canGoNext={canGoNext}
      />

      <DayStrip
        daysInMonth={daysInMonth}
        todayDay={isCurrentMonth ? todayDay : -1}
        selected={selected}
        entriesByDay={entriesByDay}
        onSelect={setSelected}
        monthDate={monthDate}
        autoCenter={isCurrentMonth}
      />

      <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
        <Card padded={false}>
          <SelectedDayHeader
            isToday={isToday}
            date={selectedDate}
            entry={selectedEntry}
            isFuture={isFuture}
          />
          {selectedEntry ? (
            <SelectedDayDetail
              entry={selectedEntry}
              pelletName={log?.pelletFeedCollectionName ?? ''}
              freshName={log?.freshFeedCollectionName ?? ''}
              pelletPrice={pelletPrice}
              freshPrice={freshPrice}
            />
          ) : (
            <EmptyDay isFuture={isFuture} onOpenDailyLog={onOpenDailyLog} />
          )}
        </Card>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <SectionLabel>สรุปทั้งเดือน</SectionLabel>
        <Card padded={false}>
          <Row gap={0} style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
            <SummaryStat label="อาหารเม็ด" v={fmt.kg(monthStats.pellet)} toneKey="brand" />
            <Divider />
            <SummaryStat label="เหยื่อสด" v={fmt.kg(monthStats.fresh)} toneKey="success" />
            <Divider />
            <SummaryStat
              label="ปลาตาย"
              v={`${monthStats.death} ตัว`}
              toneKey={monthStats.death ? 'warn' : 'mute'}
            />
          </Row>
          <Sep />
          <MonthCostRow cost={monthCost} loggedDays={monthStats.days} daysInMonth={daysInMonth} />
        </Card>
      </View>
    </View>
  );
}

function TodayBanner({
  entry,
  onOpenDailyLog,
}: {
  entry: DailyLogEntry | undefined;
  onOpenDailyLog: () => void;
}) {
  const { t, mode } = useTheme();
  if (entry) {
    const total = totalKg(entry);
    const deaths = n(entry.deathFishCount);
    return (
      <View
        style={{
          backgroundColor: t.statusActiveSoft,
          borderWidth: 1,
          borderColor: t.statusActive + '4D',
          borderRadius: radii.lg,
          paddingVertical: 12,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: radii.sm,
            backgroundColor: t.statusActive,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.check size={20} color="#fff" stroke={2.4} />
        </View>
        <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: type.familyBold, fontSize: 14, color: t.statusActive }}>
            บันทึกวันนี้แล้ว
          </Text>
          <Text style={{ fontSize: 12, color: t.inkSoft, fontFamily: type.family }}>
            <Text>ให้อาหารรวม </Text>
            <Text style={{ fontFamily: type.familyNumSemi, color: t.ink }}>{fmt.kg(total)}</Text>
            {deaths > 0 ? (
              <>
                <Text> · ตาย </Text>
                <Text style={{ fontFamily: type.familyNumSemi, color: warnInk(mode, t) }}>
                  {deaths} ตัว
                </Text>
              </>
            ) : null}
          </Text>
        </Col>
        <Pressable
          onPress={onOpenDailyLog}
          accessibilityRole="button"
          accessibilityLabel="แก้ไขบันทึกวันนี้"
          style={{
            height: 34,
            paddingHorizontal: 12,
            borderRadius: radii.sm,
            borderWidth: 1,
            borderColor: t.statusActive + '80',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Icon.edit size={13} color={t.statusActive} />
          <Text style={{ fontFamily: type.familySemi, fontSize: 13, color: t.statusActive }}>
            แก้ไข
          </Text>
        </Pressable>
      </View>
    );
  }
  const wInk = warnInk(mode, t);
  return (
    <View
      style={{
        backgroundColor: t.warnSoft,
        borderWidth: 1,
        borderColor: t.warn + '66',
        borderRadius: radii.lg,
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radii.sm,
          backgroundColor: t.warn,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon.clock size={18} color="#fff" stroke={2.2} />
      </View>
      <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: type.familyBold, fontSize: 14, color: wInk }}>
          ยังไม่บันทึกข้อมูลวันนี้
        </Text>
        <Text style={{ fontSize: 12, color: t.inkSoft, fontFamily: type.family }}>
          กดเพื่อไปบันทึกอาหาร · ปลาตาย · จับปลา
        </Text>
      </Col>
      <Pressable
        onPress={onOpenDailyLog}
        accessibilityRole="button"
        accessibilityLabel="ไปหน้าบันทึก"
        style={{
          height: 36,
          paddingHorizontal: 14,
          borderRadius: radii.sm,
          backgroundColor: t.brand,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Text style={{ fontFamily: type.familyBold, fontSize: 13, color: '#fff' }}>ไปบันทึก</Text>
        <Icon.chevR size={14} color="#fff" />
      </Pressable>
    </View>
  );
}

function MonthPicker({
  monthDate,
  loggedDays,
  daysInMonth,
  onPrev,
  onNext,
  canGoNext,
}: {
  monthDate: Date;
  loggedDays: number;
  daysInMonth: number;
  onPrev: () => void;
  onNext: () => void;
  canGoNext: boolean;
}) {
  const { t } = useTheme();
  return (
    <Row justify="space-between" style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
      <Pressable
        onPress={onPrev}
        accessibilityRole="button"
        accessibilityLabel="เดือนก่อนหน้า"
        style={ghostBtn(t)}
      >
        <Icon.chevL size={18} color={t.ink} />
      </Pressable>
      <Col gap={1} align="center">
        <Text style={{ fontFamily: type.familyBold, fontSize: 17, color: t.ink }}>
          {thaiDate.monthYear(monthDate)}
        </Text>
        <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>
          <Text style={{ color: t.success, fontFamily: type.familyNumSemi }}>{loggedDays}</Text>
          <Text style={{ color: t.inkMute }}> / </Text>
          <Text style={{ fontFamily: type.familyNumSemi }}>{daysInMonth}</Text>
          <Text> วันที่บันทึกแล้ว</Text>
        </Text>
      </Col>
      <Pressable
        onPress={onNext}
        disabled={!canGoNext}
        accessibilityRole="button"
        accessibilityLabel="เดือนถัดไป"
        accessibilityState={{ disabled: !canGoNext }}
        style={[ghostBtn(t), { opacity: canGoNext ? 1 : 0.35 }]}
      >
        <Icon.chevR size={18} color={t.ink} />
      </Pressable>
    </Row>
  );
}

function DayStrip({
  daysInMonth,
  todayDay,
  selected,
  entriesByDay,
  onSelect,
  monthDate,
  autoCenter,
}: {
  daysInMonth: number;
  todayDay: number;
  selected: number;
  entriesByDay: Record<number, DailyLogEntry>;
  onSelect: (d: number) => void;
  monthDate: Date;
  autoCenter: boolean;
}) {
  const { t } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const widthRef = useRef(0);
  const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
  const centeredFor = useRef<string | null>(null);

  const centerOnToday = (viewportWidth: number) => {
    if (viewportWidth <= 0) return;
    if (!autoCenter) {
      scrollRef.current?.scrollTo({ x: 0, animated: false });
      return;
    }
    if (centeredFor.current === monthKey) return;
    const cellPitch = DAY_CELL_WIDTH + DAY_CELL_GAP;
    const cellLeft = (todayDay - 1) * cellPitch;
    const target = Math.max(0, cellLeft - viewportWidth / 2 + DAY_CELL_WIDTH / 2);
    scrollRef.current?.scrollTo({ x: target, animated: false });
    centeredFor.current = monthKey;
  };

  useEffect(() => {
    centerOnToday(widthRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey, autoCenter]);

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
    centerOnToday(widthRef.current);
  };

  const futureCutoff = autoCenter ? todayDay : daysInMonth;

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={onLayout}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4 }}
    >
      <Row gap={DAY_CELL_GAP}>
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const isSel = d === selected;
          const isToday = autoCenter && d === todayDay;
          const isFut = d > futureCutoff;
          const has = entriesByDay[d] != null;
          const dt = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
          const dotColor = has ? t.success : isFut ? null : t.warn;
          return (
            <Pressable
              key={d}
              disabled={isFut}
              onPress={() => onSelect(d)}
              accessibilityRole="button"
              accessibilityLabel={`วันที่ ${d}`}
              accessibilityState={{ selected: isSel, disabled: isFut }}
              style={{
                width: DAY_CELL_WIDTH,
                height: 64,
                borderRadius: 12,
                backgroundColor: isSel ? t.brand : isFut ? t.surfaceAlt : t.surface,
                borderWidth: isSel || isToday ? 2 : 1,
                borderColor: isSel || isToday ? t.brand : t.border,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 4,
                gap: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: isSel ? '#fff' : isFut ? t.inkMute : t.inkSoft,
                  fontFamily: type.familyMedium,
                }}
              >
                {TH_WEEKDAYS_SHORT[dt.getDay()]}
              </Text>
              <Text
                style={{
                  fontFamily: type.familyNumBold,
                  fontSize: 17,
                  color: isSel ? '#fff' : isFut ? t.inkMute : t.ink,
                }}
              >
                {d}
              </Text>
              {dotColor && !isSel ? (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: dotColor,
                    position: 'absolute',
                    bottom: 6,
                  }}
                />
              ) : null}
            </Pressable>
          );
        })}
      </Row>
    </ScrollView>
  );
}

function SelectedDayHeader({
  isToday,
  date,
  entry,
  isFuture,
}: {
  isToday: boolean;
  date: Date;
  entry: DailyLogEntry | undefined;
  isFuture: boolean;
}) {
  const { t, mode } = useTheme();
  return (
    <Row
      justify="space-between"
      style={{
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
      }}
    >
      <Col gap={2} style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
        <Text numberOfLines={1} style={{ fontFamily: type.familyBold, fontSize: 15, color: t.ink }}>
          {isToday ? 'วันนี้ · ' : ''}
          {thaiDate.long(date)}
        </Text>
        {entry ? (
          <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>
            อาหารรวม {fmt.kg(totalKg(entry))}
          </Text>
        ) : null}
      </Col>
      {entry ? (
        <Pill tone="success">
          <Row gap={4}>
            <Icon.check size={11} color={t.statusActive} />
            <Text style={{ color: t.statusActive, fontSize: 12, fontFamily: type.familyMedium }}>
              บันทึกแล้ว
            </Text>
          </Row>
        </Pill>
      ) : isFuture ? (
        <Pill tone="ghost">วันในอนาคต</Pill>
      ) : (
        <Pill tone="warn">
          <Row gap={4}>
            <Icon.clock size={11} color={warnInk(mode, t)} />
            <Text style={{ color: warnInk(mode, t), fontSize: 12, fontFamily: type.familyMedium }}>
              ไม่ได้บันทึก
            </Text>
          </Row>
        </Pill>
      )}
    </Row>
  );
}

function SelectedDayDetail({
  entry,
  pelletName,
  freshName,
  pelletPrice,
  freshPrice,
}: {
  entry: DailyLogEntry;
  pelletName: string;
  freshName: string;
  pelletPrice: number;
  freshPrice: number;
}) {
  const { t, mode } = useTheme();
  const pAm = n(entry.pelletMorning);
  const pPm = n(entry.pelletEvening);
  const f = n(entry.fresh);
  const deaths = n(entry.deathFishCount);
  const tourist = n(entry.touristCatchCount);
  const showTourist = tourist > 0;
  const cost = (pAm + pPm) * pelletPrice + f * freshPrice;
  return (
    <>
      <Sep />
      <ReadRow
        kind="pellet"
        title="อาหารเม็ด"
        subtitle={`${pelletName}${pelletName ? ' · ' : ''}฿${pelletPrice}/กก.`}
        am={pAm}
        pm={pPm}
        price={pelletPrice}
      />
      <Sep />
      <ReadRowSingle
        title="เหยื่อสด"
        subtitle={`${freshName}${freshName ? ' · ' : ''}฿${freshPrice}/กก.`}
        value={f}
        price={freshPrice}
      />
      <Sep />
      <Row style={{ paddingHorizontal: 16, paddingVertical: 14 }} gap={0}>
        <SummaryStat
          label="ปลาตาย"
          v={`${deaths}`}
          sub="ตัว"
          toneColor={deaths ? warnInk(mode, t) : t.inkMute}
        />
        <Divider />
        {showTourist ? (
          <>
            <SummaryStat label="จับปลาเป็น" v={`${tourist}`} sub="ตัว" toneColor={t.inkSoft} />
            <Divider />
          </>
        ) : null}
        <SummaryStat label="ต้นทุนวันนั้น" v={fmt.baht(cost)} toneColor={t.inkSoft} />
      </Row>
    </>
  );
}

function ReadRow({
  kind,
  title,
  subtitle,
  am,
  pm,
  price,
}: {
  kind: 'pellet';
  title: string;
  subtitle: string;
  am: number;
  pm: number;
  price: number;
}) {
  const { t } = useTheme();
  const amN = n(am);
  const pmN = n(pm);
  const total = amN + pmN;
  const tone = kind === 'pellet' ? t.brand : t.success;
  const toneSoft = kind === 'pellet' ? t.brandSoft : t.statusActiveSoft;
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <Row justify="space-between" style={{ marginBottom: 8 }}>
        <Row gap={10}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: radii.sm,
              backgroundColor: toneSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.feed size={16} color={tone} />
          </View>
          <Col gap={1}>
            <Text style={{ fontFamily: type.familyBold, fontSize: 14, color: t.ink }}>{title}</Text>
            <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>
              {subtitle}
            </Text>
          </Col>
        </Row>
        <Col gap={1} align="flex-end">
          <Text style={{ fontFamily: type.familyNumBold, fontSize: 16, color: t.ink }}>
            {fmt.kg(total)}
          </Text>
          <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.familyNum }}>
            {fmt.baht(total * price)}
          </Text>
        </Col>
      </Row>
      <Row gap={8}>
        <ReadCell label="เช้า" v={amN} unit="กก." />
        <ReadCell label="เย็น" v={pmN} unit="กก." />
      </Row>
    </View>
  );
}

function ReadRowSingle({
  title,
  subtitle,
  value,
  price,
}: {
  title: string;
  subtitle: string;
  value: number;
  price: number;
}) {
  const { t } = useTheme();
  const v = n(value);
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <Row justify="space-between" style={{ marginBottom: 8 }}>
        <Row gap={10}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: radii.sm,
              backgroundColor: t.statusActiveSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.feed size={16} color={t.success} />
          </View>
          <Col gap={1}>
            <Text style={{ fontFamily: type.familyBold, fontSize: 14, color: t.ink }}>{title}</Text>
            <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>
              {subtitle}
            </Text>
          </Col>
        </Row>
        <Col gap={1} align="flex-end">
          <Text style={{ fontFamily: type.familyNumBold, fontSize: 16, color: t.ink }}>
            {fmt.kg(v)}
          </Text>
          <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.familyNum }}>
            {fmt.baht(v * price)}
          </Text>
        </Col>
      </Row>
      <ReadCell label="วันนี้" v={v} unit="กก." />
    </View>
  );
}

function ReadCell({ label, v, unit }: { label: string; v: number; unit: string }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        borderRadius: radii.sm,
        backgroundColor: t.surfaceAlt,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
      }}
    >
      <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.familySemi }}>{label}</Text>
      <Row gap={3}>
        <Text style={{ fontFamily: type.familyNumSemi, fontSize: 15, color: t.ink }}>
          {n(v).toLocaleString('en-US', { maximumFractionDigits: 1 })}
        </Text>
        <Text style={{ fontSize: 10, color: t.inkMute, fontFamily: type.familyNum }}>{unit}</Text>
      </Row>
    </View>
  );
}

type ToneKey = 'brand' | 'success' | 'warn' | 'mute';

function SummaryStat({
  label,
  v,
  sub,
  toneKey,
  toneColor,
}: {
  label: string;
  v: string;
  sub?: string;
  toneKey?: ToneKey;
  toneColor?: string;
}) {
  const { t, mode } = useTheme();
  const resolved =
    toneColor ??
    (toneKey === 'brand'
      ? t.brand
      : toneKey === 'success'
        ? t.success
        : toneKey === 'warn'
          ? warnInk(mode, t)
          : toneKey === 'mute'
            ? t.inkMute
            : t.ink);
  return (
    <Col gap={2} align="center" style={{ flex: 1 }}>
      <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.familyMedium }}>{label}</Text>
      <Row gap={3} align="baseline">
        <Text style={{ fontFamily: type.familyNumBold, fontSize: 16, color: resolved }}>{v}</Text>
        {sub ? (
          <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.familyNum }}>{sub}</Text>
        ) : null}
      </Row>
    </Col>
  );
}

function MonthCostRow({
  cost,
  loggedDays,
  daysInMonth,
}: {
  cost: number;
  loggedDays: number;
  daysInMonth: number;
}) {
  const { t } = useTheme();
  return (
    <Row justify="space-between" style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <Col gap={1}>
        <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
          ต้นทุนอาหารเดือนนี้
        </Text>
        <Text style={{ fontFamily: type.familyNumBold, fontSize: 18, color: t.ink }}>
          {fmt.baht(cost)}
        </Text>
      </Col>
      <Col gap={1} align="flex-end">
        <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>บันทึกครบ</Text>
        <Text style={{ fontFamily: type.familyNumBold, fontSize: 16, color: t.ink }}>
          <Text>{loggedDays}</Text>
          <Text style={{ color: t.inkMute, fontFamily: type.familyNumMedium }}>/{daysInMonth}</Text>
          <Text style={{ color: t.ink, fontFamily: type.familyMedium }}> วัน</Text>
        </Text>
      </Col>
    </Row>
  );
}

function EmptyDay({ isFuture, onOpenDailyLog }: { isFuture: boolean; onOpenDailyLog: () => void }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 22,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: radii.md,
          backgroundColor: t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        <Icon.doc size={26} color={t.inkMute} />
      </View>
      <Text
        style={{
          fontFamily: type.familySemi,
          fontSize: 14,
          color: t.ink,
          marginBottom: 4,
          textAlign: 'center',
        }}
      >
        {isFuture ? 'ยังไม่ถึงวัน' : 'ไม่มีข้อมูลวันนี้'}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: t.inkMute,
          marginBottom: isFuture ? 0 : 14,
          textAlign: 'center',
          fontFamily: type.family,
        }}
      >
        {isFuture ? 'รอบันทึกเมื่อถึงวัน' : 'บันทึกข้อมูลย้อนหลังได้จากหน้าบันทึก'}
      </Text>
      {!isFuture ? (
        <Pressable
          onPress={onOpenDailyLog}
          accessibilityRole="button"
          accessibilityLabel="ไปหน้าบันทึก"
          style={{
            height: 38,
            paddingHorizontal: 16,
            borderRadius: radii.sm,
            backgroundColor: t.brand,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Text style={{ fontFamily: type.familyBold, fontSize: 13, color: '#fff' }}>ไปบันทึก</Text>
          <Icon.chevR size={14} color="#fff" />
        </Pressable>
      ) : null}
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const { t } = useTheme();
  return (
    <Text
      style={{
        fontSize: 11,
        fontFamily: type.familyBold,
        color: t.inkMute,
        letterSpacing: 0.6,
        marginBottom: 8,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Text>
  );
}

function Divider() {
  const { t } = useTheme();
  return <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: t.border }} />;
}

function Sep() {
  const { t } = useTheme();
  return <View style={{ height: 1, backgroundColor: t.border, marginHorizontal: CARD_PAD }} />;
}

function ghostBtn(t: ReturnType<typeof useTheme>['t']) {
  return {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: t.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
}

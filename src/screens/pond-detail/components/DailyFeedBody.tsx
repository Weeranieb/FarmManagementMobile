import { useMemo, useState } from 'react';
import { Pressable, View, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { warnInk } from '@/theme/ink';
import { Card } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { thaiDate } from '@/locale/thaiDate';
import { fmt } from '@/utils/fmt';
import {
  useDailyLogData,
  monthStrFromDate,
  monthStrToStartDate,
  daysInMonthFromStr,
  monthStatsFromEntries,
  pelletKg,
  num,
  type DailyLogEntry,
} from '@/features/daily-log';

type Props = {
  pondId: number;
  /** Opens the pond-month ledger (phone). Falls back to `onOpenDailyLog` when
   *  absent — the tablet master/detail has no ledger route of its own. */
  onOpenLedger?: () => void;
  onOpenDailyLog: () => void;
};

const numText = (v: number): string => Number(v).toLocaleString('en-US', { maximumFractionDigits: 1 });

/**
 * ข้อมูลรายวัน tab — a compact, glanceable recap. The month-at-a-glance table
 * and all editing now live in the dedicated pond-ledger screen; this tab answers
 * only "did I log today?" and "how's the month going?", then hands off.
 */
export function DailyFeedBody({ pondId, onOpenLedger, onOpenDailyLog }: Props) {
  const open = onOpenLedger ?? onOpenDailyLog;
  // Fresh at mount so the recap doesn't stale across midnight.
  const [now] = useState(() => new Date());
  const monthStr = monthStrFromDate(now);
  const monthDate = monthStrToStartDate(monthStr);
  const nDays = daysInMonthFromStr(monthStr);
  const todayDay = now.getDate();

  const { data: log } = useDailyLogData(pondId, monthStr);
  const entries = useMemo(() => log?.entries ?? [], [log]);
  const stats = useMemo(() => monthStatsFromEntries(entries), [entries]);
  const loggedToday = entries.some((e) => e.day === todayDay);
  const recent = useMemo(() => [...entries].sort((a, b) => b.day - a.day).slice(0, 3), [entries]);

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, gap: 12 }}>
      {!loggedToday ? <UnloggedNudge onPress={open} /> : null}
      <MonthLedgerCard
        monthLabel={thaiDate.monthYear(monthDate)}
        loggedDays={stats.days}
        nDays={nDays}
        pellet={stats.pellet}
        death={stats.death}
        recent={recent}
        onPress={open}
      />
    </View>
  );
}

function UnloggedNudge({ onPress }: { onPress: () => void }) {
  const { t, mode } = useTheme();
  const wInk = warnInk(mode, t);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: radii.lg,
        backgroundColor: t.warnSoft,
        borderWidth: 1,
        borderColor: t.warn + '4D',
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
        <Text style={{ fontFamily: type.familyBold, fontSize: 14, lineHeight: 22, color: wInk }}>
          วันนี้ยังไม่บันทึก
        </Text>
        <Text style={{ fontSize: 12, lineHeight: 18, color: t.inkSoft, fontFamily: type.family }}>
          อาหาร · ปลาตาย · จับปลา
        </Text>
      </Col>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="ไปบันทึก"
        style={{
          height: 40,
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

function MonthLedgerCard({
  monthLabel,
  loggedDays,
  nDays,
  pellet,
  death,
  recent,
  onPress,
}: {
  monthLabel: string;
  loggedDays: number;
  nDays: number;
  pellet: number;
  death: number;
  recent: DailyLogEntry[];
  onPress: () => void;
}) {
  const { t } = useTheme();
  return (
    <Card onPress={onPress} padded={false}>
      <View style={{ padding: 16 }}>
        <Row justify="space-between">
          <Text
            style={{
              fontSize: 11,
              lineHeight: 16,
              fontFamily: type.familyBold,
              letterSpacing: 0.4,
              color: t.brandInk,
              textTransform: 'uppercase',
            }}
          >
            ตารางบันทึกรายเดือน
          </Text>
          <Icon.chevR size={18} color={t.inkMute} />
        </Row>

        <Row gap={8} align="baseline" style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 16, lineHeight: 24, fontFamily: type.familyBold, color: t.ink }}>
            {monthLabel}
          </Text>
          <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.familyNum }}>
            บันทึกแล้ว {loggedDays}/{nDays} วัน
          </Text>
        </Row>

        <Row gap={20} style={{ marginTop: 12 }}>
          <DetailStat label="อาหารรวม" value={fmt.kg(pellet)} dot={t.move} />
          <DetailStat label="ตายรวม" value={`${death} ตัว`} dot={t.warn} />
        </Row>

        {recent.length > 0 ? (
          <Col gap={6} style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: t.border }}>
            {recent.map((e) => (
              <Row key={e.day} gap={8}>
                <Text style={{ minWidth: 54, fontFamily: type.familyNumBold, fontSize: 12, color: t.ink }}>
                  วันที่ {e.day}
                </Text>
                <Text style={{ fontFamily: type.familyNum, fontSize: 12, color: t.inkSoft }}>
                  เม็ด {numText(pelletKg(e))} · สด {numText(num(e.fresh))} · ตาย {num(e.deathFishCount)}
                </Text>
              </Row>
            ))}
          </Col>
        ) : null}

        <View
          style={{
            marginTop: 12,
            height: 44,
            borderRadius: radii.md,
            backgroundColor: t.brandSoft,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 6,
          }}
        >
          <Text style={{ fontFamily: type.familyBold, fontSize: 14, color: t.brandInk }}>
            เปิดตารางรายเดือน
          </Text>
          <Icon.arrow size={16} color={t.brandInk} />
        </View>
      </View>
    </Card>
  );
}

function DetailStat({ label, value, dot }: { label: string; value: string; dot: string }) {
  const { t } = useTheme();
  return (
    <Col gap={3}>
      <Row gap={5}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dot }} />
        <Text style={{ fontSize: 11, lineHeight: 16, color: t.inkMute, fontFamily: type.family }}>{label}</Text>
      </Row>
      <Text style={{ fontFamily: type.familyNumBold, fontSize: 17, color: t.ink }}>{value}</Text>
    </Col>
  );
}

// ผลประกอบการรอบเลี้ยง — Pond production-cycle P&L (third pond-detail tab).
// One card per cycle, newest first (active on top). Mirrors GET /pond/:id/cycles.
//
// Field semantics honoured verbatim — never recomputed here:
//   · isActive        → "รอบปัจจุบัน" badge; endDate shows "กำลังเลี้ยง";
//                        netResult is a live estimate → "ประมาณการ" chip.
//   · netResult       → the hero. green ≥0 / red <0, always signed.
//   · feedCost = null → legacy cycle: show "—" + a notice that netResult does
//                       NOT yet subtract feed. Displayed exactly as received.
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/theme/ThemeProvider';
import { type, radii } from '@/theme/tokens';
import { dangerInk, warnInk } from '@/theme/ink';
import { Card, Pill, PillText, Skeleton, Btn } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { fmt, FISH_TH } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import { usePondCyclesData, pondKeys, type PondCycleModel } from '@/features/pond';

const DAY_MS = 86_400_000;

function daysBetween(a: Date, b: Date): number {
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / DAY_MS));
}

export function CycleBody({ pondId }: { pondId: number }) {
  const { data: cycles, isLoading, isError } = usePondCyclesData(pondId);
  const qc = useQueryClient();
  const onRetry = useCallback(() => {
    void qc.invalidateQueries({ queryKey: pondKeys.cycles(pondId) });
  }, [qc, pondId]);

  if (isLoading && cycles.length === 0) {
    return (
      <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 12, paddingBottom: 20 }}>
        <CycleSkeleton />
        <CycleSkeleton />
      </View>
    );
  }

  if (isError) {
    return <CycleError onRetry={onRetry} />;
  }

  if (cycles.length === 0) {
    return <CycleEmpty />;
  }

  const closed = cycles.filter((c) => !c.isActive).length;
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 12, paddingBottom: 20 }}>
      <SectionHeader total={cycles.length} closed={closed} />
      {cycles.map((c) => (
        <CycleCard key={c.id} c={c} />
      ))}
    </View>
  );
}

function SectionHeader({ total, closed }: { total: number; closed: number }) {
  const { t } = useTheme();
  const countText = closed > 0 ? `ทั้งหมด ${total} รอบ · ปิดแล้ว ${closed}` : `ทั้งหมด ${total} รอบ`;
  return (
    <Row justify="space-between" align="center" style={{ paddingHorizontal: 2 }}>
      <Text
        style={{
          fontSize: type.sizes.sm,
          fontFamily: type.familyBold,
          color: t.ink,
        }}
      >
        ประวัติรอบเลี้ยง
      </Text>
      <Text style={{ fontSize: type.sizes.sm, fontFamily: type.familyNum, color: t.inkSoft }}>
        {countText}
      </Text>
    </Row>
  );
}

function CycleCard({ c }: { c: PondCycleModel }) {
  const { t, mode } = useTheme();
  const active = c.isActive;
  const netColor = c.netResult >= 0 ? t.success : dangerInk(mode, t);
  const start = new Date(c.startDate);
  const end = c.endDate ? new Date(c.endDate) : null;
  const dur = daysBetween(start, end ?? new Date());
  const feedMissing = c.feedCost == null;

  return (
    <Card
      padded={false}
      style={{
        overflow: 'hidden',
        ...(active ? { borderColor: t.brand, borderWidth: 1.5 } : null),
      }}
    >
      {/* header: status + fish + duration */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 }}>
        <Row justify="space-between" align="center" style={{ marginBottom: 12 }}>
          <Row gap={8} wrap style={{ flex: 1, minWidth: 0 }}>
            {active ? (
              <Pill tone="brand">
                <Icon.cycle size={12} color={t.brandInk} />
                <PillText tone="brand">รอบปัจจุบัน</PillText>
              </Pill>
            ) : (
              // Outlined status pill (design's `ghost` primitive carries a
              // border; mobile's `ghost` tone is borderless for fish chips, so
              // restore the outline locally here to read as a status pill).
              <Pill tone="ghost" style={{ borderWidth: 1, borderColor: t.border }}>
                ปิดรอบแล้ว
              </Pill>
            )}
            {c.fishTypes.map((f) => (
              <Pill key={f} tone="neutral">
                {FISH_TH[f] ?? f}
              </Pill>
            ))}
          </Row>
          <Col gap={1} align="flex-end" style={{ marginLeft: 8, flexShrink: 0 }}>
            <Text style={{ fontSize: type.sizes.xs, fontFamily: type.familySemi, color: t.inkMute }}>
              อายุรอบ
            </Text>
            <Text style={{ fontSize: type.sizes.sm, fontFamily: type.familyNumSemi, color: t.inkSoft }}>
              {dur.toLocaleString('en-US')} วัน
            </Text>
          </Col>
        </Row>

        {/* date range */}
        <Row gap={6}>
          <Icon.calendar size={13} color={t.inkMute} />
          <Text style={{ fontSize: type.sizes.sm, fontFamily: type.familyNum, color: t.inkSoft }}>
            {thaiDate.short(start)}
          </Text>
          <Text style={{ fontSize: type.sizes.sm, color: t.inkMute }}>→</Text>
          {end ? (
            <Text
              style={{ fontSize: type.sizes.sm, fontFamily: type.familyNum, color: t.inkSoft }}
            >
              {thaiDate.short(end)}
            </Text>
          ) : (
            <Text
              style={{ fontSize: type.sizes.sm, fontFamily: type.familySemi, color: t.brandInk }}
            >
              กำลังเลี้ยง
            </Text>
          )}
        </Row>
      </View>

      {/* hero: net result (+ remaining fish for the active cycle) */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <Row justify="space-between" align="flex-end" gap={10}>
          <View style={{ minWidth: 0, flexShrink: 1 }}>
            <Row gap={6} style={{ marginBottom: 2 }}>
              <Text
                style={{ fontSize: type.sizes.xs, fontFamily: type.familySemi, color: t.inkMute }}
              >
                กำไรสุทธิ
              </Text>
              {active ? (
                <Pill tone="warn" style={{ paddingVertical: 2, paddingHorizontal: 7 }}>
                  <PillText tone="warn">ประมาณการ</PillText>
                </Pill>
              ) : null}
            </Row>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={{
                fontFamily: type.familyNumBold,
                fontSize: type.sizes.xl,
                color: netColor,
                lineHeight: 28,
              }}
            >
              {fmt.signedBaht(c.netResult)}
            </Text>
          </View>
          {active ? (
            <Col gap={2} align="flex-end" style={{ flexShrink: 0 }}>
              <Text
                style={{ fontSize: type.sizes.xs, fontFamily: type.familySemi, color: t.inkMute }}
              >
                ปลาคงเหลือ
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
                <Text
                  style={{ fontFamily: type.familyNumBold, fontSize: type.sizes.md, color: t.ink }}
                >
                  {fmt.num(c.totalFish)}
                </Text>
                <Text
                  style={{ fontSize: type.sizes.xs, fontFamily: type.familyMedium, color: t.inkMute }}
                >
                  ตัว
                </Text>
              </View>
            </Col>
          ) : null}
        </Row>
      </View>

      {/* breakdown: revenue / cost / feed */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: t.border,
          backgroundColor: t.surfaceAlt,
          paddingVertical: 12,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'stretch',
        }}
      >
        <MoneyCol label="รายได้" value={fmt.baht(c.totalRevenue)} color={t.ink} />
        <ColDivider />
        <MoneyCol label="ต้นทุน" value={fmt.baht(c.totalCost)} color={t.inkSoft} />
        <ColDivider />
        <MoneyCol
          label="ค่าอาหาร"
          value={feedMissing ? '—' : fmt.baht(c.feedCost as number)}
          color={feedMissing ? t.inkMute : t.inkSoft}
        />
      </View>

      {/* legacy feed-cost notice */}
      {feedMissing ? (
        <Row
          gap={7}
          align="flex-start"
          style={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
            backgroundColor: t.warnSoft,
            borderTopWidth: 1,
            borderTopColor: t.border,
          }}
        >
          <View style={{ marginTop: 1 }}>
            <Icon.warn size={14} color={warnInk(mode, t)} />
          </View>
          <Text
            style={{
              flex: 1,
              fontSize: type.sizes.sm,
              color: t.inkSoft,
              fontFamily: type.family,
              lineHeight: 19,
            }}
          >
            ไม่มีข้อมูลค่าอาหารในรอบนี้ · กำไรสุทธิยัง
            <Text style={{ fontFamily: type.familyBold, color: t.ink }}>ไม่ได้หักค่าอาหาร</Text>
          </Text>
        </Row>
      ) : null}
    </Card>
  );
}

function MoneyCol({ label, value, color }: { label: string; value: string; color: string }) {
  const { t } = useTheme();
  return (
    <Col gap={3} align="center" style={{ flex: 1, minWidth: 0 }}>
      <Text style={{ fontSize: type.sizes.xs, color: t.inkMute }}>{label}</Text>
      <Text
        numberOfLines={1}
        style={{ fontFamily: type.familyNumBold, fontSize: type.sizes.base, color }}
      >
        {value}
      </Text>
    </Col>
  );
}

function ColDivider() {
  const { t } = useTheme();
  return <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: t.border }} />;
}

function CycleSkeleton() {
  const { t } = useTheme();
  return (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      <Col gap={12} style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}>
        <Row gap={8}>
          <Skeleton width={92} height={22} radius={radii.pill} />
          <Skeleton width={54} height={22} radius={radii.pill} />
        </Row>
        <Skeleton width="55%" height={12} />
        <Skeleton width="42%" height={24} radius={radii.xs} />
      </Col>
      <Row
        justify="space-around"
        style={{
          borderTopWidth: 1,
          borderTopColor: t.border,
          backgroundColor: t.surfaceAlt,
          paddingVertical: 14,
        }}
      >
        <Skeleton width={48} height={14} />
        <Skeleton width={48} height={14} />
        <Skeleton width={48} height={14} />
      </Row>
    </Card>
  );
}

function CycleEmpty() {
  const { t } = useTheme();
  return (
    <View style={{ paddingHorizontal: 24, paddingVertical: 40, alignItems: 'center' }}>
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: radii.md,
          backgroundColor: t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Icon.cycle size={24} color={t.inkMute} />
      </View>
      <Text style={{ fontSize: type.sizes.base, fontFamily: type.familyBold, color: t.ink }}>
        ยังไม่มีรอบเลี้ยง
      </Text>
      <Text
        style={{
          fontSize: type.sizes.sm,
          color: t.inkMute,
          fontFamily: type.family,
          marginTop: 4,
          textAlign: 'center',
          lineHeight: 20,
        }}
      >
        เมื่อเริ่มลงปลา รอบเลี้ยงและผลประกอบการจะแสดงที่นี่
      </Text>
    </View>
  );
}

function CycleError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTheme();
  return (
    <View style={{ paddingHorizontal: 24, paddingVertical: 34, alignItems: 'center' }}>
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: radii.md,
          backgroundColor: t.dangerSoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Icon.warn size={24} color={t.danger} />
      </View>
      <Text style={{ fontSize: type.sizes.base, fontFamily: type.familyBold, color: t.ink }}>
        โหลดข้อมูลรอบเลี้ยงไม่สำเร็จ
      </Text>
      <Text
        style={{
          fontSize: type.sizes.sm,
          color: t.inkMute,
          fontFamily: type.family,
          marginTop: 4,
          marginBottom: 14,
          textAlign: 'center',
        }}
      >
        ตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง
      </Text>
      <Btn
        tone="brand"
        variant="ghost"
        size="md"
        leading={<Icon.cycle size={16} color={t.brandInk} />}
        onPress={onRetry}
      >
        ลองอีกครั้ง
      </Btn>
    </View>
  );
}

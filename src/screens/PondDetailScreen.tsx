import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type, radii } from '@/theme/tokens';
import { Card, TopBar } from '@/components/ui';
import { Icon, type IconName } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { StatusBadge } from '@/components/domain/StatusPip';
import { FishChips } from '@/components/domain/FishChips';
import { fmt, FISH_TH } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import { activitiesByPond, today } from '@/mock/data';
import type { ActivityMock, PondMock } from '@/mock/data';
import { useFarmsData, usePondData } from '@/data';
import { PondDailyLogPanel } from '@/screens/pond-daily-log/PondDailyLogForm';

type Props = {
  pondId: number;
  onBack?: () => void;
  onAction?: (kind: 'fill' | 'move' | 'sell') => void;
  /** @deprecated Daily log is embedded in the feed tab; kept for call-site compatibility. */
  onOpenDailyLog?: () => void;
  showHeader?: boolean;
};

export function PondDetailScreen({
  pondId,
  onBack,
  onAction,
  onOpenDailyLog: _onOpenDailyLog,
  showHeader = true,
}: Props) {
  const { t } = useTheme();
  const onPondOverflow = () => {
    Alert.alert('เมนู', 'ฟีเจอร์นี้จะเปิดใช้งานเร็วๆ นี้');
  };
  const [tab, setTab] = useState<'feed' | 'history'>('feed');
  const {
    data: pondRaw,
    isLoading,
    isError,
  } = usePondData(Number.isFinite(pondId) ? pondId : undefined);
  const { data: farmsRaw } = useFarmsData();
  const farms = Array.isArray(farmsRaw) ? farmsRaw : [];
  const pond = pondRaw as PondMock | null;
  const farmSubtitle =
    pond?.farmName?.trim() ||
    (pond ? farms.find((f) => f.id === pond.farmId)?.name : undefined) ||
    '';

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        {showHeader ? (
          <TopBar
            title=""
            subtitle=""
            leading={
              onBack ? (
                <Pressable
                  onPress={onBack}
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
                  <Icon.back size={18} color={t.ink} />
                </Pressable>
              ) : null
            }
          />
        ) : null}
        <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
          <Text
            style={{
              fontSize: 15,
              color: t.inkSoft,
              fontFamily: type.family,
              textAlign: 'center',
            }}
          >
            กำลังโหลดข้อมูลบ่อ…
          </Text>
        </View>
      </View>
    );
  }

  if (isError || !pond) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        {showHeader ? (
          <TopBar
            title="ไม่พบบ่อ"
            subtitle=""
            leading={
              onBack ? (
                <Pressable
                  onPress={onBack}
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
                  <Icon.back size={18} color={t.ink} />
                </Pressable>
              ) : null
            }
          />
        ) : null}
        <View style={{ padding: 24 }}>
          <Text style={{ fontSize: 15, color: t.inkSoft, fontFamily: type.family }}>
            {isError ? 'โหลดข้อมูลบ่อไม่สำเร็จ — โปรดลองใหม่' : `ไม่มีบ่อหมายเลข ${pondId} ในระบบ`}
          </Text>
        </View>
      </View>
    );
  }
  const isMaint = pond.status === 'maintenance';

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? (
        <TopBar
          title={pond.name}
          subtitle={farmSubtitle}
          leading={
            onBack ? (
              <Pressable
                onPress={onBack}
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
                <Icon.back size={18} color={t.ink} />
              </Pressable>
            ) : null
          }
          trailing={
            <Pressable
              onPress={onPondOverflow}
              accessibilityRole="button"
              accessibilityLabel="เมนูเพิ่มเติม"
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
              <Icon.more size={18} color={t.ink} />
            </Pressable>
          }
        />
      ) : null}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 20, paddingBottom: 12 }}>
          <Card padded={false}>
            <View style={{ padding: 16 }}>
              <Row justify="space-between" style={{ marginBottom: 10 }}>
                <Row gap={6}>
                  <StatusBadge s={pond.status} />
                  {!isMaint ? <FishChips types={pond.fishTypes} /> : null}
                </Row>
                {!isMaint && pond.startDate ? (
                  <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
                    เริ่มรอบ {thaiDate.short(new Date(pond.startDate))}
                  </Text>
                ) : null}
              </Row>
              {!isMaint ? (
                <Row gap={0}>
                  <PondStat label="ปลาในบ่อ" v={fmt.num(pond.totalFish)} sub="ตัว" />
                  <Divider />
                  <PondStat label="อายุรอบ" v={String(pond.ageDays ?? 0)} sub="วัน" />
                  <Divider />
                  <PondStat label="ต้นทุน" v="฿62K" />
                </Row>
              ) : (
                <Col gap={4}>
                  <Text style={{ fontSize: 14, color: t.inkSoft, fontFamily: type.family }}>
                    บ่อพักอยู่
                  </Text>
                  <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
                    รอบล่าสุด: ขาย {thaiDate.ago(new Date(pond.latestActivityDate), today)} ·
                    กำไรสุทธิ{' '}
                    <Text style={{ color: t.success, fontFamily: type.familySemi }}>+฿84,200</Text>
                  </Text>
                </Col>
              )}
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          <Row gap={8}>
            <ActionPill
              tone="fill"
              icon="plus"
              label="เติมปลา"
              onPress={() => onAction?.('fill')}
            />
            <ActionPill
              tone="move"
              icon="swap"
              label="ย้ายปลา"
              disabled={isMaint}
              onPress={() => onAction?.('move')}
            />
            <ActionPill
              tone="sell"
              icon="tag"
              label="ขายปลา"
              disabled={isMaint}
              onPress={() => onAction?.('sell')}
            />
          </Row>
        </View>

        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: t.border,
            paddingHorizontal: 20,
            flexDirection: 'row',
            gap: 24,
          }}
        >
          {(
            [
              { id: 'feed', label: 'บันทึกอาหารรายวัน' },
              { id: 'history', label: 'ประวัติกิจกรรม' },
            ] as const
          ).map((opt) => {
            const sel = tab === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setTab(opt.id)}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 2,
                  borderBottomColor: sel ? t.brand : 'transparent',
                  marginBottom: -1,
                }}
              >
                <Text
                  style={{
                    color: sel ? t.ink : t.inkMute,
                    fontFamily: sel ? type.familyBold : type.familyMedium,
                    fontSize: 14,
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === 'feed' ? <PondDailyLogPanel pondId={pond.id} /> : <HistoryBody pondId={pond.id} />}
      </ScrollView>
    </View>
  );
}

function PondStat({ label, v, sub }: { label: string; v: string; sub?: string }) {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, gap: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={{ fontFamily: type.familyNumBold, fontSize: 18, color: t.ink }}>{v}</Text>
        {sub ? (
          <Text
            style={{ fontSize: 11, color: t.inkMute, marginLeft: 3, fontFamily: type.familyMedium }}
          >
            {sub}
          </Text>
        ) : null}
      </View>
      <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>{label}</Text>
    </View>
  );
}

function Divider() {
  const { t } = useTheme();
  return (
    <View
      style={{ width: 1, alignSelf: 'stretch', backgroundColor: t.border, marginHorizontal: 8 }}
    />
  );
}

function ActionPill({
  tone,
  icon,
  label,
  onPress,
  disabled,
}: {
  tone: 'fill' | 'move' | 'sell';
  icon: IconName;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const { t } = useTheme();
  const Ico = Icon[icon];
  const map = {
    fill: { soft: t.fillSoft, ink: t.fillInk, accent: t.fill },
    move: { soft: t.moveSoft, ink: t.moveInk, accent: t.move },
    sell: { soft: t.sellSoft, ink: t.sellInk, accent: t.sell },
  };
  const { soft, ink, accent } = map[tone];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 52,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: radii.lg,
        backgroundColor: soft,
        borderWidth: 1.5,
        borderColor: disabled ? t.border : accent,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
        opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
      })}
    >
      <Ico size={18} color={ink} stroke={2.25} />
      <Text
        numberOfLines={1}
        style={{ color: ink, fontFamily: type.familyBold, fontSize: 15 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function HistoryBody({ pondId }: { pondId: number }) {
  const list = activitiesByPond[pondId] ?? [];
  if (list.length === 0) {
    return (
      <View style={{ padding: 32, alignItems: 'center' }}>
        <EmptyState />
      </View>
    );
  }
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 12, paddingBottom: 20 }}>
      {list.map((a) => (
        <ActivityHistoryCard key={a.id} a={a} />
      ))}
    </View>
  );
}

function EmptyState() {
  const { t } = useTheme();
  return (
    <Col gap={6} align="center">
      <Icon.doc size={28} color={t.inkMute} />
      <Text style={{ color: t.inkSoft, fontFamily: type.family, fontSize: 13 }}>
        ยังไม่มีประวัติกิจกรรมในบ่อนี้
      </Text>
    </Col>
  );
}

function ActivityHistoryCard({ a }: { a: ActivityMock }) {
  const { t } = useTheme();
  const labelMap = {
    fill: 'เติมปลา',
    move: 'ย้ายปลา',
    sell: 'ขายปลา',
  } as const;
  const accentMap = {
    fill: { fg: t.fillInk, bg: t.fillSoft, border: t.fill },
    move: { fg: t.moveInk, bg: t.moveSoft, border: t.move },
    sell: { fg: t.sellInk, bg: t.sellSoft, border: t.sell },
  } as const;
  const { fg, bg, border } = accentMap[a.mode];
  const amountRight =
    a.mode === 'sell' && a.total > 0 ? `+${fmt.baht(a.total)}` : `${fmt.num(a.amount)} ตัว`;

  return (
    <Card
      padded={false}
      style={{ overflow: 'hidden', borderLeftWidth: 4, borderLeftColor: border }}
    >
      <View style={{ padding: 16, gap: 10, backgroundColor: bg + '18' }}>
        <Row justify="space-between" align="flex-start">
          <Col gap={6} style={{ flex: 1, minWidth: 0 }}>
            <Row gap={8} style={{ flexWrap: 'wrap' }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: radii.md,
                  backgroundColor: bg,
                }}
              >
                <Text style={{ color: fg, fontFamily: type.familyBold, fontSize: 13 }}>
                  {labelMap[a.mode]}
                </Text>
              </View>
              <Text style={{ color: t.inkMute, fontFamily: type.family, fontSize: 13 }}>
                {thaiDate.short(new Date(a.date))}
              </Text>
            </Row>
            <Text style={{ fontSize: 14, color: t.ink, fontFamily: type.family }}>
              {FISH_TH[a.fishType] ?? a.fishType}
              {a.merchant ? ` — ${a.merchant}` : ''}
              {a.mode !== 'sell' && a.total > 0 ? ` · ${fmt.baht(a.total)}` : ''}
            </Text>
            {a.remark ? (
              <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
                {a.remark}
              </Text>
            ) : null}
          </Col>
          <Text
            style={{
              fontFamily: type.familyNumBold,
              fontSize: 16,
              color: a.mode === 'sell' ? t.sellInk : t.ink,
              marginLeft: 8,
            }}
          >
            {amountRight}
          </Text>
        </Row>
      </View>
    </Card>
  );
}

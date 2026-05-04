import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type, radii } from '@/theme/tokens';
import { Btn, Card, TopBar } from '@/components/ui';
import { Icon, type IconName } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { StatusBadge } from '@/components/domain/StatusPip';
import { FishChips } from '@/components/domain/FishChips';
import { fmt, FISH_TH } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import { ponds, activitiesByPond, today } from '@/mock/data';
import type { ActivityMock } from '@/mock/data';

type Props = {
  pondId: number;
  onBack?: () => void;
  onAction?: (kind: 'fill' | 'move' | 'sell') => void;
  onOpenDailyLog?: () => void;
  showHeader?: boolean;
};

export function PondDetailScreen({
  pondId,
  onBack,
  onAction,
  onOpenDailyLog,
  showHeader = true,
}: Props) {
  const { t } = useTheme();
  const [tab, setTab] = useState<'feed' | 'history'>('feed');
  const pond = ponds.find((p) => p.id === pondId) ?? ponds[0];
  if (!pond) return null;
  const isMaint = pond.status === 'maintenance';

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? (
        <TopBar
          title={pond.name}
          subtitle={pond.farmName}
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
                    บ่อนี้ปิดอยู่
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

        {tab === 'feed' ? <FeedBody onOpen={onOpenDailyLog} /> : <HistoryBody pondId={pond.id} />}
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
      style={({ pressed }) => ({
        flex: 1,
        height: 56,
        borderRadius: radii.md,
        backgroundColor: soft,
        borderWidth: 1.5,
        borderColor: disabled ? t.border : accent + '30',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
      })}
    >
      <Ico size={18} color={ink} />
      <Text style={{ color: ink, fontFamily: type.familyBold, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

function FeedBody({ onOpen }: { onOpen?: () => void }) {
  const { t } = useTheme();
  return (
    <View style={{ padding: 20 }}>
      <Card>
        <Col gap={6}>
          <Text style={{ fontSize: 14, fontFamily: type.familySemi, color: t.ink }}>
            บันทึกอาหารรายวัน
          </Text>
          <Text style={{ fontSize: 13, color: t.inkSoft, fontFamily: type.family }}>
            กดเพื่อเปิดสมุดบันทึกประจำเดือน — เช้า/เย็น/ปลาตาย/จับปลาเป็น
          </Text>
        </Col>
        <View style={{ marginTop: 12 }}>
          <Btn tone="brand" block onPress={onOpen}>
            เปิดสมุดบันทึก
          </Btn>
        </View>
      </Card>
    </View>
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
    <View style={{ padding: 20 }}>
      <Card padded={false}>
        {list.map((a, i) => (
          <ActivityHistoryRow key={a.id} a={a} divider={i < list.length - 1} />
        ))}
      </Card>
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

function ActivityHistoryRow({ a, divider }: { a: ActivityMock; divider?: boolean }) {
  const { t } = useTheme();
  const labelMap = { fill: 'เติม', move: 'ย้าย', sell: 'ขาย' } as const;
  const accentMap = {
    fill: { fg: t.fillInk, bg: t.fillSoft },
    move: { fg: t.moveInk, bg: t.moveSoft },
    sell: { fg: t.sellInk, bg: t.sellSoft },
  } as const;
  const { fg, bg } = accentMap[a.mode];
  return (
    <View
      style={{
        padding: 14,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: t.border,
        gap: 6,
      }}
    >
      <Row justify="space-between">
        <Row gap={6}>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 6,
              backgroundColor: bg,
            }}
          >
            <Text style={{ color: fg, fontFamily: type.familySemi, fontSize: 12 }}>
              {labelMap[a.mode]}
            </Text>
          </View>
          <Text style={{ color: t.inkSoft, fontFamily: type.family, fontSize: 12 }}>
            {thaiDate.short(new Date(a.date))}
          </Text>
        </Row>
        <Text style={{ fontFamily: type.familyNumSemi, fontSize: 14, color: t.ink }}>
          {fmt.num(a.amount)} ตัว
        </Text>
      </Row>
      <Text style={{ fontSize: 13, color: t.ink, fontFamily: type.family }}>
        {FISH_TH[a.fishType] ?? a.fishType}
        {a.merchant ? ` · ${a.merchant}` : ''}
        {a.total > 0 ? ` · ${fmt.baht(a.total)}` : ''}
      </Text>
      {a.remark ? (
        <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>{a.remark}</Text>
      ) : null}
    </View>
  );
}

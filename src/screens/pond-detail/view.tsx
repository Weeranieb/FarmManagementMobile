import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type, radii } from '@/theme/tokens';
import { Card, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { StatusBadge } from '@/components/domain/StatusPip';
import { FishChips } from '@/components/domain/FishChips';
import { fmt } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import { today } from '@/shared/time';
import type { PondModel } from '@/features/pond';
import { ActionPill } from './components/ActionPill';
import { DailyFeedBody } from './components/DailyFeedBody';
import { HistoryBody } from './components/HistoryBody';
import type { PondDetailTab } from './hook';

const LATEST_ACTIVITY_LABEL: Record<'fill' | 'move' | 'sell', string> = {
  fill: 'เติม',
  move: 'ย้าย',
  sell: 'ขาย',
};

type Props = {
  pondId: number;
  pond: PondModel | null;
  isLoading: boolean;
  isError: boolean;
  farmSubtitle: string;
  tab: PondDetailTab;
  setTab: (t: PondDetailTab) => void;
  onPondOverflow: () => void;
  onBack?: () => void;
  onAction?: (kind: 'fill' | 'move' | 'sell') => void;
  onOpenDailyLog?: (ctx: { farmId: number; pondId: number }) => void;
  showHeader?: boolean;
};

export function PondDetailView({
  pondId,
  pond,
  isLoading,
  isError,
  farmSubtitle,
  tab,
  setTab,
  onPondOverflow,
  onBack,
  onAction,
  onOpenDailyLog,
  showHeader = true,
}: Props) {
  const { t } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        {showHeader ? (
          <TopBar title="" subtitle="" leading={onBack ? <BackBtn onBack={onBack} /> : null} />
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
            leading={onBack ? <BackBtn onBack={onBack} /> : null}
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

  const isMaintenance = pond.status === 'maintenance';

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? (
        <TopBar
          title={`บ่อ ${pond.name}`}
          subtitle={farmSubtitle ? `ฟาร์ม ${farmSubtitle}` : ''}
          leading={onBack ? <BackBtn onBack={onBack} /> : null}
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
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12 }}>
          <Card padded={false}>
            <View style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
              <Row justify="space-between" style={{ marginBottom: 10 }}>
                <Row gap={6}>
                  <StatusBadge s={pond.status} />
                  {!isMaintenance ? <FishChips types={pond.fishTypes} /> : null}
                </Row>
                {!isMaintenance && pond.startDate ? (
                  <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
                    เริ่มรอบ {thaiDate.short(new Date(pond.startDate))}
                  </Text>
                ) : null}
              </Row>
              {!isMaintenance ? (
                <Row gap={0}>
                  <PondStat label="ปลาในบ่อ" v={fmt.num(pond.totalFish)} sub="ตัว" />
                  <Divider />
                  <PondStat label="อายุรอบ" v={String(pond.ageDays ?? 0)} sub="วัน" />
                  <Divider />
                  <PondStat label="ต้นทุน" v="฿62K" accent={t.inkSoft} />
                </Row>
              ) : (
                <Col gap={4}>
                  <Text style={{ fontSize: 14, color: t.inkSoft, fontFamily: type.family }}>
                    บ่อนี้ปิดอยู่
                  </Text>
                  {pond.latestActivityDate && pond.latestActivityType ? (
                    <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
                      รอบล่าสุด: {LATEST_ACTIVITY_LABEL[pond.latestActivityType]}{' '}
                      {thaiDate.ago(new Date(pond.latestActivityDate), today)}
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
                      ยังไม่มีกิจกรรม
                    </Text>
                  )}
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
              disabled={isMaintenance}
              onPress={() => onAction?.('move')}
            />
            <ActionPill
              tone="sell"
              icon="tag"
              label="ขายปลา"
              disabled={isMaintenance}
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
              { id: 'feed', label: 'ข้อมูลรายวัน' },
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

        {tab === 'feed' ? (
          <DailyFeedBody
            pondId={pond.id}
            onOpenDailyLog={() =>
              onOpenDailyLog?.({ farmId: pond.farmId, pondId: pond.id })
            }
          />
        ) : (
          <HistoryBody pondId={pond.id} />
        )}
      </ScrollView>
    </View>
  );
}

function BackBtn({ onBack }: { onBack: () => void }) {
  const { t } = useTheme();
  return (
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
  );
}

function PondStat({
  label,
  v,
  sub,
  accent,
}: {
  label: string;
  v: string;
  sub?: string;
  accent?: string;
}) {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={{ fontFamily: type.familyNumBold, fontSize: 18, color: accent ?? t.ink }}>
          {v}
        </Text>
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
  return <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: t.border }} />;
}

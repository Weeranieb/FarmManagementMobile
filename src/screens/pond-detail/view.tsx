import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type, radii } from '@/theme/tokens';
import { TopBar, Tappable } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { StatusBadge } from '@/components/domain/StatusPip';
import { FishChips } from '@/components/domain/FishChips';
import { fmt } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import { today } from '@/shared/time';
import type { PondModel } from '@/features/pond';
import type { DailyLogTarget } from '@/screens/daily-log/route';
import { ActionPill } from './components/ActionPill';
import { DailyFeedBody } from './components/DailyFeedBody';
import { HistoryBody } from './components/HistoryBody';
import { CycleBody } from './components/CycleBody';
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
  refresh: () => Promise<void>;
  refreshing: boolean;
  onBack?: () => void;
  onAction?: (kind: 'fill' | 'move' | 'sell') => void;
  onOpenDailyLog?: (target: DailyLogTarget) => void;
  onOpenLedger?: () => void;
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
  refresh,
  refreshing,
  onBack,
  onAction,
  onOpenDailyLog,
  onOpenLedger,
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
            <Tappable
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
            </Tappable>
          }
        />
      ) : null}

      <ScrollView
        delaysContentTouches={false}
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={t.brand}
            colors={[t.brand]}
          />
        }
      >
        <PondHeader pond={pond} isMaintenance={isMaintenance} />

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
          }}
        >
          {(
            [
              { id: 'feed', label: 'ข้อมูลรายวัน' },
              { id: 'cycles', label: 'รอบเลี้ยง' },
              { id: 'history', label: 'ประวัติกิจกรรม' },
            ] as const
          ).map((opt) => {
            const sel = tab === opt.id;
            return (
              <Tappable
                key={opt.id}
                feedback="opacity"
                onPress={() => setTab(opt.id)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: 2,
                  borderBottomColor: sel ? t.brand : 'transparent',
                  marginBottom: -1,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color: sel ? t.ink : t.inkMute,
                    fontFamily: sel ? type.familyBold : type.familyMedium,
                    fontSize: 14,
                  }}
                >
                  {opt.label}
                </Text>
              </Tappable>
            );
          })}
        </View>

        {tab === 'feed' ? (
          <DailyFeedBody
            pondId={pond.id}
            onOpenLedger={onOpenLedger}
            onOpenDailyLog={() => onOpenDailyLog?.({ farmId: pond.farmId, pondId: pond.id })}
          />
        ) : tab === 'history' ? (
          <HistoryBody pondId={pond.id} />
        ) : (
          <CycleBody pondId={pond.id} />
        )}
      </ScrollView>
    </View>
  );
}

function BackBtn({ onBack }: { onBack: () => void }) {
  const { t } = useTheme();
  return (
    <Tappable
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
    </Tappable>
  );
}

/**
 * Editorial pond header (replaces the boxed status card). Active ponds lead with
 * the fish-in-pond hero number + age; closed ponds get a tight one-line strip.
 */
function PondHeader({ pond, isMaintenance }: { pond: PondModel; isMaintenance: boolean }) {
  const { t } = useTheme();

  if (isMaintenance) {
    return (
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14 }}>
        <Row gap={12} align="flex-start">
          <StatusBadge s={pond.status} />
          <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{ fontFamily: type.familySemi, fontSize: type.sizes.base, color: t.inkSoft }}
            >
              บ่อนี้ปิดอยู่
            </Text>
            {pond.latestActivityDate && pond.latestActivityType ? (
              <Text style={{ fontSize: type.sizes.sm, color: t.inkMute, fontFamily: type.family }}>
                รอบล่าสุด: {LATEST_ACTIVITY_LABEL[pond.latestActivityType]}{' '}
                {thaiDate.ago(new Date(pond.latestActivityDate), today)}
              </Text>
            ) : (
              <Text style={{ fontSize: type.sizes.sm, color: t.inkMute, fontFamily: type.family }}>
                ยังไม่มีกิจกรรม
              </Text>
            )}
          </Col>
        </Row>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
      <Row justify="space-between" align="center" style={{ marginBottom: 14 }}>
        <Row gap={8}>
          <StatusBadge s={pond.status} />
          <FishChips types={pond.fishTypes} />
        </Row>
        {pond.startDate ? (
          <Text style={{ fontSize: type.sizes.xs, color: t.inkMute, fontFamily: type.family }}>
            เริ่มรอบ {thaiDate.short(new Date(pond.startDate))}
          </Text>
        ) : null}
      </Row>
      <Row align="flex-end" justify="space-between">
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text
              style={{
                fontFamily: type.familyNumBold,
                fontSize: type.sizes.hero,
                color: t.ink,
                lineHeight: 40,
              }}
            >
              {fmt.num(pond.totalFish)}
            </Text>
            <Text
              style={{
                fontSize: type.sizes.sm,
                fontFamily: type.familyMedium,
                color: t.inkMute,
                marginLeft: 6,
              }}
            >
              ตัว
            </Text>
          </View>
          <Text
            style={{
              fontSize: type.sizes.sm,
              color: t.inkMute,
              fontFamily: type.family,
              marginTop: 2,
            }}
          >
            ปลาในบ่อ
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={{ fontFamily: type.familyNumSemi, fontSize: type.sizes.lg, color: t.ink }}>
              {pond.ageDays ?? 0}
            </Text>
            <Text
              style={{
                fontSize: type.sizes.sm,
                fontFamily: type.familyMedium,
                color: t.inkMute,
                marginLeft: 4,
              }}
            >
              วัน
            </Text>
          </View>
          <Text
            style={{
              fontSize: type.sizes.xs,
              color: t.inkMute,
              fontFamily: type.family,
              marginTop: 2,
            }}
          >
            อายุรอบ
          </Text>
        </View>
      </Row>
    </View>
  );
}

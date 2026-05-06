import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Card, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { FishChips } from '@/components/domain/FishChips';
import { StatusBadge } from '@/components/domain/StatusPip';
import { fmt } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import { useFarmsData, usePondsData } from '@/data';
import type { PondMock } from '@/mock/data';

type Props = {
  farmId: number;
  showHeader?: boolean;
  onBack?: () => void;
  onOpenPond: (pondId: number) => void;
};

export function FarmPondsScreen({ farmId, showHeader = true, onBack, onOpenPond }: Props) {
  const { t } = useTheme();
  const { data: farmsRaw } = useFarmsData();
  const farms = Array.isArray(farmsRaw) ? farmsRaw : [];
  const farm = farms.find((f) => f.id === farmId);
  const farmTitle = farm?.name ?? 'ฟาร์ม';
  const { data: pondsRaw } = usePondsData(farmId);
  const ponds = Array.isArray(pondsRaw) ? pondsRaw : [];
  const countLabel = `${ponds.length} บ่อ`;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? (
        <TopBar
          title={farmTitle}
          subtitle={countLabel}
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
        <View style={{ padding: 20, paddingBottom: 8 }}>
          <View
            style={{
              height: 48,
              borderRadius: radii.md,
              backgroundColor: t.surfaceAlt,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              gap: 10,
            }}
          >
            <Icon.search size={18} color={t.inkSoft} />
            <Text style={{ color: t.inkMute, fontSize: 14, fontFamily: type.family }}>
              ค้นหาบ่อ
            </Text>
          </View>
        </View>

        <Col gap={12} style={{ paddingHorizontal: 20 }}>
          {ponds.length === 0 ? (
            <Text style={{ fontSize: 14, color: t.inkMute, fontFamily: type.family }}>
              ยังไม่มีบ่อในฟาร์มนี้
            </Text>
          ) : (
            ponds.map((p) => (
              <PondRowCard key={p.id} pond={p as PondMock} onPress={() => onOpenPond(p.id)} />
            ))
          )}
        </Col>
      </ScrollView>
    </View>
  );
}

function PondRowCard({ pond, onPress }: { pond: PondMock; onPress?: () => void }) {
  const { t } = useTheme();
  const isMaint = pond.status === 'maintenance';

  return (
    <Card padded={false} onPress={onPress} style={{ overflow: 'hidden', borderWidth: 0 }}>
      <View style={{ padding: 16 }}>
        <Row justify="space-between" align="flex-start" style={{ marginBottom: 10 }}>
          <Col gap={6} style={{ flex: 1, minWidth: 0 }}>
            <Row gap={8} style={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: type.familyBold,
                  color: t.ink,
                  lineHeight: 24,
                  ...Platform.select({ android: { includeFontPadding: false } }),
                }}
              >
                {pond.name}
              </Text>
              {/* Pill uses alignSelf: 'flex-start' — wrap so Row alignItems:center applies */}
              <View style={{ alignSelf: 'center' }}>
                <StatusBadge s={pond.status} />
              </View>
            </Row>
            {!isMaint && pond.fishTypes.length > 0 ? (
              <Row gap={6} style={{ flexWrap: 'wrap' }}>
                <FishChips types={pond.fishTypes} />
              </Row>
            ) : null}
          </Col>
          {!isMaint ? <PondStatusDot pond={pond} /> : null}
        </Row>
        {!isMaint ? (
          <>
            <Row gap={20} style={{ paddingTop: 2 }}>
              <PondMiniStat label="ปลาในบ่อ (ตัว)" v={fmt.num(pond.totalFish)} />
              <PondMiniStat label="อายุรอบ" v={String(pond.ageDays ?? 0)} sub="วัน" />
            </Row>
            {pond.latestActivityDate ? (
              <>
                <PondHr style={{ marginTop: 12 }} />
                <Row gap={6} align="center" style={{ paddingTop: 12 }}>
                  <ActivityModePill mode={pond.latestActivityType} />
                  <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
                    · {thaiDate.short(new Date(pond.latestActivityDate))}
                  </Text>
                </Row>
              </>
            ) : null}
          </>
        ) : (
          <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
            บ่อปิดอยู่ — กดเพื่อเริ่มรอบใหม่
          </Text>
        )}
      </View>
    </Card>
  );
}

function PondStatusDot({ pond }: { pond: PondMock }) {
  const { t } = useTheme();
  const color = pond.loggedToday ? t.success : pond.lateDays > 0 ? t.danger : t.warn;
  return (
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color,
        marginTop: 4,
      }}
    />
  );
}

function ActivityModePill({ mode }: { mode: 'fill' | 'move' | 'sell' }) {
  const { t } = useTheme();
  const map = {
    fill: { bg: t.fillSoft, fg: t.fillInk, label: 'เติม' },
    move: { bg: t.moveSoft, fg: t.moveInk, label: 'ย้าย' },
    sell: { bg: t.sellSoft, fg: t.sellInk, label: 'ขาย' },
  } as const;
  const m = map[mode];
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: radii.xs,
        backgroundColor: m.bg,
      }}
    >
      <Text style={{ color: m.fg, fontFamily: type.familySemi, fontSize: 12 }}>{m.label}</Text>
    </View>
  );
}

function PondHr({ style }: { style?: StyleProp<ViewStyle> }) {
  const { t } = useTheme();
  return <View style={[{ height: 1, backgroundColor: t.border }, style]} />;
}

function PondMiniStat({ label, v, sub }: { label: string; v: string; sub?: string }) {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'flex-start', gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={{ fontFamily: type.familyNumBold, fontSize: 20, color: t.ink }}>{v}</Text>
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

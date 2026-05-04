import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Card, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { FishChips } from '@/components/domain/FishChips';
import { StatusBadge } from '@/components/domain/StatusPip';
import { fmt } from '@/utils/fmt';
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
              borderWidth: 1,
              borderColor: t.border,
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
    <Card padded={false} onPress={onPress} style={{ overflow: 'hidden' }}>
      <View style={{ padding: 16 }}>
        <Row justify="space-between" style={{ marginBottom: 10 }}>
          <Col gap={6} style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 17, fontFamily: type.familyBold, color: t.ink }}>
              {pond.name}
            </Text>
            <Row gap={6} style={{ flexWrap: 'wrap' }}>
              <StatusBadge s={pond.status} />
              {!isMaint ? <FishChips types={pond.fishTypes} /> : null}
            </Row>
          </Col>
          <Icon.chevR size={18} color={t.inkSoft} />
        </Row>
        {!isMaint ? (
          <Row gap={0} style={{ borderTopWidth: 1, borderTopColor: t.border, paddingTop: 10 }}>
            <PondMiniStat label="ปลาในบ่อ" v={fmt.num(pond.totalFish)} sub="ตัว" />
            <PondDivider />
            <PondMiniStat label="อายุรอบ" v={String(pond.ageDays ?? 0)} sub="วัน" />
          </Row>
        ) : (
          <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
            บ่อปิด — ไม่มีรอบใช้งาน
          </Text>
        )}
      </View>
    </Card>
  );
}

function PondMiniStat({ label, v, sub }: { label: string; v: string; sub?: string }) {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={{ fontFamily: type.familyNumBold, fontSize: 16, color: t.ink }}>{v}</Text>
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

function PondDivider() {
  const { t } = useTheme();
  return <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: t.border }} />;
}

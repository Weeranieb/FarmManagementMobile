import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Card, Pill, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';
import type { FarmMock } from '@/mock/data';
import { useFarmsData } from '@/data';

type Props = {
  showHeader?: boolean;
  onOpenFarm?: (id: number) => void;
};

export function FarmsScreen({ showHeader = true, onOpenFarm }: Props) {
  const { t } = useTheme();
  const { data: farmsRaw } = useFarmsData();
  const farms = Array.isArray(farmsRaw) ? farmsRaw : [];
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? <TopBar title="ฟาร์มของฉัน" subtitle={`${farms.length} ฟาร์ม`} /> : null}
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
              ค้นหาฟาร์ม
            </Text>
          </View>
        </View>

        <Col gap={12} style={{ paddingHorizontal: 20 }}>
          {farms.map((fm) => (
            <FarmCard key={fm.id} farm={fm} onPress={() => onOpenFarm?.(fm.id)} />
          ))}
        </Col>
      </ScrollView>
    </View>
  );
}

function FarmCard({ farm, onPress }: { farm: FarmMock; onPress?: () => void }) {
  const { t } = useTheme();
  return (
    <Card padded={false} onPress={onPress} style={{ overflow: 'hidden' }}>
      <View style={{ padding: 16 }}>
        <Row justify="space-between" style={{ marginBottom: 10 }}>
          <Col gap={2}>
            <Text style={{ fontSize: 17, fontFamily: type.familyBold, color: t.ink }}>
              {farm.name}
            </Text>
            <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
              เพิ่มเมื่อ ม.ค. 2565
            </Text>
          </Col>
          <Icon.chevR size={18} color={t.inkSoft} />
        </Row>
        <Row gap={0} style={{ borderTopWidth: 1, borderTopColor: t.border, paddingTop: 10 }}>
          <Stat label="บ่อทั้งหมด" v={String(farm.pondCount)} />
          <Divider />
          <Stat label="ใช้งาน" v={String(farm.activePonds)} accent={t.statusActive} />
          <Divider />
          <Stat label="ปลารวม" v={fmt.num(farm.totalStock)} sub="ตัว" />
        </Row>
      </View>
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: t.surfaceAlt,
          borderTopWidth: 1,
          borderTopColor: t.border,
          gap: 6,
        }}
      >
        <Pill tone={farm.status === 'active' ? 'success' : 'maint'}>
          {farm.status === 'active' ? 'ใช้งาน' : 'ปิด'}
        </Pill>
      </View>
    </Card>
  );
}

function Stat({
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
        <Text
          style={{
            fontFamily: type.familyNumBold,
            fontSize: 18,
            color: accent ?? t.ink,
          }}
        >
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

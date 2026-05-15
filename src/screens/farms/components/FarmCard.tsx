import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Card } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';
import type { FarmModel } from '@/features/farm';

type Props = {
  farm: FarmModel;
  onPress?: () => void;
};

export function FarmCard({ farm, onPress }: Props) {
  const { t } = useTheme();
  return (
    <Card padded={false} onPress={onPress} style={{ overflow: 'hidden' }}>
      <View style={{ padding: 16 }}>
        <Row justify="space-between" style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 17, fontFamily: type.familyBold, color: t.ink }}>
            ฟาร์ม {farm.name}
          </Text>
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

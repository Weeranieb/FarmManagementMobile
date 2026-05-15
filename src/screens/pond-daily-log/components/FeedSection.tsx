import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { space, type } from '@/theme/tokens';
import { Row, Col } from '@/components/layout/Row';
import { AmountTile } from './AmountTile';

/** Horizontal inset inside the activity card (prototype ~20px). */
const CARD_PAD = space[5];

type Props = {
  title: string;
  subtitle: string;
  morning: string;
  evening: string;
  onMorningChange: (v: string) => void;
  onEveningChange: (v: string) => void;
};

export function FeedSection({
  title,
  subtitle,
  morning,
  evening,
  onMorningChange,
  onEveningChange,
}: Props) {
  const { t } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: CARD_PAD,
        paddingTop: space[3],
        paddingBottom: space[3],
      }}
    >
      <Row justify="space-between" style={{ marginBottom: space[3] }} align="flex-start">
        <Col gap={2} style={{ flex: 1, marginRight: space[3] }}>
          <Text style={{ fontFamily: type.familyBold, fontSize: 14, color: t.ink }}>{title}</Text>
          {subtitle ? (
            <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
              {subtitle}
            </Text>
          ) : (
            <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
              ยังไม่ได้เลือกสินค้า
            </Text>
          )}
        </Col>
        <Pressable hitSlop={8}>
          <Text style={{ color: t.brand, fontSize: 13, fontFamily: type.familySemi }}>เปลี่ยน</Text>
        </Pressable>
      </Row>
      <Row gap={10}>
        <AmountTile label="เช้า" unit="กก." value={morning} onChange={onMorningChange} />
        <AmountTile label="เย็น" unit="กก." value={evening} onChange={onEveningChange} />
      </Row>
    </View>
  );
}

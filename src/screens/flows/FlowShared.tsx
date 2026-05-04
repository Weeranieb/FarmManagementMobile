import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { FISH_TH } from '@/utils/fmt';

export function FieldRow({
  label,
  hint,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useTheme();
  return (
    <Col gap={6} style={{ marginBottom: 14 }}>
      <Row justify="space-between">
        <Text style={{ fontSize: 13, fontFamily: type.familySemi, color: t.ink }}>
          {label}
          {optional ? (
            <Text style={{ color: t.inkMute, fontFamily: type.family }}> · ไม่บังคับ</Text>
          ) : null}
        </Text>
        {hint ? (
          <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>{hint}</Text>
        ) : null}
      </Row>
      {children}
    </Col>
  );
}

export function FishPicker({
  types,
  selected,
  onChange,
}: {
  types: string[];
  selected?: string;
  onChange?: (ft: string) => void;
}) {
  const { t } = useTheme();
  return (
    <Row gap={8} wrap>
      {types.map((ft) => {
        const sel = ft === selected;
        return (
          <Pressable
            key={ft}
            onPress={() => onChange?.(ft)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 9999,
              backgroundColor: sel ? t.fillSoft : t.surface,
              borderWidth: 1.5,
              borderColor: sel ? t.fill : t.border,
            }}
          >
            <Text
              style={{
                color: sel ? t.fillInk : t.inkSoft,
                fontFamily: type.familySemi,
                fontSize: 14,
              }}
            >
              {FISH_TH[ft] ?? ft}
            </Text>
          </Pressable>
        );
      })}
      <Pressable
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 9999,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: t.border,
          borderStyle: 'dashed',
        }}
      >
        <Icon.plus size={14} color={t.inkSoft} />
        <Text style={{ color: t.inkSoft, fontFamily: type.familyMedium, fontSize: 14 }}>
          เพิ่มชนิด
        </Text>
      </Pressable>
    </Row>
  );
}

export function PreviewCard({
  tone = 'fill',
  rows,
  totalLabel = 'ต้นทุนรวม',
  total = '฿0',
}: {
  tone?: 'fill' | 'move' | 'sell';
  rows: [string, string][];
  totalLabel?: string;
  total?: string;
}) {
  const { t } = useTheme();
  const softMap = { fill: t.fillSoft, move: t.moveSoft, sell: t.sellSoft };
  const inkMap = { fill: t.fillInk, move: t.moveInk, sell: t.sellInk };
  const soft = softMap[tone];
  const ink = inkMap[tone];

  return (
    <View
      style={{
        padding: 16,
        backgroundColor: soft,
        borderWidth: 1,
        borderColor: ink + '30',
        borderRadius: radii.md,
      }}
    >
      <Col gap={6}>
        {rows.map(([label, value], i) => (
          <Row key={i} justify="space-between">
            <Text style={{ color: ink, opacity: 0.8, fontSize: 13, fontFamily: type.family }}>
              {label}
            </Text>
            <Text style={{ color: ink, fontSize: 13, fontFamily: type.familyNumSemi }}>
              {value}
            </Text>
          </Row>
        ))}
        <View style={{ height: 1, backgroundColor: ink + '40', marginVertical: 4 }} />
        <Row justify="space-between">
          <Text style={{ color: ink, fontSize: 14, fontFamily: type.familyBold }}>
            {totalLabel}
          </Text>
          <Text style={{ color: ink, fontSize: 18, fontFamily: type.familyNumBold }}>{total}</Text>
        </Row>
      </Col>
    </View>
  );
}

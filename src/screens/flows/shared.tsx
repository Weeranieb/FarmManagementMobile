import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Pill } from '@/components/ui';
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

export function BottomBar({ children }: { children: React.ReactNode }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        backgroundColor: t.bg,
        borderTopWidth: 1,
        borderTopColor: t.border,
      }}
    >
      {children}
    </View>
  );
}

/**
 * Tappable card that toggles a "close the active pond cycle after this
 * action" decision. Used by both the move flow (close source pond after
 * moving fish out) and the sell flow (close the pond after the sale).
 * Renders a checkbox + warn-toned label + "พักบ่อ" Pill + a helper line
 * that flips between active/inactive copy. The helper is the main place
 * for the caller to differentiate the two flows.
 */
export function CloseAfterActionToggle({
  value,
  onChange,
  label,
  activeHelper,
  inactiveHelper,
  pondName,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  /** Main toggle label, e.g. "ปิดบ่อต้นทางหลังย้าย" or "ปิด/จบบ่อหลังขาย". */
  label: string;
  /** Helper shown when toggled ON. Use `{pondName}` to interpolate the pond. */
  activeHelper: string;
  /** Helper shown when toggled OFF. */
  inactiveHelper: string;
  /** Used to interpolate `{pondName}` placeholders in activeHelper. */
  pondName?: string;
}) {
  const { t } = useTheme();
  const helper = value
    ? activeHelper.replace('{pondName}', pondName || 'บ่อนี้')
    : inactiveHelper;
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={{
        marginTop: 4,
        marginBottom: 14,
        padding: 14,
        borderRadius: radii.md,
        borderWidth: 1.5,
        borderColor: value ? t.warn : t.border,
        backgroundColor: value ? t.warnSoft : t.surface,
      }}
    >
      <Row gap={12} align="center">
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: value ? t.warn : t.border,
            backgroundColor: value ? t.warn : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {value ? <Icon.check size={14} color="#ffffff" stroke={3} /> : null}
        </View>
        <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Row gap={8} align="center" style={{ flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 14, fontFamily: type.familySemi, color: t.ink }}>
              {label}
            </Text>
            <Pill tone="warn">พักบ่อ</Pill>
          </Row>
          <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
            {helper}
          </Text>
        </Col>
      </Row>
    </Pressable>
  );
}

export function FlowBackBtn({ onPress, step }: { onPress: () => void; step: 1 | 2 }) {
  const { t } = useTheme();
  return (
    <Pressable
      onPress={onPress}
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
      {step === 1 ? <Icon.x size={18} color={t.ink} /> : <Icon.back size={18} color={t.ink} />}
    </Pressable>
  );
}

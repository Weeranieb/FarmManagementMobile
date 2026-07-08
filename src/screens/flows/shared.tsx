import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type, type ThemePalette } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Pill } from '@/components/ui';
import { Row, Col } from '@/components/layout/Row';
import { FISH_TH } from '@/utils/fmt';

type FlowTone = 'fill' | 'sell' | 'move';

const TONE_KEYS: Record<FlowTone, {
  solid: keyof ThemePalette;
  soft: keyof ThemePalette;
  ink: keyof ThemePalette;
}> = {
  fill: { solid: 'fill', soft: 'fillSoft', ink: 'fillInk' },
  sell: { solid: 'sell', soft: 'sellSoft', ink: 'sellInk' },
  move: { solid: 'move', soft: 'moveSoft', ink: 'moveInk' },
};

function toneColors(t: ThemePalette, tone: FlowTone) {
  const k = TONE_KEYS[tone];
  return { solid: t[k.solid], soft: t[k.soft], ink: t[k.ink] };
}

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
    <Col gap={space[2]} style={{ marginBottom: space[4] }}>
      <Row justify="space-between">
        <Text style={{ fontSize: type.sizes.sm, fontFamily: type.familySemi, color: t.ink }}>
          {label}
          {optional ? (
            <Text style={{ color: t.inkMute, fontFamily: type.family }}> · ไม่บังคับ</Text>
          ) : null}
        </Text>
        {hint ? (
          <Text style={{ fontSize: type.sizes.xs, color: t.inkMute, fontFamily: type.family }}>
            {hint}
          </Text>
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
  tone = 'fill',
}: {
  types: string[];
  selected?: string;
  onChange?: (ft: string) => void;
  /** Match the flow's semantic action color — defaults to fill (green). */
  tone?: FlowTone;
}) {
  const { t } = useTheme();
  const c = toneColors(t, tone);
  return (
    <Row gap={space[2]} wrap>
      {types.map((ft) => {
        const sel = ft === selected;
        return (
          <Pressable
            key={ft}
            onPress={() => onChange?.(ft)}
            accessibilityRole="button"
            accessibilityState={{ selected: sel }}
            style={{
              minHeight: 44,
              paddingHorizontal: space[4] - 2,
              paddingVertical: space[2] + 2,
              borderRadius: radii.pill,
              justifyContent: 'center',
              backgroundColor: sel ? c.soft : t.surface,
              borderWidth: 1.5,
              borderColor: sel ? c.solid : t.border,
            }}
          >
            <Text
              style={{
                color: sel ? c.ink : t.inkSoft,
                fontFamily: type.familySemi,
                fontSize: type.sizes.base,
              }}
            >
              {FISH_TH[ft] ?? ft}
            </Text>
          </Pressable>
        );
      })}
    </Row>
  );
}

/** Multiline note input — shared by every flow form. */
export function NoteField({
  value,
  onChange,
  placeholder = 'เพิ่มโน้ต…',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const { t } = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={t.inkMute}
      multiline
      textAlignVertical="top"
      style={{
        minHeight: 72,
        paddingHorizontal: space[3],
        paddingVertical: space[3] - 2,
        ...Platform.select({ android: { includeFontPadding: false } }),
        borderRadius: radii.md,
        borderWidth: 1.5,
        borderColor: t.border,
        backgroundColor: t.surface,
        color: t.ink,
        fontFamily: type.family,
        fontSize: type.sizes.base,
        lineHeight: 22,
      }}
    />
  );
}

export function PreviewCard({
  tone = 'fill',
  rows,
  totalLabel = 'ต้นทุนรวม',
  total = '฿0',
}: {
  tone?: FlowTone;
  rows: [string, string][];
  totalLabel?: string;
  total?: string;
}) {
  const { t } = useTheme();
  const c = toneColors(t, tone);

  return (
    <View
      style={{
        padding: space[4],
        backgroundColor: c.soft,
        borderWidth: 1,
        borderColor: t.border,
        borderRadius: radii.md,
      }}
    >
      <Col gap={space[2] - 2}>
        {rows.map(([label, value], i) => (
          <Row key={i} justify="space-between">
            <Text style={{ color: c.ink, opacity: 0.8, fontSize: type.sizes.sm, fontFamily: type.family }}>
              {label}
            </Text>
            <Text style={{ color: c.ink, fontSize: type.sizes.sm, fontFamily: type.familyNumSemi }}>
              {value}
            </Text>
          </Row>
        ))}
        <View style={{ height: 1, backgroundColor: c.solid, opacity: 0.25, marginVertical: space[1] }} />
        <Row justify="space-between">
          <Text style={{ color: c.ink, fontSize: type.sizes.base, fontFamily: type.familyBold }}>
            {totalLabel}
          </Text>
          <Text style={{ color: c.ink, fontSize: type.sizes.lg, fontFamily: type.familyNumBold }}>
            {total}
          </Text>
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
        paddingHorizontal: space[5],
        paddingTop: space[3],
        paddingBottom: space[6],
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
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      style={{
        marginBottom: space[4],
        padding: space[3] + 2,
        borderRadius: radii.md,
        borderWidth: 1.5,
        borderColor: value ? t.warn : t.border,
        backgroundColor: value ? t.warnSoft : t.surface,
      }}
    >
      <Row gap={space[3]} align="center">
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: radii.xs,
            borderWidth: 2,
            borderColor: value ? t.warn : t.borderStrong,
            backgroundColor: value ? t.warn : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {value ? <Icon.check size={14} color="#ffffff" stroke={3} /> : null}
        </View>
        <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Row gap={space[2]} align="center" style={{ flexWrap: 'wrap' }}>
            <Text style={{ fontSize: type.sizes.base, fontFamily: type.familySemi, color: t.ink }}>
              {label}
            </Text>
            <Pill tone="warn">พักบ่อ</Pill>
          </Row>
          <Text style={{ fontSize: type.sizes.sm, color: t.inkMute, fontFamily: type.family, lineHeight: 19 }}>
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
      accessibilityRole="button"
      accessibilityLabel={step === 1 ? 'ปิด' : 'ย้อนกลับ'}
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

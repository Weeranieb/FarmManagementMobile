import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type, type ThemePalette } from '@/theme/tokens';
import { warnInk } from '@/theme/ink';
import { Icon } from '@/components/icons';
import { Pill } from '@/components/ui';
import { Row, Col } from '@/components/layout/Row';
import { FISH_TH } from '@/utils/fmt';

type FlowTone = 'fill' | 'sell' | 'move';

const TONE_KEYS: Record<
  FlowTone,
  {
    solid: keyof ThemePalette;
    soft: keyof ThemePalette;
    ink: keyof ThemePalette;
  }
> = {
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
            <Text
              style={{
                color: c.ink,
                opacity: 0.8,
                fontSize: type.sizes.sm,
                fontFamily: type.family,
              }}
            >
              {label}
            </Text>
            <Text style={{ color: c.ink, fontSize: type.sizes.sm, fontFamily: type.familyNumSemi }}>
              {value}
            </Text>
          </Row>
        ))}
        <View
          style={{ height: 1, backgroundColor: c.solid, opacity: 0.25, marginVertical: space[1] }}
        />
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
 * Renders a checkbox + warn-toned label + "พักบ่อ" Pill + the caller's
 * active/inactive helper line. An info (ⓘ) button opens a centered detail
 * modal explaining what closing does to the pond (ends the cycle, locks the
 * daily log, needs a new cycle to reuse) — shared copy, since the consequence
 * is intrinsic to closing a pond regardless of which flow triggered it.
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
  const { t, mode, shadowXl } = useTheme();
  const [detailOpen, setDetailOpen] = useState(false);
  const helper = value ? activeHelper.replace('{pondName}', pondName || 'บ่อนี้') : inactiveHelper;
  const infoInk = value ? warnInk(mode, t) : t.inkSoft;
  return (
    <>
      {/* Toggle and info button are SIBLINGS (not nested) so tapping ⓘ can
          never also flip the checkbox — the whole card is not one Pressable. */}
      <View
        style={{
          marginBottom: space[4],
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[2],
          padding: space[3] + 2,
          borderRadius: radii.md,
          borderWidth: 1.5,
          borderColor: value ? t.warn : t.border,
          backgroundColor: value ? t.warnSoft : t.surface,
        }}
      >
        <Pressable
          onPress={() => onChange(!value)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: value }}
          style={{ flex: 1, minWidth: 0 }}
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
                <Text
                  style={{ fontSize: type.sizes.base, fontFamily: type.familySemi, color: t.ink }}
                >
                  {label}
                </Text>
                <Pill tone="warn">พักบ่อ</Pill>
              </Row>
              <Text
                style={{
                  fontSize: type.sizes.sm,
                  color: t.inkMute,
                  fontFamily: type.family,
                  lineHeight: 19,
                }}
              >
                {helper}
              </Text>
            </Col>
          </Row>
        </Pressable>
        <Pressable
          onPress={() => setDetailOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="ดูผลของการปิดบ่อ"
          hitSlop={10}
          style={{ padding: 2, alignSelf: 'flex-start' }}
        >
          <Icon.info size={20} color={infoInk} />
        </Pressable>
      </View>

      <Modal
        visible={detailOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailOpen(false)}
      >
        <Pressable
          onPress={() => setDetailOpen(false)}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: space[5],
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              {
                width: '100%',
                maxWidth: 360,
                maxHeight: '85%',
                backgroundColor: t.surface,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: t.borderStrong,
              },
              shadowXl,
            ]}
          >
            <ScrollView
              contentContainerStyle={{ padding: space[5] }}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Row gap={space[3]} align="center" style={{ marginBottom: space[3] }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: t.brandSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon.info size={22} color={t.brand} />
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: type.sizes.md,
                    fontFamily: type.familyBold,
                    color: t.ink,
                  }}
                >
                  ปิดบ่อแล้วมีผลอย่างไร
                </Text>
                <Pressable
                  onPress={() => setDetailOpen(false)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="ปิด"
                  style={{ padding: 4 }}
                >
                  <Icon.x size={20} color={t.inkMute} />
                </Pressable>
              </Row>
              <Text
                style={{
                  fontSize: type.sizes.sm,
                  color: t.inkMute,
                  fontFamily: type.family,
                  lineHeight: 20,
                }}
              >
                การปิดบ่อจะจบรอบการเลี้ยงของบ่อนี้ทันที และมีผลกับบ่อดังนี้
              </Text>
              <Col gap={14} style={{ marginTop: space[4] }}>
                <CloseEffectRow
                  icon={<Icon.wrench size={20} color={t.inkSoft} />}
                  title="บ่อเปลี่ยนเป็น “พักบ่อ”"
                  body="ถือว่าจบรอบการเลี้ยงปัจจุบันแล้ว"
                />
                <CloseEffectRow
                  icon={<Icon.lock size={20} color={t.inkSoft} />}
                  title="แก้บันทึกประจำวันไม่ได้"
                  body="จะบันทึกหรือแก้ไขข้อมูลของบ่อนี้ เช่น อาหารที่ให้ หรือจำนวนตาย ไม่ได้อีก"
                />
                <CloseEffectRow
                  icon={<Icon.cycle size={20} color={t.inkSoft} />}
                  title="ใช้ต่อได้เมื่อเริ่มรอบใหม่"
                  body="ถ้าจะกลับมาใช้บ่อนี้ ต้องเริ่มรอบใหม่ก่อน"
                />
              </Col>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/** One consequence row inside the "close pond" detail modal: icon + title + body. */
function CloseEffectRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const { t } = useTheme();
  return (
    <Row gap={12} align="flex-start">
      <View style={{ marginTop: 1 }}>{icon}</View>
      <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontSize: type.sizes.base,
            fontFamily: type.familySemi,
            color: t.ink,
            lineHeight: 21,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: type.sizes.sm,
            color: t.inkMute,
            fontFamily: type.family,
            lineHeight: 19,
          }}
        >
          {body}
        </Text>
      </Col>
    </Row>
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

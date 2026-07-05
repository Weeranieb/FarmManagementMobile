// Additional Costs editor — preset chips + multi-row + delete + live subtotal.
// Shared by Fill / Sell / Move forms. Matches web "Add Fish" UX (section 5
// of the FAB Picker Fix design — see FAB Picker Fix.html §⑤).
//
// Controlled: parent owns `rows` so it can persist across review → back nav
// and feed into the mutation payload.

import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type, type ThemePalette } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Col, Row } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';

export type CostRow = { category: string; amount: string };

const PRESETS = ['ค่าขนส่ง', 'ค่าแรง', 'ค่ารถ', 'ค่าอาหาร', 'อื่นๆ'] as const;

type Tone = 'fill' | 'sell' | 'move';

const TONE_KEYS: Record<
  Tone,
  { solid: keyof ThemePalette; ink: keyof ThemePalette; soft: keyof ThemePalette }
> = {
  fill: { solid: 'fill', ink: 'fillInk', soft: 'fillSoft' },
  sell: { solid: 'sell', ink: 'sellInk', soft: 'sellSoft' },
  move: { solid: 'move', ink: 'moveInk', soft: 'moveSoft' },
};

/** Sum the numeric `amount` of every row. Ignores empties / non-numerics. */
export function additionalCostsTotal(rows: CostRow[]): number {
  return rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
}

/** A single blank row — the editor always shows at least one. */
export const EMPTY_COST_ROW: CostRow = { category: '', amount: '' };

type Props = {
  tone: Tone;
  rows: CostRow[];
  onChange: (rows: CostRow[]) => void;
};

/** Oval preset chip — border/background on inner View; used chips match legacy UX. */
function CostPresetChip({
  label,
  ink,
  inkMute,
  surface,
  surfaceAlt,
  border,
  toneSolid,
  used,
  onPress,
}: {
  label: string;
  ink: string;
  inkMute: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  toneSolid: string;
  used: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={used ? undefined : onPress}
      disabled={used}
      accessibilityRole="button"
      accessibilityState={{ disabled: used }}
      accessibilityLabel={used ? `${label} — เพิ่มแล้ว` : `เพิ่ม${label}`}
      style={({ pressed }) => ({
        opacity: used ? 0.45 : pressed ? 0.85 : 1,
        alignSelf: 'flex-start',
      })}
    >
      <View
        style={{
          paddingVertical: 7,
          paddingHorizontal: 12,
          borderRadius: radii.pill,
          backgroundColor: used ? surfaceAlt : surface,
          borderWidth: 1.5,
          borderStyle: 'solid',
          borderColor: used ? border : toneSolid + '40',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: used ? inkMute : ink,
            fontFamily: type.familySemi,
            fontSize: 12,
            lineHeight: 18,
          }}
        >
          {used ? '✓ ' : '+ '}
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function AdditionalCostsEditor({ tone, rows, onChange }: Props) {
  const { t } = useTheme();
  const toneKey = TONE_KEYS[tone];
  const solid = t[toneKey.solid];
  const ink = t[toneKey.ink];

  // The editor always shows at least one row so the empty state has affordance
  // for "what does a row look like?". Parent persists the underlying state.
  const visibleRows = rows.length === 0 ? [EMPTY_COST_ROW] : rows;

  const updateRow = (i: number, patch: Partial<CostRow>) => {
    const next = visibleRows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    onChange(next);
  };
  const removeRow = (i: number) => {
    const next = visibleRows.filter((_, idx) => idx !== i);
    onChange(next.length === 0 ? [EMPTY_COST_ROW] : next);
  };
  const addRow = () => {
    onChange([...visibleRows, { category: '', amount: '' }]);
  };
  const applyPreset = (preset: string) => {
    // Apply to the first empty row, or append a new one.
    const idx = visibleRows.findIndex((r) => !r.category && !r.amount);
    if (idx >= 0) updateRow(idx, { category: preset });
    else onChange([...visibleRows, { category: preset, amount: '' }]);
  };

  const sum = additionalCostsTotal(visibleRows);

  return (
    <Col gap={10}>
      {/* preset chips — oval pills (Sell Step 1 / FAB Picker Fix §⑤).
          White surface + neutral border + tone ink; disabled once category is used. */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {PRESETS.map((p) => (
          <CostPresetChip
            key={p}
            label={p}
            ink={ink}
            inkMute={t.inkMute}
            surface={t.surface}
            surfaceAlt={t.surfaceAlt}
            border={t.border}
            toneSolid={solid}
            used={visibleRows.some((r) => r.category.trim() === p)}
            onPress={() => applyPreset(p)}
          />
        ))}
      </View>

      {/* rows */}
      <Col gap={8}>
        {visibleRows.map((r, i) => {
          const isOnlyEmpty = visibleRows.length === 1 && !r.category && !r.amount;
          return (
            <Row key={i} gap={6}>
              <TextInput
                value={r.category}
                onChangeText={(v) => updateRow(i, { category: v })}
                placeholder="หมวด"
                placeholderTextColor={t.inkMute}
                style={{
                  flex: 1.4,
                  minWidth: 0,
                  height: 44,
                  paddingHorizontal: 12,
                  paddingVertical: 0,
                  textAlignVertical: 'center',
                  ...Platform.select({ android: { includeFontPadding: false } }),
                  backgroundColor: t.surface,
                  borderWidth: 1.5,
                  borderColor: t.border,
                  borderRadius: 10,
                  fontFamily: type.family,
                  fontSize: 14,
                  color: t.ink,
                }}
              />
              <View
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: 44,
                  paddingHorizontal: 12,
                  backgroundColor: t.surface,
                  borderWidth: 1.5,
                  borderColor: t.border,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <TextInput
                  value={r.amount}
                  onChangeText={(v) => updateRow(i, { amount: v.replace(/[^\d.]/g, '') })}
                  placeholder="0"
                  placeholderTextColor={t.inkMute}
                  keyboardType="decimal-pad"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    paddingVertical: 0,
                    textAlignVertical: 'center',
                    ...Platform.select({ android: { includeFontPadding: false } }),
                    fontFamily: type.familyNumSemi,
                    fontSize: 15,
                    color: t.ink,
                    textAlign: 'right',
                  }}
                />
                <Text style={{ color: t.inkMute, fontSize: 13, fontFamily: type.familyNum }}>
                  ฿
                </Text>
              </View>
              <Pressable
                onPress={() => removeRow(i)}
                disabled={isOnlyEmpty}
                accessibilityRole="button"
                accessibilityLabel="ลบรายการนี้"
                style={({ pressed }) => ({
                  opacity: isOnlyEmpty ? 0.4 : pressed ? 0.7 : 1,
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: t.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <Icon.trash size={16} color={isOnlyEmpty ? t.inkMute : t.danger} />
              </Pressable>
            </Row>
          );
        })}
      </Col>

      {/* subtotal bar — appears only when there's a positive sum.
          Full-width tone-tinted strip with label left, amount right. */}
      {sum > 0 ? (
        <View
          style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: radii.sm,
            backgroundColor: t[toneKey.soft],
            borderWidth: 1,
            borderColor: solid + '30',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontSize: 13, color: ink, fontFamily: type.familySemi }}>
            รวมค่าใช้จ่าย
          </Text>
          <Text
            style={{
              fontFamily: type.familyNumBold,
              fontSize: 16,
              color: ink,
              letterSpacing: -0.2,
            }}
          >
            {fmt.baht(sum)}
          </Text>
        </View>
      ) : null}

      {/* add-row button — full-width dashed. Pressable handles the tap;
          an inner View owns the layout to keep border/padding reliable
          across RN versions (the style-function form can drop layout props). */}
      <Pressable
        onPress={addRow}
        accessibilityRole="button"
        accessibilityLabel="เพิ่มค่าใช้จ่าย"
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, alignSelf: 'stretch' })}
      >
        <View
          style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: solid + '60',
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Icon.plus size={14} color={ink} />
          <Text style={{ fontFamily: type.familySemi, fontSize: 13, color: ink }}>
            เพิ่มค่าใช้จ่าย
          </Text>
        </View>
      </Pressable>
    </Col>
  );
}

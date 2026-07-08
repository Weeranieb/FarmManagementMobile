// Additional Costs editor — one add model: tap a preset chip (or "อื่นๆ" for a
// custom category) to append a cost; each cost is one unified row with an
// inline delete; a tone-tinted subtotal appears once there is a positive sum.
// Shared by Fill / Sell / Move forms.
//
// Controlled: parent owns `rows` so it can persist across review → back nav
// and feed into the mutation payload. The parent seeds `[]` — the empty state
// is just the chip menu, so there are no phantom blank rows.

import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type, type ThemePalette } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { Col } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';

export type CostRow = { category: string; amount: string };

const PRESETS = ['ค่าขนส่ง', 'ค่าแรง', 'ค่ารถ', 'ค่าอาหาร'] as const;

type Tone = 'fill' | 'sell' | 'move';

const TONE_KEYS: Record<
  Tone,
  { solid: keyof ThemePalette; ink: keyof ThemePalette; soft: keyof ThemePalette }
> = {
  fill: { solid: 'fill', ink: 'fillInk', soft: 'fillSoft' },
  sell: { solid: 'sell', ink: 'sellInk', soft: 'sellSoft' },
  move: { solid: 'move', ink: 'moveInk', soft: 'moveSoft' },
};

function toneColors(t: ThemePalette, tone: Tone) {
  const k = TONE_KEYS[tone];
  return { solid: t[k.solid], ink: t[k.ink], soft: t[k.soft] };
}

/** Sum the numeric `amount` of every row. Ignores empties / non-numerics. */
export function additionalCostsTotal(rows: CostRow[]): number {
  return rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
}

/** A single blank row — kept for callers that still reference it. */
export const EMPTY_COST_ROW: CostRow = { category: '', amount: '' };

type Props = {
  tone: Tone;
  rows: CostRow[];
  onChange: (rows: CostRow[]) => void;
};

// ─── Add chip — preset (checks off once used) or the always-on custom chip ─
function AddChip({
  label,
  used,
  ink,
  onPress,
}: {
  label: string;
  used?: boolean;
  ink: string;
  onPress: () => void;
}) {
  const { t } = useTheme();
  return (
    <Pressable
      onPress={used ? undefined : onPress}
      disabled={used}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!used }}
      accessibilityLabel={used ? `${label} — เพิ่มแล้ว` : `เพิ่ม${label}`}
      style={({ pressed }) => ({ opacity: used ? 0.5 : pressed ? 0.85 : 1, alignSelf: 'flex-start' })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[1] + 1,
          paddingVertical: space[2],
          paddingHorizontal: space[3],
          borderRadius: radii.pill,
          borderWidth: 1.5,
          borderColor: t.border,
          backgroundColor: used ? t.surfaceAlt : t.surface,
        }}
      >
        {used ? (
          <Icon.check size={12} color={t.inkMute} stroke={2.6} />
        ) : (
          <Icon.plus size={12} color={ink} stroke={2.4} />
        )}
        <Text
          style={{
            fontSize: type.sizes.sm,
            fontFamily: type.familySemi,
            color: used ? t.inkMute : ink,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

// ─── One cost = one unified bordered row (category · amount · delete) ─────
function CostRowItem({
  row,
  onCategory,
  onAmount,
  onRemove,
}: {
  row: CostRow;
  onCategory: (v: string) => void;
  onAmount: (v: string) => void;
  onRemove: () => void;
}) {
  const { t } = useTheme();
  const isPreset = (PRESETS as readonly string[]).includes(row.category.trim());
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 48,
        borderRadius: radii.md,
        borderWidth: 1.5,
        borderColor: t.border,
        backgroundColor: t.surface,
        overflow: 'hidden',
      }}
    >
      {isPreset ? (
        <Text
          style={{
            flex: 1,
            paddingHorizontal: space[3],
            fontSize: type.sizes.base,
            fontFamily: type.familySemi,
            color: t.ink,
          }}
          numberOfLines={1}
        >
          {row.category}
        </Text>
      ) : (
        <TextInput
          value={row.category}
          onChangeText={onCategory}
          placeholder="ระบุหมวด"
          placeholderTextColor={t.inkMute}
          style={{
            flex: 1,
            minWidth: 0,
            height: 48,
            paddingHorizontal: space[3],
            paddingVertical: 0,
            textAlignVertical: 'center',
            ...Platform.select({ android: { includeFontPadding: false } }),
            fontFamily: type.family,
            fontSize: type.sizes.base,
            color: t.ink,
          }}
        />
      )}

      <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: t.border }} />

      <View
        style={{
          width: 108,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: space[3],
          gap: space[1],
        }}
      >
        <TextInput
          value={row.amount}
          onChangeText={(v) => onAmount(v.replace(/[^\d.]/g, ''))}
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
            fontSize: type.sizes.base,
            color: t.ink,
            textAlign: 'right',
          }}
        />
        <Text style={{ color: t.inkMute, fontSize: type.sizes.sm, fontFamily: type.familyNum }}>฿</Text>
      </View>

      <Pressable
        onPress={onRemove}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="ลบรายการนี้"
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
          width: 42,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          borderLeftWidth: 1,
          borderLeftColor: t.border,
        })}
      >
        <Icon.trash size={15} color={t.inkMute} />
      </Pressable>
    </View>
  );
}

export function AdditionalCostsEditor({ tone, rows, onChange }: Props) {
  const { t } = useTheme();
  const c = toneColors(t, tone);

  const usedPresets = new Set(rows.map((r) => r.category.trim()));

  const addPreset = (preset: string) => {
    if (usedPresets.has(preset)) return;
    onChange([...rows, { category: preset, amount: '' }]);
  };
  const addCustom = () => onChange([...rows, { category: '', amount: '' }]);
  const updateRow = (i: number, patch: Partial<CostRow>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  const sum = additionalCostsTotal(rows);

  return (
    <Col gap={space[3]}>
      {/* Chip menu — the single way to add a cost. Presets check off once used;
          "อื่นๆ" appends a custom, free-text row. */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
        {PRESETS.map((p) => (
          <AddChip key={p} label={p} ink={c.ink} used={usedPresets.has(p)} onPress={() => addPreset(p)} />
        ))}
        <AddChip label="อื่นๆ" ink={c.ink} onPress={addCustom} />
      </View>

      {rows.length > 0 ? (
        <Col gap={space[2]}>
          {rows.map((r, i) => (
            <CostRowItem
              key={i}
              row={r}
              onCategory={(v) => updateRow(i, { category: v })}
              onAmount={(v) => updateRow(i, { amount: v })}
              onRemove={() => removeRow(i)}
            />
          ))}
        </Col>
      ) : null}

      {sum > 0 ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: space[3] - 2,
            paddingHorizontal: space[3] + 2,
            borderRadius: radii.sm,
            backgroundColor: c.soft,
          }}
        >
          <Text style={{ fontSize: type.sizes.sm, color: c.ink, fontFamily: type.familySemi }}>
            รวมค่าใช้จ่าย
          </Text>
          <Text style={{ fontFamily: type.familyNumBold, fontSize: type.sizes.md, color: c.ink }}>
            {fmt.baht(sum)}
          </Text>
        </View>
      ) : null}
    </Col>
  );
}

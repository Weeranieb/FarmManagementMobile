import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { DAY_W, LEDGER_GROUPS, LEDGER_LEAVES, groupTone } from '../ui';

const GROUP_H = 28;

/**
 * Sticky two-tier header. Both tiers — and every data/totals row — share ONE
 * column grid: a fixed `DAY_W` day cell + five `flex:1` value cells each with a
 * 1px left divider. That guarantees the vertical rules line up exactly tier to
 * tier (a group band built from `flex:2 / flex:1…` would drift ~1px because it
 * has fewer dividers than the five-cell rows below it).
 *
 * The group band paints the same five cells (pellet's two share one tint, their
 * internal เช้า|เย็น divider hidden so it reads as one band) and floats the
 * centered group labels over their spans.
 */
export const LedgerTableHeader = memo(function LedgerTableHeader() {
  const { t, mode } = useTheme();
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: t.border,
        borderBottomWidth: 1,
        borderBottomColor: t.borderStrong,
      }}
    >
      {/* tier 1 — group band */}
      <View style={{ height: GROUP_H }}>
        <View style={{ flexDirection: 'row', height: GROUP_H }}>
          <View style={{ width: DAY_W, backgroundColor: t.surfaceAlt }} />
          {LEDGER_LEAVES.map((l, i) => {
            const tone = groupTone(l.group, t, mode);
            // Hide the divider inside a multi-column group (the เช้า|เย็น line),
            // keep it at group boundaries — while still occupying 1px so the
            // grid stays aligned with the rows below.
            const internal = i > 0 && LEDGER_LEAVES[i - 1]?.group === l.group;
            return (
              <View
                key={l.key}
                style={{
                  flex: 1,
                  backgroundColor: tone.soft,
                  borderLeftWidth: 1,
                  borderLeftColor: internal ? 'transparent' : t.border,
                }}
              />
            );
          })}
        </View>
        <View
          style={[StyleSheet.absoluteFill, { flexDirection: 'row', alignItems: 'center' }]}
          pointerEvents="none"
        >
          <View style={{ width: DAY_W }} />
          {LEDGER_GROUPS.map((g) => {
            const tone = groupTone(g.group, t, mode);
            return (
              <View
                key={g.group}
                style={{
                  flex: g.span,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <Text style={{ fontFamily: type.familyBold, fontSize: 12, lineHeight: 18, color: tone.ink }}>
                  {g.title}
                </Text>
                <Text
                  style={{ fontFamily: type.familyMedium, fontSize: 10, lineHeight: 16, color: tone.ink, opacity: 0.75 }}
                >
                  {g.unit}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* tier 2 — leaf labels (same grid) */}
      <View style={{ flexDirection: 'row', backgroundColor: t.surface }}>
        <View style={{ width: DAY_W, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 }}>
          <Text style={{ fontFamily: type.familyBold, fontSize: 10.5, lineHeight: 15, color: t.inkSoft }}>
            วันที่
          </Text>
        </View>
        {LEDGER_LEAVES.map((l) => (
          <View
            key={l.key}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 4,
              borderLeftWidth: 1,
              borderLeftColor: t.border,
            }}
          >
            <Text style={{ fontFamily: type.familyMedium, fontSize: 11, lineHeight: 15, color: t.inkMute }}>
              {l.leaf}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});

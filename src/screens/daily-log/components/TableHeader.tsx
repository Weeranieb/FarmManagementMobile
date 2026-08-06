import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import {
  CELL_PAD_H,
  GROUP_LIGHT,
  HEADER_BAND_H,
  HEADER_LEAF_H,
  NAME_W,
  type ColSpec,
  type GroupKey,
} from '../constants';

/**
 * Group band — one per column group, centered over the `flex` weight of the
 * columns it covers. The unit is rendered inline only where the band is wide
 * enough to carry it (pellet, which spans two columns); single-column groups
 * push their unit down to the leaf row instead, so a two-mark Thai label like
 * "เหยื่อสด" never has to share ~48px with "ลัง".
 */
function GroupBand({
  flexWeight,
  title,
  unit,
  ink,
}: {
  flexWeight: number;
  title: string;
  /** Omitted for single-column groups — see the leaf row. */
  unit?: string;
  ink: string;
}) {
  return (
    <View
      style={{
        flex: flexWeight,
        minWidth: 0,
        paddingHorizontal: CELL_PAD_H,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        borderBottomWidth: 2,
        borderBottomColor: ink,
      }}
    >
      <Text
        style={{
          fontSize: 11.5,
          // 1.57× — "เหยื่อสด" stacks ◌ื and ◌่ over the same base; a tight
          // Latin line-height clips the upper mark on iOS.
          lineHeight: 18,
          fontFamily: type.familyBold,
          color: ink,
          flexShrink: 1,
        }}
        numberOfLines={1}
      >
        {title}
      </Text>
      {unit ? (
        <Text
          style={{
            fontSize: 10,
            lineHeight: 15,
            opacity: 0.55,
            fontFamily: type.familySemi,
            color: ink,
          }}
          numberOfLines={1}
        >
          {unit}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Leaf cell — the line under a group band. Carries either the group's
 * discriminator (เช้า / เย็น, `kind: 'label'`) or its unit (`kind: 'unit'`).
 * They read at different weights on purpose: the discriminator is something you
 * must read to aim at the right cell, the unit is reference.
 */
function LeafCell({ kind, text }: { kind: 'label' | 'unit'; text: string }) {
  const { t } = useTheme();
  const isLabel = kind === 'label';
  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: t.surface,
        paddingHorizontal: CELL_PAD_H,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: isLabel ? 11.5 : 10.5,
          // Mark-safe for "เย็น" (◌็) and "ตัว" (◌ั).
          lineHeight: 17,
          // Both kinds are Thai words — the Latin numeric family has no Thai
          // glyphs and would silently fall back to the system face.
          fontFamily: isLabel ? type.familySemi : type.family,
          color: isLabel ? t.inkSoft : t.inkMute,
        }}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
}

/**
 * Collapse the column list into runs of consecutive columns sharing a group, so
 * the header is derived from that list rather than restated alongside it. Add
 * or drop a column — including a per-client one like ตกปลา — and the bands,
 * their flex weights and the leaf row all follow, with no way for the header to
 * disagree with the row about how many cells there are.
 */
function groupRuns(cols: readonly ColSpec[]): { group: GroupKey; span: number }[] {
  const runs: { group: GroupKey; span: number }[] = [];
  for (const c of cols) {
    const last = runs[runs.length - 1];
    if (last && last.group === c.group) last.span += 1;
    else runs.push({ group: c.group, span: 1 });
  }
  return runs;
}

type Props = {
  /** Visible columns for this client — see `UseDailyLogV6['cols']`. */
  cols: readonly ColSpec[];
};

export function TableHeader({ cols }: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const runs = groupRuns(cols);

  return (
    <View
      style={{
        backgroundColor: t.surface,
        borderBottomWidth: 1,
        borderBottomColor: t.borderStrong,
      }}
    >
      {/* Group row */}
      <View style={{ flexDirection: 'row', height: HEADER_BAND_H }}>
        <View
          style={{
            width: NAME_W,
            backgroundColor: t.surface,
            paddingLeft: 8,
            paddingRight: 6,
            paddingBottom: 6,
            justifyContent: 'flex-end',
            borderRightWidth: 1,
            borderRightColor: t.borderStrong,
          }}
        >
          <Text
            style={{
              fontSize: 10.5,
              lineHeight: 14,
              fontFamily: type.familyBold,
              color: t.inkMute,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            {tx('daily.pondCol')}
          </Text>
        </View>
        {/* A multi-column band (pellet: เช้า + เย็น) has room to carry its unit
            inline; a single-column band does not, so its unit drops to the leaf
            row. Keeping "ถุง" on screen matters — the column used to be logged
            in กก. and a mis-scaled entry is expensive. */}
        {runs.map(({ group, span }) => (
          <GroupBand
            key={group}
            flexWeight={span}
            title={GROUP_LIGHT[group].title}
            unit={span > 1 ? GROUP_LIGHT[group].unit : undefined}
            ink={GROUP_LIGHT[group].ink}
          />
        ))}
      </View>
      {/* Leaf row */}
      <View style={{ flexDirection: 'row', height: HEADER_LEAF_H }}>
        <View
          style={{
            width: NAME_W,
            backgroundColor: t.surface,
            borderRightWidth: 1,
            borderRightColor: t.borderStrong,
          }}
        />
        {/* A column inside a multi-column group needs its discriminator
            (เช้า / เย็น); a group's only column already said its name in the
            band above, so it shows the unit instead. */}
        {cols.map((c) => (
          <LeafCell
            key={c.key}
            kind={c.leaf ? 'label' : 'unit'}
            text={c.leaf || GROUP_LIGHT[c.group].unit}
          />
        ))}
      </View>
    </View>
  );
}

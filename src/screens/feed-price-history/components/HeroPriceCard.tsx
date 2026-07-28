import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Card } from '@/components/ui';
import { Icon } from '@/components/icons';
import { dangerInk } from '@/theme/ink';
import { Row } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import { feedPaletteFor } from '@/screens/feed-collection/feedPalette';
import { feedGlyphFor } from '@/screens/feed-collection/components/FeedIcons';
import type { FeedKind, FeedPriceHistoryEntry } from '@/features/feed-collection';
import i18n from '@/locale/i18n';

type Props = {
  unit: string;
  kind: FeedKind;
  current: FeedPriceHistoryEntry;
  deltaPct: number | null;
};

/**
 * Top-of-screen card: package tile + current price + month-over-month delta
 * chip. Higher price → red (bad for farmer); lower → green; flat → neutral.
 */
export function HeroPriceCard({ unit, kind, current, deltaPct }: Props) {
  const { t, mode } = useTheme();
  const { t: tx } = useTranslation();
  const curDate = new Date(current.effectiveDate);
  const palette = feedPaletteFor(kind);
  const Glyph = feedGlyphFor(kind);

  const tone = pickDeltaTone(deltaPct);
  const { bg, fg, label, icon } = describeDelta(tone, deltaPct, t, mode);

  return (
    <Card padded={false}>
      <View style={{ padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            backgroundColor: palette.tile,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Glyph size={28} stroke={1.8} color="#fff" />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <Text
            style={{
              fontSize: 11,
              fontFamily: type.familyBold,
              color: t.inkMute,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            {tx('feedPrice.hero.current')}
          </Text>
          <Row gap={4} style={{ alignItems: 'baseline' }}>
            <Text
              style={{
                fontFamily: type.familyNumBold,
                fontSize: 32,
                color: t.ink,
                letterSpacing: -0.6,
                lineHeight: 36,
              }}
            >
              {fmt.baht(current.price)}
            </Text>
            <Text style={{ fontSize: 15, color: t.inkSoft, fontFamily: type.familyMedium }}>
              /{unit}
            </Text>
          </Row>
          <Row gap={6} wrap style={{ marginTop: 2 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingVertical: 3,
                paddingHorizontal: 10,
                borderRadius: 9999,
                backgroundColor: bg,
              }}
            >
              {icon}
              <Text style={{ color: fg, fontSize: 12, fontFamily: type.familyNumSemi }}>{label}</Text>
            </View>
          </Row>
          <Text
            style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family, marginTop: 2 }}
          >
            {tx('feedPrice.hero.updated')}{' '}
            <Text style={{ fontFamily: type.familyNum }}>{thaiDate.short(curDate)}</Text>
          </Text>
        </View>
      </View>
    </Card>
  );
}

type DeltaTone = 'down' | 'up' | 'neutral' | 'no-data';

function pickDeltaTone(deltaPct: number | null): DeltaTone {
  if (deltaPct == null) return 'no-data';
  if (deltaPct > 0.5) return 'down'; // price up = bad → red
  if (deltaPct < -0.5) return 'up'; // price down = good → green
  return 'neutral';
}

function describeDelta(
  tone: DeltaTone,
  deltaPct: number | null,
  t: ReturnType<typeof useTheme>['t'],
  mode: ReturnType<typeof useTheme>['mode'],
): { bg: string; fg: string; label: string; icon: React.ReactNode } {
  if (tone === 'no-data') {
    return {
      bg: t.surfaceAlt,
      fg: t.inkSoft,
      label: i18n.t('feedPrice.hero.noCompare'),
      icon: null,
    };
  }
  if (tone === 'neutral') {
    return {
      bg: t.surfaceAlt,
      fg: t.inkSoft,
      label: i18n.t('feedPrice.hero.noChange'),
      icon: <Icon.flat size={13} stroke={2} color={t.inkSoft} />,
    };
  }
  if (tone === 'down') {
    // price went up (bad) — trend arrow points up, in danger red
    const ink = dangerInk(mode, t);
    return {
      bg: t.dangerSoft,
      fg: ink,
      label: i18n.t('feedPrice.hero.deltaUp', { pct: (deltaPct as number).toFixed(1) }),
      icon: <Icon.trendUp size={13} stroke={2} color={ink} />,
    };
  }
  // price went down (good) — trend arrow points down, in fill green
  return {
    bg: t.fillSoft,
    fg: t.fillInk,
    label: i18n.t('feedPrice.hero.deltaDown', { pct: (deltaPct as number).toFixed(1) }),
    icon: <Icon.trendDown size={13} stroke={2} color={t.fillInk} />,
  };
}

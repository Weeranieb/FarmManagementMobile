import { useId } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Card, Pill } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import type { FeedCollectionModel } from '@/features/feed-collection';
import { feedPaletteFor, FEED_PILL_TONE_BY_KIND, FEED_TYPE_LABEL_TH } from '../feedPalette';
import { feedGlyphFor } from './FeedIcons';

type Props = {
  feed: FeedCollectionModel;
  isAdmin: boolean;
  onMore?: () => void;
  onChart?: () => void;
};

// Compact two-line card (Farm OS design · J section). Line 1 carries identity
// (icon · name · type · FCR); line 2 carries the numbers (price · updated) with
// a light trailing price-history link. Everything the old tall card showed, at
// ~40% the height — so 4–6 items are visible at once instead of ~2.
export function FeedCard({ feed, isAdmin, onMore, onChart }: Props) {
  const { t } = useTheme();
  const updated = new Date(feed.updatedAt);
  const Glyph = feedGlyphFor(feed.kind);
  const palette = feedPaletteFor(feed.kind);
  // SVG gradient ids must be url()-safe; useId() emits ":" so strip it.
  const gradId = `feedTile${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <Card padded={false}>
      <Row gap={11} align="center" style={{ paddingVertical: 10, paddingHorizontal: 11 }}>
        {/* Type tile — 135° gradient fill, white glyph, tight colored glow */}
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            backgroundColor: palette.tile, // solid base so iOS casts a clean rounded glow
            ...Platform.select({
              ios: {
                shadowColor: palette.glow,
                shadowOpacity: 0.45,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
              },
              android: { elevation: 3 },
              default: {},
            }),
          }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={38} height={38} style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={palette.gradient[0]} />
                  <Stop offset="1" stopColor={palette.gradient[1]} />
                </LinearGradient>
              </Defs>
              <Rect width={38} height={38} fill={`url(#${gradId})`} />
            </Svg>
            <Glyph size={20} stroke={2} color="#fff" />
          </View>
        </View>

        {/* Two-line main block */}
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          {/* Line 1 — name · type · FCR */}
          <Row gap={space[2]} style={{ minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: type.sizes.base,
                fontFamily: type.familySemi,
                color: t.ink,
                lineHeight: 20,
              }}
            >
              {feed.name}
            </Text>
            <Row gap={space[2] - 2} style={{ flexShrink: 0 }}>
              <Pill tone={FEED_PILL_TONE_BY_KIND[feed.kind]}>{FEED_TYPE_LABEL_TH[feed.kind]}</Pill>
              {feed.fcr != null ? (
                <Text
                  style={{ fontSize: 11.5, color: t.inkSoft, fontFamily: type.familyNumMedium }}
                >
                  FCR{' '}
                  <Text style={{ fontFamily: type.familyNumBold, color: t.ink }}>
                    {feed.fcr.toFixed(2)}
                  </Text>
                </Text>
              ) : null}
            </Row>
          </Row>

          {/* Line 2 — price · updated ........... ราคาย้อนหลัง */}
          <Row gap={space[2]} justify="space-between">
            <Row gap={9} style={{ minWidth: 0 }}>
              {feed.price != null ? (
                <Row align="baseline" gap={2} style={{ flexShrink: 0 }}>
                  <Text
                    style={{
                      fontFamily: type.familyNumBold,
                      fontSize: type.sizes.lg,
                      color: t.ink,
                      letterSpacing: -0.3,
                    }}
                  >
                    {fmt.baht(feed.price)}
                  </Text>
                  <Text style={{ fontSize: 12, color: t.inkSoft, fontFamily: type.familyMedium }}>
                    /{feed.unit}
                  </Text>
                </Row>
              ) : (
                <Text style={{ fontSize: type.sizes.base, color: t.inkMute, fontFamily: type.familySemi }}>
                  ยังไม่มีราคา
                </Text>
              )}
              <Row gap={space[1]} style={{ flexShrink: 0 }}>
                <Icon.clock size={11} color={t.inkMute} />
                <Text style={{ fontSize: 11.5, color: t.inkMute, fontFamily: type.familyNum }}>
                  {thaiDate.short(updated)}
                </Text>
              </Row>
            </Row>

            {onChart ? (
              <Pressable
                onPress={onChart}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="ดูราคาย้อนหลัง"
                style={({ pressed }) => ({ flexShrink: 0, opacity: pressed ? 0.6 : 1 })}
              >
                {/* Layout lives on this inner View: the Pressable style-function
                    form can drop layout props (flexDirection) across RN versions,
                    which stacked the label above the chevron. */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 2, paddingLeft: 4 }}>
                  <Text
                    numberOfLines={1}
                    style={{ fontSize: 11.5, fontFamily: type.familySemi, color: t.brand }}
                  >
                    ราคาย้อนหลัง
                  </Text>
                  <Icon.chevR size={13} color={t.brand} />
                </View>
              </Pressable>
            ) : null}
          </Row>
        </View>

        {/* Kebab */}
        {isAdmin ? (
          <Pressable
            onPress={onMore}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="ตัวเลือก"
            style={{
              width: 28,
              height: 44,
              borderRadius: radii.sm,
              marginRight: -4,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.more size={19} color={t.inkSoft} />
          </Pressable>
        ) : null}
      </Row>
    </Card>
  );
}

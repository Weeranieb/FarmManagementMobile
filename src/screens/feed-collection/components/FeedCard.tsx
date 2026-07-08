import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { warnInk } from '@/theme/ink';
import { Card, Pill } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import type { FeedCollectionModel } from '@/features/feed-collection';
import { FEED_PILL_TONE_BY_KIND, FEED_TYPE_LABEL_TH } from '../feedPalette';
import { FeedChartIcon, feedGlyphFor } from './FeedIcons';

type Props = {
  feed: FeedCollectionModel;
  isAdmin: boolean;
  onMore?: () => void;
  onChart?: () => void;
};

export function FeedCard({ feed, isAdmin, onMore, onChart }: Props) {
  const { t, mode } = useTheme();
  const updated = new Date(feed.updatedAt);
  const Glyph = feedGlyphFor(feed.kind);

  // Tile + glyph reuse the type's semantic pill tone (pellet=warn, fresh=brand)
  // as a soft-tinted tile — cohesive with the pill and the rest of the app's
  // soft icon-tile convention, instead of the bespoke saturated feed colors.
  const tone = FEED_PILL_TONE_BY_KIND[feed.kind];
  const tileBg = tone === 'warn' ? t.warnSoft : t.brandSoft;
  const glyphColor = tone === 'warn' ? warnInk(mode, t) : t.brandInk;

  return (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      <View style={{ padding: space[4] }}>
        {/* Header — tile · name + type/FCR · more */}
        <Row gap={space[3]} align="flex-start">
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              backgroundColor: tileBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Glyph size={22} stroke={2} color={glyphColor} />
          </View>

          <View style={{ flex: 1, minWidth: 0, gap: space[1] }}>
            <Text
              numberOfLines={2}
              style={{
                fontSize: type.sizes.md,
                fontFamily: type.familySemi,
                color: t.ink,
                lineHeight: 22, // breathe for tone marks (ไก่, ขึ้น)
              }}
            >
              {feed.name}
            </Text>
            <Row gap={space[2] - 2} wrap>
              <Pill tone={tone}>{FEED_TYPE_LABEL_TH[feed.kind]}</Pill>
              {feed.fcr != null ? (
                <Text
                  style={{ fontSize: type.sizes.sm, color: t.inkSoft, fontFamily: type.familyNumMedium }}
                >
                  FCR{' '}
                  <Text style={{ fontFamily: type.familyNumBold, color: t.ink }}>
                    {feed.fcr.toFixed(2)}
                  </Text>
                </Text>
              ) : null}
            </Row>
          </View>

          {isAdmin ? (
            <Pressable
              onPress={onMore}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="ตัวเลือก"
              style={{
                width: 40,
                height: 40,
                borderRadius: radii.sm,
                marginTop: -2,
                marginRight: -4,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.more size={20} color={t.inkSoft} />
            </Pressable>
          ) : null}
        </Row>

        {/* Anchor row — price + last-updated (left) · price-history button (right) */}
        <Row justify="space-between" align="flex-end" style={{ marginTop: space[3] }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            {feed.price != null ? (
              <Row align="baseline" gap={space[1]}>
                <Text
                  style={{
                    fontFamily: type.familyNumBold,
                    fontSize: type.sizes.xxl,
                    color: t.ink,
                    letterSpacing: -0.6,
                  }}
                >
                  {fmt.baht(feed.price)}
                </Text>
                <Text
                  style={{ fontSize: type.sizes.base, color: t.inkSoft, fontFamily: type.familyMedium }}
                >
                  /{feed.unit}
                </Text>
              </Row>
            ) : (
              <Text style={{ fontFamily: type.familySemi, fontSize: type.sizes.base, color: t.inkMute }}>
                ยังไม่มีราคา
              </Text>
            )}
            <Row gap={space[2] - 2} style={{ marginTop: space[1] }}>
              <Icon.clock size={13} color={t.inkMute} />
              <Text style={{ fontSize: type.sizes.sm, color: t.inkMute, fontFamily: type.family }}>
                อัปเดต <Text style={{ fontFamily: type.familyNum }}>{thaiDate.short(updated)}</Text>
              </Text>
            </Row>
          </View>

          {onChart ? (
            <Pressable
              onPress={onChart}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="ดูราคาย้อนหลัง"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              {/* Inner View owns the layout — the Pressable style-function form
                  can drop layout props across RN versions (same reason the
                  additional-costs add-row button wraps its layout in a View). */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space[2] - 2,
                  paddingVertical: space[2],
                  paddingHorizontal: space[3],
                  borderRadius: radii.pill,
                  borderWidth: 1,
                  borderColor: t.border,
                  backgroundColor: t.surface,
                }}
              >
                <FeedChartIcon size={15} color={t.brand} />
                <Text style={{ fontSize: type.sizes.sm, fontFamily: type.familySemi, color: t.brand }}>
                  ราคาย้อนหลัง
                </Text>
              </View>
            </Pressable>
          ) : null}
        </Row>
      </View>
    </Card>
  );
}

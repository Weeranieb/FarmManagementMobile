import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Card, Pill } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import type { FeedCollectionModel } from '@/features/feed-collection';
import { FEED_PILL_TONE_BY_KIND, FEED_TYPE_LABEL_TH, feedPaletteFor } from '../feedPalette';
import { FeedChartIcon, feedGlyphFor } from './FeedIcons';

type Props = {
  feed: FeedCollectionModel;
  isAdmin: boolean;
  onMore?: () => void;
  onChart?: () => void;
};

export function FeedCard({ feed, isAdmin, onMore, onChart }: Props) {
  const { t } = useTheme();
  const updated = new Date(feed.updatedAt);
  const palette = feedPaletteFor(feed.kind);
  const Glyph = feedGlyphFor(feed.kind);

  return (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      <View style={{ padding: 14 }}>
        <Row gap={12} align="flex-start" style={{ marginBottom: 10 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: palette.tile,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Glyph size={22} stroke={2} color="#fff" />
          </View>

          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            <Text
              numberOfLines={2}
              style={{
                fontSize: 16,
                fontFamily: type.familySemi,
                color: t.ink,
                lineHeight: 22, // breathe for tone marks (ไก่, ขึ้น)
              }}
            >
              {feed.name}
            </Text>
            <Row gap={6} wrap>
              <Pill tone={FEED_PILL_TONE_BY_KIND[feed.kind]}>
                {FEED_TYPE_LABEL_TH[feed.kind]}
              </Pill>
              {feed.fcr != null ? (
                <Text style={{ fontSize: 12, color: t.inkSoft, fontFamily: type.familyNumMedium }}>
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
                width: 44,
                height: 44,
                borderRadius: 10,
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

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: 4,
            marginBottom: 6,
          }}
        >
          {feed.price != null ? (
            <>
              <Text
                style={{
                  fontFamily: type.familyNumBold,
                  fontSize: 28,
                  color: t.ink,
                  letterSpacing: -0.6,
                }}
              >
                {fmt.baht(feed.price)}
              </Text>
              <Text style={{ fontSize: 14, color: t.inkSoft, fontFamily: type.familyMedium }}>
                /{feed.unit}
              </Text>
            </>
          ) : (
            <Text
              style={{
                fontFamily: type.familySemi,
                fontSize: 14,
                color: t.inkMute,
              }}
            >
              ยังไม่มีราคา
            </Text>
          )}
        </View>

        <Row
          justify="space-between"
          style={{ paddingTop: 10, borderTopWidth: 1, borderTopColor: t.border }}
        >
          <Row gap={6}>
            <Icon.clock size={13} color={t.inkMute} />
            <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
              อัปเดต{' '}
              <Text style={{ fontFamily: type.familyNum }}>{thaiDate.short(updated)}</Text>
            </Text>
          </Row>
          <Pressable
            onPress={onChart}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="ดูประวัติราคา"
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              marginRight: -10,
              marginBottom: -8,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FeedChartIcon size={18} color={t.brand} />
          </Pressable>
        </Row>
      </View>
    </Card>
  );
}

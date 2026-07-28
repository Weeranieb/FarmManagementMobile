import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { dangerInk, warnInk } from '@/theme/ink';
import { Row } from '@/components/layout/Row';
import { Pill, Tappable } from '@/components/ui';
import { fmt } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import { SheetShell } from '@/components/sheet';
import type { FeedCollectionModel } from '@/features/feed-collection';
import { FEED_PILL_TONE_BY_KIND, FEED_TYPE_LABEL_TH } from '../feedPalette';
import { FeedChartIcon, feedGlyphFor } from './FeedIcons';

type Props = {
  visible: boolean;
  feed: FeedCollectionModel | null;
  onClose: () => void;
  onEdit: () => void;
  onUpdatePrice: () => void;
  onDelete?: () => void;
};

export function SheetFeedActions({
  visible,
  feed,
  onClose,
  onEdit,
  onUpdatePrice,
  onDelete,
}: Props) {
  const { t, mode, shadow } = useTheme();
  const { t: tx } = useTranslation();
  const danger = dangerInk(mode, t);

  if (!feed) {
    return <SheetShell visible={visible} onClose={onClose} fitContent showClose />;
  }

  const Glyph = feedGlyphFor(feed.kind);
  const tone = FEED_PILL_TONE_BY_KIND[feed.kind];
  const tileBg = tone === 'warn' ? t.warnSoft : t.brandSoft;
  const toneInk = tone === 'warn' ? warnInk(mode, t) : t.brandInk;
  const toneEdge = tone === 'warn' ? t.warn : t.brand;
  const updatedLabel = thaiDate.short(new Date(feed.updatedAt));

  return (
    <SheetShell visible={visible} onClose={onClose} fitContent showClose>
      <View style={{ paddingHorizontal: space[5], paddingTop: space[1], paddingBottom: space[3] }}>
        {/* Identity — who this is. Price context lives on the update action below. */}
        <Row gap={space[3]} style={{ marginBottom: space[4] }}>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: radii.md,
              backgroundColor: tileBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Glyph size={24} stroke={2} color={toneInk} />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: space[1] }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: type.sizes.lg,
                fontFamily: type.familyBold,
                color: t.ink,
                lineHeight: 24,
              }}
            >
              {feed.name}
            </Text>
            <Pill tone={tone}>
              {tx('feed.feedKind', { kind: FEED_TYPE_LABEL_TH[feed.kind] })}
            </Pill>
          </View>
        </Row>

        {/* Primary — the daily action, given hero weight + live decision context. */}
        <Tappable
          onPress={onUpdatePrice}
          accessibilityRole="button"
          android_ripple={{ color: toneEdge }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space[3],
              padding: space[3],
              marginBottom: space[3],
              borderRadius: radii.md,
              backgroundColor: tileBg,
              borderWidth: 1.5,
              borderColor: toneEdge,
              ...shadow,
            }}
          >
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: radii.sm,
                backgroundColor: t.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FeedChartIcon size={22} color={toneInk} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{ fontSize: type.sizes.md, fontFamily: type.familyBold, color: toneInk }}
              >
                {tx('feedCollection.actions.updatePrice')}
              </Text>
              {feed.price != null ? (
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: type.sizes.sm,
                    color: toneInk,
                    fontFamily: type.family,
                    marginTop: 2,
                  }}
                >
                  {tx('feedCollection.actions.latest')}{' '}
                  <Text style={{ fontFamily: type.familyNumSemi }}>{fmt.baht(feed.price)}</Text>/
                  {feed.unit} · <Text style={{ fontFamily: type.familyNum }}>{updatedLabel}</Text>
                </Text>
              ) : (
                <Text
                  style={{
                    fontSize: type.sizes.sm,
                    color: toneInk,
                    fontFamily: type.family,
                    marginTop: 2,
                  }}
                >
                  {tx('feedCollection.actions.noPriceYet')}
                </Text>
              )}
            </View>
            <Icon.chevR size={18} color={toneInk} />
          </View>
        </Tappable>

        {/* Secondary — quieter, no card fill. */}
        <ActionRow
          icon={<Icon.edit size={18} color={t.inkSoft} />}
          label={tx('feedCollection.actions.editDetails')}
          sub={tx('feedCollection.actions.editSub')}
          onPress={onEdit}
        />

        {/* Destructive — demoted, separated, no chevron. */}
        <View style={{ height: 1, backgroundColor: t.border, marginVertical: space[2] }} />
        <ActionRow
          icon={<Icon.trash size={18} color={danger} />}
          iconBg={t.dangerSoft}
          label={tx('feedCollection.actions.deleteItem')}
          sub={tx('feedCollection.actions.deleteSub')}
          labelColor={danger}
          showChevron={false}
          onPress={onDelete}
        />
      </View>
    </SheetShell>
  );
}

function ActionRow({
  icon,
  iconBg,
  label,
  sub,
  labelColor,
  showChevron = true,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  sub: string;
  labelColor?: string;
  showChevron?: boolean;
  onPress?: () => void;
}) {
  const { t } = useTheme();
  return (
    <Tappable
      onPress={onPress}
      android_ripple={{ color: t.surfaceAlt }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[3],
        paddingHorizontal: space[2],
        paddingVertical: space[3],
        borderRadius: radii.md,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: radii.sm,
          backgroundColor: iconBg ?? t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontSize: type.sizes.base,
            fontFamily: type.familySemi,
            color: labelColor ?? t.ink,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: type.sizes.sm,
            color: t.inkMute,
            fontFamily: type.family,
            marginTop: 2,
          }}
        >
          {sub}
        </Text>
      </View>
      {showChevron ? <Icon.chevR size={16} color={t.inkSoft} /> : null}
    </Tappable>
  );
}

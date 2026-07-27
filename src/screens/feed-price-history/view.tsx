import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Pill, PillText, Tappable } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { SheetPriceEntry } from '@/screens/feed-collection/components/SheetPriceEntry';
import { PriceSavedToast } from '@/screens/feed-collection/components/PriceSavedToast';
import { FEED_PILL_TONE_BY_KIND, FEED_TYPE_LABEL_TH } from '@/screens/feed-collection/feedPalette';
import { HeroPriceCard } from './components/HeroPriceCard';
import { RangeSegmented } from './components/RangeSegmented';
import { PriceChartCard } from './components/PriceChartCard';
import { StatsRow } from './components/StatsRow';
import { TimelineList } from './components/TimelineList';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ConfirmDeleteDialog } from './components/ConfirmDeleteDialog';
import type { FeedPriceHistoryState } from './hook';

export function FeedPriceHistoryView({
  feed,
  feedNotFound,
  isAdmin,
  isLoading,
  chartData,
  allEntries,
  timelineEntries,
  current,
  deltaPct,
  isEmpty,
  isSingle,
  range,
  setRange,
  sheet,
  selectedEntry,
  openAdd,
  openEdit,
  closeSheet,
  overflowOpen,
  toggleOverflow,
  closeOverflow,
  saving,
  handleAdd,
  handleEdit,
  handleOverwrite,
  requestDelete,
  cancelDelete,
  confirmDelete,
  priceToast,
  dismissPriceToast,
}: FeedPriceHistoryState) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Show skeleton while waiting for either the parent feed or its history.
  const showSkeleton = isLoading && !current;
  // Chart / range / stats need at least two points to mean anything.
  const hasChart = !isEmpty && !isSingle;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <PriceHistoryTopBar
        title={feed?.name ?? tx('feedPrice.title')}
        kindLabel={feed ? FEED_TYPE_LABEL_TH[feed.kind] : null}
        kindTone={feed ? FEED_PILL_TONE_BY_KIND[feed.kind] : 'warn'}
        fcr={feed?.fcr ?? null}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(app)/feed-collection'))}
        showOverflow={isAdmin && !showSkeleton && !feedNotFound}
        onOverflow={toggleOverflow}
      />

      {overflowOpen ? <OverflowMenu onClose={closeOverflow} onAddPrice={openAdd} /> : null}

      <ScrollView
        delaysContentTouches={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {showSkeleton ? (
          <LoadingSkeleton />
        ) : feedNotFound || !feed || !current ? (
          <NotFoundOrEmpty
            isEmptyForKnownFeed={!feedNotFound && !current}
            isAdmin={isAdmin}
            onLogPrice={openAdd}
          />
        ) : (
          <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 14 }}>
            <HeroPriceCard
              unit={feed.unit}
              kind={feed.kind}
              current={current}
              deltaPct={deltaPct}
            />

            {hasChart ? <RangeSegmented value={range} onChange={setRange} /> : null}

            <PriceChartCard
              data={chartData}
              kind={feed.kind}
              isEmpty={isEmpty}
              isSingle={isSingle}
              isAdmin={isAdmin}
              onLogPrice={openAdd}
            />

            {hasChart ? <StatsRow data={chartData} /> : null}

            <TimelineList
              entries={timelineEntries}
              isAdmin={isAdmin}
              currentId={current.id}
              onEditEntry={openEdit}
            />
          </View>
        )}
      </ScrollView>

      <SheetPriceEntry
        visible={sheet === 'add' || sheet === 'edit'}
        mode={sheet === 'edit' ? 'edit' : 'add'}
        feed={feed}
        entry={sheet === 'edit' ? selectedEntry : null}
        entries={allEntries}
        saving={saving}
        onClose={closeSheet}
        onSubmit={handleAdd}
        onSubmitEdit={handleEdit}
        onOverwrite={handleOverwrite}
        onDelete={requestDelete}
      />

      <ConfirmDeleteDialog
        visible={sheet === 'confirm-delete'}
        entry={selectedEntry}
        unit={feed?.unit ?? ''}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />

      {priceToast ? (
        <PriceSavedToast
          key={priceToast.key}
          detail={priceToast.detail}
          bottom={insets.bottom + 20}
          onDismiss={dismissPriceToast}
        />
      ) : null}
    </View>
  );
}

// ── TopBar ────────────────────────────────────────────────────────────────
function PriceHistoryTopBar({
  title,
  kindLabel,
  kindTone,
  fcr,
  onBack,
  showOverflow,
  onOverflow,
}: {
  title: string;
  kindLabel: string | null;
  kindTone: 'warn' | 'brand';
  fcr: number | null;
  onBack: () => void;
  showOverflow: boolean;
  onOverflow: () => void;
}) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  return (
    <View
      style={{
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: t.border,
        backgroundColor: t.bg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <Tappable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={tx('common.back')}
        style={iconButtonStyle(t.border)}
      >
        <Icon.back size={18} color={t.ink} />
      </Tappable>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 18, fontFamily: type.familyBold, color: t.ink, lineHeight: 24 }}
        >
          {title}
        </Text>
        {kindLabel ? (
          <Row gap={6} style={{ marginTop: 4 }}>
            <Pill tone={kindTone} style={{ paddingVertical: 2, paddingHorizontal: 8 }}>
              <PillText tone={kindTone}>{kindLabel}</PillText>
            </Pill>
            {fcr != null ? (
              <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>
                · FCR{' '}
                <Text style={{ fontFamily: type.familyNumBold, color: t.inkSoft }}>
                  {fcr.toFixed(2)}
                </Text>
              </Text>
            ) : null}
          </Row>
        ) : null}
      </View>
      {showOverflow ? (
        <Tappable
          onPress={onOverflow}
          accessibilityRole="button"
          accessibilityLabel={tx('feedPrice.options')}
          style={iconButtonStyle(t.border)}
        >
          <Icon.more size={20} color={t.ink} />
        </Tappable>
      ) : null}
    </View>
  );
}

function iconButtonStyle(borderColor: string) {
  return {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
}

// ── Overflow popover (just "เพิ่มราคา" for now) ────────────────────────────
function OverflowMenu({
  onClose,
  onAddPrice,
}: {
  onClose: () => void;
  onAddPrice: () => void;
}) {
  const { t, shadowLg } = useTheme();
  const { t: tx } = useTranslation();
  return (
    <>
      <Pressable
        onPress={onClose}
        accessibilityLabel={tx('feedPrice.closeMenu')}
        style={{
          position: 'absolute',
          zIndex: 8,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <View
        style={[
          {
            position: 'absolute',
            top: 64,
            right: 14,
            zIndex: 9,
            minWidth: 200,
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.border,
            borderRadius: 12,
            padding: 6,
          },
          shadowLg,
        ]}
      >
        <Tappable
          onPress={onAddPrice}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderRadius: 9,
          }}
        >
          <Icon.plus size={18} stroke={2.1} color={t.ink} />
          <Text style={{ fontSize: 14, fontFamily: type.familySemi, color: t.ink }}>
            {tx('feedPrice.addPrice')}
          </Text>
        </Tappable>
      </View>
    </>
  );
}

// ── Fallbacks: feed missing, or feed exists but no history yet ────────────
function NotFoundOrEmpty({
  isEmptyForKnownFeed,
  isAdmin,
  onLogPrice,
}: {
  isEmptyForKnownFeed: boolean;
  isAdmin: boolean;
  onLogPrice: () => void;
}) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  return (
    <View
      style={{
        paddingHorizontal: 24,
        paddingTop: 56,
        paddingBottom: 32,
        alignItems: 'center',
        gap: 14,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon.search size={28} color={t.inkMute} />
      </View>
      <Text
        style={{
          fontSize: 16,
          fontFamily: type.familyBold,
          color: t.ink,
          textAlign: 'center',
        }}
      >
        {isEmptyForKnownFeed ? tx('feedPrice.noHistory') : tx('feedPrice.feedNotFound')}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: t.inkMute,
          fontFamily: type.family,
          lineHeight: 20,
          maxWidth: 280,
          textAlign: 'center',
        }}
      >
        {isEmptyForKnownFeed
          ? tx('feedPrice.noHistoryHelp')
          : tx('feedPrice.notFoundHelp')}
      </Text>
      {isEmptyForKnownFeed && isAdmin ? (
        <Tappable
          onPress={onLogPrice}
          accessibilityRole="button"
          style={{
            marginTop: 6,
            height: 46,
            paddingHorizontal: 22,
            borderRadius: 12,
            backgroundColor: t.brand,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Icon.plus size={18} stroke={2.2} color="#fff" />
          <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 14 }}>
            {tx('feedPrice.logNewPrice')}
          </Text>
        </Tappable>
      ) : null}
    </View>
  );
}

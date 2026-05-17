import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Pill, PillText } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { SheetUpdatePrice } from '@/screens/feed-collection/components/SheetUpdatePrice';
import { FeedChartIcon } from '@/screens/feed-collection/components/FeedIcons';
import { FEED_PILL_TONE_BY_KIND, FEED_TYPE_LABEL_TH } from '@/screens/feed-collection/feedPalette';
import { HeroPriceCard } from './components/HeroPriceCard';
import { RangeSegmented } from './components/RangeSegmented';
import { PriceChartCard } from './components/PriceChartCard';
import { StatsRow } from './components/StatsRow';
import { TimelineList } from './components/TimelineList';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import type { FeedPriceHistoryState } from './hook';

export function FeedPriceHistoryView({
  feed,
  feedNotFound,
  isAdmin,
  isLoading,
  chartData,
  timelineEntries,
  current,
  deltaPct,
  isEmpty,
  range,
  setRange,
  sheet,
  openUpdatePrice,
  closeSheet,
  overflowOpen,
  toggleOverflow,
  closeOverflow,
  handleUpdatePrice,
}: FeedPriceHistoryState) {
  const { t } = useTheme();
  const router = useRouter();

  // Show skeleton while waiting for either the parent feed or its history.
  const showSkeleton = isLoading && !current;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <PriceHistoryTopBar
        title={feed?.name ?? 'ประวัติราคา'}
        kindLabel={feed ? FEED_TYPE_LABEL_TH[feed.kind] : null}
        kindTone={feed ? FEED_PILL_TONE_BY_KIND[feed.kind] : 'warn'}
        fcr={feed?.fcr ?? null}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(app)/feed-collection'))}
        showOverflow={isAdmin && !showSkeleton && !feedNotFound}
        onOverflow={toggleOverflow}
      />

      {overflowOpen ? (
        <OverflowMenu onClose={closeOverflow} onUpdatePrice={openUpdatePrice} />
      ) : null}

      <ScrollView
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
            onLogPrice={openUpdatePrice}
          />
        ) : (
          <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 14 }}>
            <HeroPriceCard
              unit={feed.unit}
              kind={feed.kind}
              current={current}
              deltaPct={deltaPct}
            />

            {!isEmpty ? <RangeSegmented value={range} onChange={setRange} /> : null}

            <PriceChartCard
              data={chartData}
              kind={feed.kind}
              isEmpty={isEmpty}
              isAdmin={isAdmin}
              onLogPrice={openUpdatePrice}
            />

            {!isEmpty ? <StatsRow data={chartData} /> : null}

            {!isEmpty ? <TimelineList entries={timelineEntries} /> : null}
          </View>
        )}
      </ScrollView>

      <SheetUpdatePrice
        visible={sheet === 'update-price'}
        feed={feed}
        onClose={closeSheet}
        onSubmit={handleUpdatePrice}
      />
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
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="ย้อนกลับ"
        style={iconButtonStyle(t.border)}
      >
        <Icon.back size={18} color={t.ink} />
      </Pressable>
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
        <Pressable
          onPress={onOverflow}
          accessibilityRole="button"
          accessibilityLabel="ตัวเลือก"
          style={iconButtonStyle(t.border)}
        >
          <Icon.more size={20} color={t.ink} />
        </Pressable>
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

// ── Overflow popover (just "อัปเดตราคา" for now) ──────────────────────────
function OverflowMenu({
  onClose,
  onUpdatePrice,
}: {
  onClose: () => void;
  onUpdatePrice: () => void;
}) {
  const { t, shadowLg } = useTheme();
  return (
    <>
      <Pressable
        onPress={onClose}
        accessibilityLabel="ปิดเมนู"
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
        <Pressable
          onPress={onUpdatePrice}
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
          <FeedChartIcon size={18} color={t.ink} />
          <Text style={{ fontSize: 14, fontFamily: type.familySemi, color: t.ink }}>
            อัปเดตราคา
          </Text>
        </Pressable>
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
        {isEmptyForKnownFeed ? 'ยังไม่มีประวัติราคา' : 'ไม่พบรายการอาหารนี้'}
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
          ? 'บันทึกราคาใหม่เพื่อเริ่มเก็บประวัติ — ค่าเฉลี่ย ค่าสูงสุด/ต่ำสุด จะคำนวณให้อัตโนมัติ'
          : 'ลองกลับไปยังหน้าคลังอาหารแล้วเปิดรายการที่ต้องการดู'}
      </Text>
      {isEmptyForKnownFeed && isAdmin ? (
        <Pressable
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
            บันทึกราคาใหม่
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

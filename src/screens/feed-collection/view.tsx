import { Platform, RefreshControl, ScrollView, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { SearchHeader, TopBar, Tappable } from '@/components/ui';
import { Icon } from '@/components/icons';
import { FeedCard } from './components/FeedCard';
import { FeedEmptyState } from './components/FeedEmptyState';
import { SearchSuggestions } from './components/SearchSuggestions';
import { SheetAddFeed } from './components/SheetAddFeed';
import { SheetFeedActions } from './components/SheetFeedActions';
import { SheetPriceEntry } from './components/SheetPriceEntry';
import { PriceSavedToast } from './components/PriceSavedToast';
import type { FeedCollectionState } from './hook';

type Props = FeedCollectionState & { showHeader?: boolean };

export function FeedCollectionView({
  feeds,
  filtered,
  isAdmin,
  refreshing,
  onRefresh,
  searchOpen,
  query,
  onOpenSearch,
  onCloseSearch,
  onChangeQuery,
  sheet,
  activeFeed,
  activeFeedPriceHistory,
  openActions,
  openAdd,
  openEdit,
  openUpdatePrice,
  closeSheet,
  saving,
  handleCreate,
  handleEdit,
  handleUpdatePrice,
  handleOverwritePrice,
  handleOpenHistory,
  priceToast,
  dismissPriceToast,
  showHeader = true,
}: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const trimmed = query.trim();
  const isEmpty = feeds.length === 0;
  const showSearchEmpty = searchOpen && trimmed.length > 0 && filtered.length === 0;
  const showSuggestions = searchOpen && trimmed.length === 0;
  const showResultCount = searchOpen && trimmed.length > 0 && filtered.length > 0;

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={t.brand}
      {...(Platform.OS === 'android' ? { colors: [t.brand] } : {})}
    />
  );

  const listHeader =
    showResultCount || showSuggestions ? (
      <>
        {showResultCount ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 6 }}>
            <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
              {tx('feedCollection.resultsFound')}{' '}
              <Text style={{ fontFamily: type.familyNumBold, color: t.ink }}>{filtered.length}</Text>{' '}
              {tx('feedCollection.resultsMatching')} &ldquo;{trimmed}&rdquo;
            </Text>
          </View>
        ) : null}
        {showSuggestions ? <SearchSuggestions onPick={onChangeQuery} /> : null}
      </>
    ) : null;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? (
        searchOpen ? (
          <SearchHeader
            value={query}
            onChangeText={onChangeQuery}
            onCancel={onCloseSearch}
            placeholder={tx('feedCollection.searchPlaceholder')}
          />
        ) : (
          <TopBar
            title={tx('feedCollection.title')}
            subtitle={
              isEmpty
                ? tx('feedCollection.countEmpty')
                : tx('feedCollection.count', { count: feeds.length })
            }
            leading={
              <Tappable
                onPress={() =>
                  router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/manage')
                }
                accessibilityRole="button"
                accessibilityLabel={tx('common.back')}
                style={iconButtonStyle(t.border)}
              >
                <Icon.back size={18} color={t.ink} />
              </Tappable>
            }
            trailing={
              !isEmpty ? (
                <Tappable
                  onPress={onOpenSearch}
                  accessibilityRole="button"
                  accessibilityLabel={tx('feedCollection.searchA11y')}
                  style={iconButtonStyle(t.border)}
                >
                  <Icon.search size={18} color={t.ink} />
                </Tappable>
              ) : null
            }
          />
        )
      ) : null}

      {isEmpty || showSearchEmpty ? (
        <ScrollView
          delaysContentTouches={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {listHeader}
          {isEmpty ? (
            <FeedEmptyState isAdmin={isAdmin} onAdd={openAdd} />
          ) : (
            <SearchEmpty query={trimmed} />
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <FlashList
            data={filtered}
            keyExtractor={(f) => String(f.id)}
            renderItem={({ item }) => (
              <FeedCard
                feed={item}
                isAdmin={isAdmin}
                onMore={() => openActions(item)}
                onChart={() => handleOpenHistory(item)}
              />
            )}
            ItemSeparatorComponent={FeedSeparator}
            ListHeaderComponent={listHeader}
            contentContainerStyle={{
              paddingHorizontal: space[5],
              paddingTop: space[3],
              paddingBottom: (isAdmin ? 132 : space[7]) + insets.bottom,
            }}
            delaysContentTouches={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={refreshControl}
          />
        </View>
      )}

      {isAdmin && !isEmpty ? (
        <View
          style={{
            position: 'absolute',
            left: space[4],
            right: space[4],
            bottom: Math.max(space[6], insets.bottom + space[2]),
          }}
        >
          <Tappable
            onPress={openAdd}
            accessibilityRole="button"
            accessibilityLabel={tx('feedCollection.add')}
            style={{
              height: 52,
              borderRadius: radii.md,
              backgroundColor: t.brand,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: space[2],
            }}
          >
            <Icon.plus size={20} color="#fff" stroke={2.2} />
            <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: type.sizes.base }}>
              {tx('feedCollection.add')}
            </Text>
          </Tappable>
        </View>
      ) : null}

      <SheetFeedActions
        visible={sheet === 'actions'}
        feed={activeFeed}
        onClose={closeSheet}
        onEdit={openEdit}
        onUpdatePrice={openUpdatePrice}
      />

      <SheetAddFeed
        visible={sheet === 'add' || sheet === 'edit'}
        editing={sheet === 'edit' ? activeFeed : null}
        saving={saving}
        onClose={closeSheet}
        onSubmit={sheet === 'edit' ? handleEdit : handleCreate}
      />

      <SheetPriceEntry
        visible={sheet === 'update-price'}
        mode="add"
        feed={activeFeed}
        entries={activeFeedPriceHistory}
        saving={saving}
        onClose={closeSheet}
        onSubmit={handleUpdatePrice}
        onOverwrite={handleOverwritePrice}
      />

      {priceToast ? (
        <PriceSavedToast
          key={priceToast.key}
          detail={priceToast.detail}
          bottom={Math.max(space[6], insets.bottom + space[2]) + 52 + space[3]}
          onDismiss={dismissPriceToast}
        />
      ) : null}
    </View>
  );
}

/** 8px vertical gap between the compact feed cards (Farm OS · J section). */
function FeedSeparator() {
  return <View style={{ height: 8 }} />;
}

function SearchEmpty({ query }: { query: string }) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  return (
    <View style={{ paddingTop: 56, paddingHorizontal: 32, paddingBottom: 24, alignItems: 'center' }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Icon.search size={28} color={t.inkMute} />
      </View>
      <Text
        style={{
          fontSize: 16,
          fontFamily: type.familyBold,
          color: t.ink,
          marginBottom: 6,
          lineHeight: 22,
          textAlign: 'center',
        }}
      >
        {tx('feedCollection.searchEmptyTitle')} &ldquo;{query}&rdquo;
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
        {tx('feedCollection.searchEmptyHelper')}
      </Text>
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

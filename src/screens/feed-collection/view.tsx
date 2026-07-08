import { Platform, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { SearchHeader, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { FeedCard } from './components/FeedCard';
import { FeedEmptyState } from './components/FeedEmptyState';
import { SearchSuggestions } from './components/SearchSuggestions';
import { SheetAddFeed } from './components/SheetAddFeed';
import { SheetFeedActions } from './components/SheetFeedActions';
import { SheetUpdatePrice } from './components/SheetUpdatePrice';
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
  openActions,
  openAdd,
  openEdit,
  openUpdatePrice,
  closeSheet,
  handleCreate,
  handleEdit,
  handleUpdatePrice,
  handleOpenHistory,
  showHeader = true,
}: Props) {
  const { t } = useTheme();
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
              พบ{' '}
              <Text style={{ fontFamily: type.familyNumBold, color: t.ink }}>{filtered.length}</Text>{' '}
              รายการที่ตรงกับ &ldquo;{trimmed}&rdquo;
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
            placeholder="ค้นหาอาหาร · ประเภท · ผู้ขาย"
          />
        ) : (
          <TopBar
            title="คลังอาหาร"
            subtitle={isEmpty ? 'ยังไม่มีรายการ' : `${feeds.length} รายการ`}
            leading={
              router.canGoBack() ? (
                <Pressable
                  onPress={() => router.back()}
                  accessibilityRole="button"
                  accessibilityLabel="ย้อนกลับ"
                  style={iconButtonStyle(t.border)}
                >
                  <Icon.back size={18} color={t.ink} />
                </Pressable>
              ) : null
            }
            trailing={
              !isEmpty ? (
                <Pressable
                  onPress={onOpenSearch}
                  accessibilityRole="button"
                  accessibilityLabel="ค้นหาอาหาร"
                  style={iconButtonStyle(t.border)}
                >
                  <Icon.search size={18} color={t.ink} />
                </Pressable>
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
          <Pressable
            onPress={openAdd}
            accessibilityRole="button"
            accessibilityLabel="เพิ่มอาหาร"
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
              เพิ่มอาหาร
            </Text>
          </Pressable>
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
        onClose={closeSheet}
        onSubmit={sheet === 'edit' ? handleEdit : handleCreate}
      />

      <SheetUpdatePrice
        visible={sheet === 'update-price'}
        feed={activeFeed}
        onClose={closeSheet}
        onSubmit={handleUpdatePrice}
      />
    </View>
  );
}

/** 10px vertical gap between feed cards (replaces the old <Col gap={10}>). */
function FeedSeparator() {
  return <View style={{ height: 10 }} />;
}

function SearchEmpty({ query }: { query: string }) {
  const { t } = useTheme();
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
        ไม่พบอาหารที่ตรงกับ &ldquo;{query}&rdquo;
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
        ลองค้นด้วยชื่อยี่ห้อ (เช่น ซีพี, เบทาโกร) หรือประเภท (เม็ด · สด)
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

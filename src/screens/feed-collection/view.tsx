import { Platform, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { SearchHeader, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Col } from '@/components/layout/Row';
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
  const trimmed = query.trim();
  const isEmpty = feeds.length === 0;
  const showSearchEmpty = searchOpen && trimmed.length > 0 && filtered.length === 0;
  const showSuggestions = searchOpen && trimmed.length === 0;
  const showResultCount = searchOpen && trimmed.length > 0 && filtered.length > 0;

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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: isAdmin && !isEmpty ? 132 : 32,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.brand}
            {...(Platform.OS === 'android' ? { colors: [t.brand] } : {})}
          />
        }
      >
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

        {isEmpty ? (
          <FeedEmptyState isAdmin={isAdmin} onAdd={openAdd} />
        ) : showSearchEmpty ? (
          <SearchEmpty query={trimmed} />
        ) : (
          <Col gap={10} style={{ paddingHorizontal: 20, paddingTop: 4 }}>
            {filtered.map((f) => (
              <FeedCard
                key={f.id}
                feed={f}
                isAdmin={isAdmin}
                onMore={() => openActions(f)}
                onChart={() => handleOpenHistory(f)}
              />
            ))}
          </Col>
        )}
      </ScrollView>

      {isAdmin && !isEmpty ? (
        <View
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 24,
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
              gap: 8,
            }}
          >
            <Icon.plus size={20} color="#fff" stroke={2.2} />
            <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 15 }}>
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

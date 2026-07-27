import { Platform, RefreshControl, ScrollView, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { SearchHeader, Tappable, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { MerchantCard } from './components/MerchantCard';
import { MerchantEmptyState } from './components/MerchantEmptyState';
import { SheetMerchantForm } from './components/SheetMerchantForm';
import { SheetMerchantActions } from './components/SheetMerchantActions';
import { PriceSavedToast } from '@/screens/feed-collection/components/PriceSavedToast';
import type { MerchantsScreenState } from './hook';

type Props = MerchantsScreenState & { showHeader?: boolean };

export function MerchantsView({
  merchants,
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
  activeMerchant,
  openActions,
  openAdd,
  openEdit,
  closeSheet,
  saving,
  handleCreate,
  handleEdit,
  requestDelete,
  savedToast,
  dismissSavedToast,
  showHeader = true,
}: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const trimmed = query.trim();
  const isEmpty = merchants.length === 0;
  const showSearchEmpty = searchOpen && trimmed.length > 0 && filtered.length === 0;
  const showResultCount = searchOpen && trimmed.length > 0 && filtered.length > 0;

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={t.brand}
      {...(Platform.OS === 'android' ? { colors: [t.brand] } : {})}
    />
  );

  const listHeader = showResultCount ? (
    <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 6 }}>
      <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
        {tx('merchants.resultsFound')}{' '}
        <Text style={{ fontFamily: type.familyNumBold, color: t.ink }}>{filtered.length}</Text>{' '}
        {tx('merchants.resultsMatching')} &ldquo;{trimmed}&rdquo;
      </Text>
    </View>
  ) : null;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? (
        searchOpen ? (
          <SearchHeader
            value={query}
            onChangeText={onChangeQuery}
            onCancel={onCloseSearch}
            placeholder={tx('merchants.searchPlaceholder')}
          />
        ) : (
          <TopBar
            title={tx('merchants.title')}
            subtitle={
              isEmpty
                ? tx('merchants.countEmpty')
                : tx('merchants.count', { count: merchants.length })
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
                  accessibilityLabel={tx('merchants.searchA11y')}
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
            <MerchantEmptyState isAdmin={isAdmin} onAdd={openAdd} />
          ) : (
            <SearchEmpty query={trimmed} />
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <FlashList
            data={filtered}
            keyExtractor={(m) => String(m.id)}
            renderItem={({ item }) => (
              <MerchantCard merchant={item} isAdmin={isAdmin} onMore={() => openActions(item)} />
            )}
            ItemSeparatorComponent={Separator}
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
            accessibilityLabel={tx('merchants.add')}
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
              {tx('merchants.add')}
            </Text>
          </Tappable>
        </View>
      ) : null}

      <SheetMerchantActions
        visible={sheet === 'actions'}
        merchant={activeMerchant}
        onClose={closeSheet}
        onEdit={openEdit}
        onDelete={requestDelete}
      />

      <SheetMerchantForm
        visible={sheet === 'add' || sheet === 'edit'}
        editing={sheet === 'edit' ? activeMerchant : null}
        saving={saving}
        onClose={closeSheet}
        onSubmit={sheet === 'edit' ? handleEdit : handleCreate}
      />

      {savedToast ? (
        <PriceSavedToast
          key={savedToast.key}
          title={savedToast.title}
          detail={savedToast.detail}
          bottom={Math.max(space[6], insets.bottom + space[2]) + (isAdmin ? 52 + space[3] : 0)}
          onDismiss={dismissSavedToast}
        />
      ) : null}
    </View>
  );
}

function Separator() {
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
        {tx('merchants.searchEmptyTitle')} &ldquo;{query}&rdquo;
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
        {tx('merchants.searchEmptyHelper')}
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

import { Platform, RefreshControl, ScrollView, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { ErrorState, SearchHeader, Tappable, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { WorkerCard } from './components/WorkerCard';
import { SheetWorkerForm } from './components/SheetWorkerForm';
import { SheetWorkerActions } from './components/SheetWorkerActions';
import { SheetResetPassword } from './components/SheetResetPassword';
import type { WorkersScreenState } from './hook';

type Props = WorkersScreenState & { showHeader?: boolean };

function iconButtonStyle(border: string) {
  return {
    width: 36,
    height: 36,
    borderRadius: radii.sm + 2,
    borderWidth: 1,
    borderColor: border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
}

export function WorkersView({
  workers,
  filtered,
  isAdmin,
  isLoading,
  isError,
  myId,
  refreshing,
  onRefresh,
  searchOpen,
  query,
  onOpenSearch,
  onCloseSearch,
  onChangeQuery,
  sheet,
  activeWorker,
  openActions,
  openAdd,
  openEdit,
  openReset,
  closeSheet,
  saving,
  handleCreate,
  handleEdit,
  handleResetPassword,
  requestRemove,
  showHeader = true,
}: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const trimmed = query.trim();
  const isEmpty = !isLoading && workers.length === 0;
  const showSearchEmpty = searchOpen && trimmed.length > 0 && filtered.length === 0;

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={t.brand}
      {...(Platform.OS === 'android' ? { colors: [t.brand] } : {})}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? (
        searchOpen ? (
          <SearchHeader
            value={query}
            onChangeText={onChangeQuery}
            onCancel={onCloseSearch}
            placeholder={tx('workers.searchPlaceholder')}
          />
        ) : (
          <TopBar
            title={tx('workers.title')}
            subtitle={
              isLoading
                ? undefined
                : isEmpty
                  ? tx('workers.countEmpty')
                  : tx('workers.count', { count: workers.length })
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
              !isEmpty && !isLoading ? (
                <Tappable
                  onPress={onOpenSearch}
                  accessibilityRole="button"
                  accessibilityLabel={tx('workers.searchA11y')}
                  style={iconButtonStyle(t.border)}
                >
                  <Icon.search size={18} color={t.ink} />
                </Tappable>
              ) : null
            }
          />
        )
      ) : null}

      {isError ? (
        <ErrorState onRetry={onRefresh} />
      ) : isEmpty || showSearchEmpty ? (
        <ScrollView
          delaysContentTouches={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: space[6], paddingBottom: space[8] }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          <View style={{ paddingHorizontal: space[6], alignItems: 'center', gap: space[3] }}>
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
              <Icon.worker size={28} color={t.inkSoft} />
            </View>
            <Text
              style={{
                fontSize: type.sizes.md,
                fontFamily: type.familyBold,
                color: t.ink,
                textAlign: 'center',
              }}
            >
              {showSearchEmpty ? tx('workers.searchEmptyTitle') : tx('workers.emptyTitle')}
            </Text>
            <Text
              style={{
                fontSize: type.sizes.sm,
                lineHeight: 20,
                color: t.inkMute,
                fontFamily: type.family,
                textAlign: 'center',
              }}
            >
              {showSearchEmpty
                ? tx('workers.searchEmptyBody', { query: trimmed })
                : tx('workers.emptyBody')}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <FlashList
            data={filtered}
            keyExtractor={(w) => String(w.id)}
            renderItem={({ item }) => (
              <WorkerCard
                worker={item}
                isSelf={item.id === myId}
                onPress={() => openActions(item)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: space[2] + 2 }} />}
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

      {isAdmin && !isError ? (
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
            accessibilityLabel={tx('workers.add')}
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
            <Icon.plus size={20} color="#fff" />
            <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 15.5 }}>
              {tx('workers.add')}
            </Text>
          </Tappable>
        </View>
      ) : null}

      <SheetWorkerActions
        visible={sheet === 'actions'}
        worker={activeWorker}
        isSelf={activeWorker?.id === myId}
        onClose={closeSheet}
        onEdit={openEdit}
        onResetPassword={openReset}
        onRemove={requestRemove}
      />
      <SheetWorkerForm
        visible={sheet === 'add' || sheet === 'edit'}
        editing={sheet === 'edit' ? activeWorker : null}
        editingSelf={sheet === 'edit' && activeWorker?.id === myId}
        saving={saving}
        onClose={closeSheet}
        onSubmit={sheet === 'edit' ? handleEdit : handleCreate}
      />
      <SheetResetPassword
        visible={sheet === 'reset'}
        worker={activeWorker}
        saving={saving}
        onClose={closeSheet}
        onSubmit={handleResetPassword}
      />
    </View>
  );
}

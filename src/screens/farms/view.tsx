import { Platform, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { ErrorState, SearchHeader, TopBar, Tappable } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Col, Row } from '@/components/layout/Row';
import { SheetFarmForm } from '@/components/domain/SheetFarmForm';
import { SheetPondsForm } from '@/components/domain/SheetPondsForm';
import { FarmCard } from './components/FarmCard';
import type { FarmsScreenState } from './hook';

type Props = FarmsScreenState & {
  showHeader?: boolean;
  onOpenFarm?: (id: number) => void;
};

export function FarmsView({
  farms,
  filteredFarms,
  isError,
  refreshing,
  onRefresh,
  showHeader = true,
  onOpenFarm,
  searchOpen,
  query,
  onOpenSearch,
  onCloseSearch,
  onChangeQuery,
  canCreate,
  createFarmOpen,
  openCreateFarm,
  closeCreateFarm,
  submitCreateFarm,
  creatingFarm,
  pondsTarget,
  closePonds,
  submitCreatePonds,
  creatingPonds,
}: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const trimmed = query.trim();
  const showEmptyState = searchOpen && trimmed.length > 0 && filteredFarms.length === 0;
  // No farms at all (not a search miss) — the list has nothing to show and the
  // user's only next step is creating one.
  const showNoFarms = !searchOpen && farms.length === 0 && !isError;
  // Error wins over the empty state: an empty list here would claim the client
  // has no farms when we simply couldn't fetch them.
  const showError = !searchOpen && isError && farms.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? (
        searchOpen ? (
          <SearchHeader
            value={query}
            onChangeText={onChangeQuery}
            onCancel={onCloseSearch}
            placeholder={tx('farms.searchPlaceholder')}
          />
        ) : (
          <TopBar
            title={tx('farms.title')}
            subtitle={tx('farms.count', { count: farms.length })}
            trailing={
              <Row gap={8} align="center">
                <Tappable
                  onPress={onOpenSearch}
                  accessibilityRole="button"
                  accessibilityLabel={tx('farms.searchPlaceholder')}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: radii.md,
                    borderWidth: 1,
                    borderColor: t.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon.search size={18} color={t.ink} />
                </Tappable>
                {canCreate ? (
                  <Tappable
                    onPress={openCreateFarm}
                    accessibilityRole="button"
                    accessibilityLabel={tx('farms.createFarm')}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: radii.md,
                      backgroundColor: t.brand,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon.plus size={20} color="#fff" stroke={2.2} />
                  </Tappable>
                ) : null}
              </Row>
            }
          />
        )
      ) : null}
      <ScrollView
        delaysContentTouches={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 96 }}
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
        {showError ? (
          <ErrorState onRetry={onRefresh} />
        ) : showEmptyState ? (
          <SearchEmptyState
            query={trimmed}
            primary={tx('farms.searchEmptyTitle', { query: trimmed })}
            helper={tx('farms.searchEmptyHelper')}
          />
        ) : showNoFarms ? (
          <NoFarmsState canCreate={canCreate} onCreate={openCreateFarm} />
        ) : (
          <Col gap={12} style={{ paddingHorizontal: 20 }}>
            {filteredFarms.map((fm) => (
              <FarmCard key={fm.id} farm={fm} onPress={() => onOpenFarm?.(fm.id)} />
            ))}
          </Col>
        )}
      </ScrollView>

      <SheetFarmForm
        visible={createFarmOpen}
        saving={creatingFarm}
        onClose={closeCreateFarm}
        onSubmit={submitCreateFarm}
      />
      {/* Opened either from a farm card's own "add ponds" path or straight after
          a farm is created (the hook chains them). */}
      <SheetPondsForm
        visible={pondsTarget != null}
        farmName={pondsTarget?.name ?? ''}
        saving={creatingPonds}
        onClose={closePonds}
        onSubmit={submitCreatePonds}
      />
    </View>
  );
}

/** Zero farms — for a new client this is the first screen with anything to do. */
function NoFarmsState({ canCreate, onCreate }: { canCreate: boolean; onCreate: () => void }) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  return (
    <View style={{ alignItems: 'center', paddingTop: 56, paddingHorizontal: 32, gap: 12 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radii.lg,
          backgroundColor: t.brandSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon.farm size={30} color={t.brandInk} />
      </View>
      <Text
        style={{
          fontSize: 17,
          fontFamily: type.familyBold,
          color: t.ink,
          textAlign: 'center',
        }}
      >
        {tx('farms.noFarms.title')}
      </Text>
      <Text
        style={{
          fontSize: 13,
          fontFamily: type.family,
          color: t.inkMute,
          textAlign: 'center',
          lineHeight: 20,
        }}
      >
        {canCreate ? tx('farms.noFarms.adminHelp') : tx('farms.noFarms.workerHelp')}
      </Text>
      {canCreate ? (
        <Tappable
          onPress={onCreate}
          accessibilityRole="button"
          style={{
            marginTop: space[2],
            height: 52,
            paddingHorizontal: space[6],
            borderRadius: radii.md,
            backgroundColor: t.brand,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon.plus size={18} color="#fff" stroke={2.2} />
          <Text style={{ color: '#fff', fontFamily: type.familyBold, fontSize: 15 }}>
            {tx('farms.createFarm')}
          </Text>
        </Tappable>
      ) : null}
    </View>
  );
}

function SearchEmptyState({ primary, helper }: { query: string; primary: string; helper: string }) {
  const { t } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingTop: 64, paddingHorizontal: 32, gap: 12 }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon.search size={24} color={t.inkSoft} />
      </View>
      <Text
        style={{
          fontSize: 15,
          fontFamily: type.familySemi,
          color: t.ink,
          textAlign: 'center',
        }}
      >
        {primary}
      </Text>
      <Text
        style={{
          fontSize: 13,
          fontFamily: type.family,
          color: t.inkMute,
          textAlign: 'center',
        }}
      >
        {helper}
      </Text>
    </View>
  );
}

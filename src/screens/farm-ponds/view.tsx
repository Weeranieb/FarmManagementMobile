import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, space, type } from '@/theme/tokens';
import { SearchHeader, TopBar, Tappable } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Col, Row } from '@/components/layout/Row';
import { SheetPondsForm } from '@/components/domain/SheetPondsForm';
import { displayFarmName } from '@/utils/fmt';
import { PondRowCard } from './components/PondRowCard';
import { FilterTabs } from './components/FilterTabs';
import { SearchSuggestions } from './components/SearchSuggestions';
import type { FarmPondsScreenState, PondFilter } from './hook';

type Props = FarmPondsScreenState & {
  showHeader?: boolean;
  onBack?: () => void;
  onOpenPond: (pondId: number) => void;
};

export function FarmPondsView({
  farmTitle,
  ponds,
  counts,
  filter,
  onChangeFilter,
  filteredPonds,
  showHeader = true,
  onBack,
  onOpenPond,
  searchOpen,
  query,
  onOpenSearch,
  onCloseSearch,
  onChangeQuery,
  canCreate,
  addPondsOpen,
  openAddPonds,
  closeAddPonds,
  submitAddPonds,
  creatingPonds,
}: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const farmLabel = displayFarmName(farmTitle);
  const countLabel = tx('farmPonds.countLabel', {
    active: counts.active,
    maintenance: counts.maintenance,
  });
  const trimmed = query.trim();
  const showEmptyState = searchOpen && trimmed.length > 0 && filteredPonds.length === 0;
  const showSuggestions = searchOpen && trimmed.length === 0;
  const showResultsCount = searchOpen && trimmed.length > 0;
  // The farm itself has no ponds (not just none matching the active filter).
  const showNoPonds = !searchOpen && ponds.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? (
        searchOpen ? (
          <SearchHeader
            value={query}
            onChangeText={onChangeQuery}
            onCancel={onCloseSearch}
            placeholder={tx('farmPonds.searchPlaceholder')}
          />
        ) : (
          <TopBar
            title={farmLabel}
            subtitle={countLabel}
            leading={
              onBack ? (
                <Tappable
                  onPress={onBack}
                  accessibilityRole="button"
                  accessibilityLabel={tx('common.back')}
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
                  <Icon.back size={18} color={t.ink} />
                </Tappable>
              ) : null
            }
            trailing={
              <Row gap={8} align="center">
                <Tappable
                  onPress={onOpenSearch}
                  accessibilityRole="button"
                  accessibilityLabel={tx('farmPonds.searchA11y')}
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
                    onPress={openAddPonds}
                    accessibilityRole="button"
                    accessibilityLabel={tx('pond.addPonds')}
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
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!searchOpen ? (
          <FilterTabs filter={filter} counts={counts} onChange={onChangeFilter} />
        ) : null}

        {showResultsCount ? <ResultsCount n={filteredPonds.length} query={trimmed} /> : null}

        {showSuggestions ? <SearchSuggestions onPick={onChangeQuery} /> : null}

        {showEmptyState ? (
          <SearchEmptyState
            primary={tx('farmPonds.searchEmptyTitle', { query: trimmed })}
            helper={tx('farmPonds.searchEmptyHelper')}
          />
        ) : showNoPonds ? (
          <NoPondsState canCreate={canCreate} onAdd={openAddPonds} />
        ) : (
          <Col gap={10} style={{ paddingHorizontal: 20, paddingTop: showSuggestions ? 6 : 0 }}>
            {filteredPonds.length === 0 && !searchOpen ? (
              <Text style={{ fontSize: 14, color: t.inkMute, fontFamily: type.family }}>
                {tx(emptyFilterLabelKey(filter))}
              </Text>
            ) : (
              filteredPonds.map((p) => (
                <PondRowCard key={p.id} pond={p} onPress={() => onOpenPond(p.id)} />
              ))
            )}
          </Col>
        )}
      </ScrollView>

      <SheetPondsForm
        visible={addPondsOpen}
        farmName={farmLabel}
        saving={creatingPonds}
        onClose={closeAddPonds}
        onSubmit={submitAddPonds}
      />
    </View>
  );
}

/** A farm with zero ponds — the state a just-created farm lands in. */
function NoPondsState({ canCreate, onAdd }: { canCreate: boolean; onAdd: () => void }) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  return (
    <View style={{ alignItems: 'center', paddingTop: 48, paddingHorizontal: 32, gap: 12 }}>
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
        <Icon.fish size={30} color={t.brandInk} />
      </View>
      <Text
        style={{ fontSize: 17, fontFamily: type.familyBold, color: t.ink, textAlign: 'center' }}
      >
        {tx('farmPonds.noPonds.title')}
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
        {canCreate ? tx('farmPonds.noPonds.adminHelp') : tx('farmPonds.noPonds.workerHelp')}
      </Text>
      {canCreate ? (
        <Tappable
          onPress={onAdd}
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
            {tx('pond.addPonds')}
          </Text>
        </Tappable>
      ) : null}
    </View>
  );
}

function emptyFilterLabelKey(filter: PondFilter): string {
  if (filter === 'active') return 'farmPonds.emptyFilter.active';
  if (filter === 'maintenance') return 'farmPonds.emptyFilter.maintenance';
  return 'farmPonds.noPonds.title';
}

function ResultsCount({ n, query }: { n: number; query: string }) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  return (
    <Row gap={4} style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 }}>
      <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
        {tx('farmPonds.resultsFound')}
      </Text>
      <Text style={{ fontSize: 12, color: t.ink, fontFamily: type.familyNumBold }}>{n}</Text>
      <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
        {tx('farmPonds.resultsMatching', { query })}
      </Text>
    </Row>
  );
}

function SearchEmptyState({ primary, helper }: { primary: string; helper: string }) {
  const { t } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingTop: 48, paddingHorizontal: 32, gap: 12 }}>
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
        <Icon.search size={24} color={t.inkMute} />
      </View>
      <Text
        style={{
          fontSize: 15,
          fontFamily: type.familyBold,
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
          lineHeight: 20,
        }}
      >
        {helper}
      </Text>
    </View>
  );
}

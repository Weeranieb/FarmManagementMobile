import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { SearchHeader, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Col, Row } from '@/components/layout/Row';
import type { PondModel } from '@/features/pond';
import { PondRowCard } from './components/PondRowCard';
import { FilterTabs } from './components/FilterTabs';
import { SearchSuggestions } from './components/SearchSuggestions';
import type { PondCounts, PondFilter } from './hook';

type Props = {
  farmTitle: string;
  ponds: PondModel[];
  filteredPonds: PondModel[];
  counts: PondCounts;
  filter: PondFilter;
  onChangeFilter: (f: PondFilter) => void;
  showHeader?: boolean;
  onBack?: () => void;
  onOpenPond: (pondId: number) => void;
  searchOpen: boolean;
  query: string;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onChangeQuery: (s: string) => void;
};

export function FarmPondsView({
  farmTitle,
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
}: Props) {
  const { t } = useTheme();
  const countLabel = `${counts.active} ใช้งาน · ${counts.maintenance} ปิดบ่อ`;
  const trimmed = query.trim();
  const showEmptyState = searchOpen && trimmed.length > 0 && filteredPonds.length === 0;
  const showSuggestions = searchOpen && trimmed.length === 0;
  const showResultsCount = searchOpen && trimmed.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? (
        searchOpen ? (
          <SearchHeader
            value={query}
            onChangeText={onChangeQuery}
            onCancel={onCloseSearch}
            placeholder="ค้นหาบ่อ หรือชนิดปลา"
          />
        ) : (
          <TopBar
            title={`ฟาร์ม ${farmTitle}`}
            subtitle={countLabel}
            leading={
              onBack ? (
                <Pressable
                  onPress={onBack}
                  accessibilityRole="button"
                  accessibilityLabel="ย้อนกลับ"
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
                </Pressable>
              ) : null
            }
            trailing={
              <Pressable
                onPress={onOpenSearch}
                accessibilityRole="button"
                accessibilityLabel="ค้นหาบ่อ"
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
              </Pressable>
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
            primary={`ไม่พบบ่อที่ตรงกับ "${trimmed}"`}
            helper="ลองค้นด้วยชื่อบ่อ (เช่น A2) หรือชนิดปลา (เช่น ปลานิล)"
          />
        ) : (
          <Col gap={10} style={{ paddingHorizontal: 20, paddingTop: showSuggestions ? 6 : 0 }}>
            {filteredPonds.length === 0 && !searchOpen ? (
              <Text style={{ fontSize: 14, color: t.inkMute, fontFamily: type.family }}>
                {emptyFilterLabel(filter)}
              </Text>
            ) : (
              filteredPonds.map((p) => (
                <PondRowCard key={p.id} pond={p} onPress={() => onOpenPond(p.id)} />
              ))
            )}
          </Col>
        )}
      </ScrollView>
    </View>
  );
}

function emptyFilterLabel(filter: PondFilter): string {
  if (filter === 'active') return 'ยังไม่มีบ่อที่ใช้งาน';
  if (filter === 'maintenance') return 'ยังไม่มีบ่อที่ปิดอยู่';
  return 'ยังไม่มีบ่อในฟาร์มนี้';
}

function ResultsCount({ n, query }: { n: number; query: string }) {
  const { t } = useTheme();
  return (
    <Row gap={4} style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 }}>
      <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>พบ</Text>
      <Text style={{ fontSize: 12, color: t.ink, fontFamily: type.familyNumBold }}>{n}</Text>
      <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
        {`รายการที่ตรงกับ "${query}"`}
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

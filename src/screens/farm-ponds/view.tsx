import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { SearchHeader, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Col } from '@/components/layout/Row';
import type { PondModel } from '@/features/pond';
import { PondRowCard } from './components/PondRowCard';

type Props = {
  farmTitle: string;
  ponds: PondModel[];
  filteredPonds: PondModel[];
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
  ponds,
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
  const activeCount = ponds.filter((pond) => pond.status === 'active').length;
  const maintenanceCount = ponds.filter((pond) => pond.status === 'maintenance').length;
  const countLabel = `${activeCount} ใช้งาน · ${maintenanceCount} ปิดบ่อ`;
  const trimmed = query.trim();
  const showEmptyState = searchOpen && trimmed.length > 0 && filteredPonds.length === 0;

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
            title={farmTitle}
            subtitle={countLabel}
            leading={
              onBack ? (
                <Pressable
                  onPress={onBack}
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
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {showEmptyState ? (
          <SearchEmptyState
            primary={`ไม่พบบ่อที่ตรงกับ "${trimmed}"`}
            helper="ลองค้นด้วยชื่อบ่อ (เช่น A2) หรือชนิดปลา (เช่น ปลานิล)"
          />
        ) : (
          <Col gap={12} style={{ paddingHorizontal: 20 }}>
            {filteredPonds.length === 0 ? (
              <Text style={{ fontSize: 14, color: t.inkMute, fontFamily: type.family }}>
                ยังไม่มีบ่อในฟาร์มนี้
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

function SearchEmptyState({ primary, helper }: { primary: string; helper: string }) {
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

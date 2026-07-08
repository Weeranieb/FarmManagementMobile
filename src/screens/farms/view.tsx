import { Platform, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { SearchHeader, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Col } from '@/components/layout/Row';
import { fmt } from '@/utils/fmt';
import type { FarmModel } from '@/features/farm';
import { FarmCard } from './components/FarmCard';

type Props = {
  farms: FarmModel[];
  filteredFarms: FarmModel[];
  refreshing: boolean;
  onRefresh: () => void;
  showHeader?: boolean;
  onOpenFarm?: (id: number) => void;
  searchOpen: boolean;
  query: string;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onChangeQuery: (s: string) => void;
};

export function FarmsView({
  farms,
  filteredFarms,
  refreshing,
  onRefresh,
  showHeader = true,
  onOpenFarm,
  searchOpen,
  query,
  onOpenSearch,
  onCloseSearch,
  onChangeQuery,
}: Props) {
  const { t } = useTheme();
  const trimmed = query.trim();
  const showEmptyState = searchOpen && trimmed.length > 0 && filteredFarms.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? (
        searchOpen ? (
          <SearchHeader
            value={query}
            onChangeText={onChangeQuery}
            onCancel={onCloseSearch}
            placeholder="ค้นหาฟาร์ม"
          />
        ) : (
          <TopBar
            title="ฟาร์มของฉัน"
            subtitle={`${farms.length} ฟาร์ม`}
            trailing={
              <Pressable
                onPress={onOpenSearch}
                accessibilityRole="button"
                accessibilityLabel="ค้นหาฟาร์ม"
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
        {showEmptyState ? (
          <SearchEmptyState
            query={trimmed}
            primary={`ไม่พบฟาร์มที่ตรงกับ "${trimmed}"`}
            helper="ลองค้นด้วยชื่อฟาร์ม"
          />
        ) : (
          <>
            {!searchOpen && farms.length > 0 ? <PortfolioSummary farms={farms} /> : null}
            <Col gap={12} style={{ paddingHorizontal: 20 }}>
              {filteredFarms.map((fm) => (
                <FarmCard key={fm.id} farm={fm} onPress={() => onOpenFarm?.(fm.id)} />
              ))}
            </Col>
          </>
        )}
      </ScrollView>
    </View>
  );
}

/** Whole-operation pulse: total fish in system + pond utilisation. */
function PortfolioSummary({ farms }: { farms: FarmModel[] }) {
  const { t } = useTheme();
  let fish = 0;
  let active = 0;
  let ponds = 0;
  for (const f of farms) {
    fish += f.totalStock;
    active += f.activePonds;
    ponds += f.pondCount;
  }
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingBottom: 18,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}
    >
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text
            style={{
              fontFamily: type.familyNumBold,
              fontSize: type.sizes.xxl,
              color: t.ink,
              lineHeight: 34,
            }}
          >
            {fmt.num(fish)}
          </Text>
          <Text
            style={{
              fontSize: type.sizes.sm,
              fontFamily: type.familyMedium,
              color: t.inkMute,
              marginLeft: 6,
            }}
          >
            ตัว
          </Text>
        </View>
        <Text
          style={{
            fontSize: type.sizes.sm,
            fontFamily: type.family,
            color: t.inkMute,
            marginTop: 2,
          }}
        >
          ปลาในระบบทั้งหมด
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text
            style={{
              fontFamily: type.familyNumSemi,
              fontSize: type.sizes.lg,
              color: active > 0 ? t.statusActive : t.inkMute,
            }}
          >
            {active}
          </Text>
          <Text
            style={{
              fontFamily: type.familyNum,
              fontSize: type.sizes.sm,
              color: t.inkMute,
              marginLeft: 3,
            }}
          >
            / {ponds}
          </Text>
        </View>
        <Text
          style={{
            fontSize: type.sizes.xs,
            fontFamily: type.family,
            color: t.inkMute,
            marginTop: 2,
          }}
        >
          บ่อที่ใช้งาน
        </Text>
      </View>
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

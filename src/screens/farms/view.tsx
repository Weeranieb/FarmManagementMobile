import { Platform, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Col } from '@/components/layout/Row';
import { thaiDate } from '@/locale/thaiDate';
import type { FarmModel } from '@/features/farm';
import { FarmCard } from './components/FarmCard';

type Props = {
  farms: FarmModel[];
  refreshing: boolean;
  onRefresh: () => void;
  showHeader?: boolean;
  onOpenFarm?: (id: number) => void;
};

function farmAddedSubtitle(iso?: string): string | null {
  if (!iso?.trim()) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `เพิ่มเมื่อ ${thaiDate.monthYearShort(d)}`;
}

export function FarmsView({ farms, refreshing, onRefresh, showHeader = true, onOpenFarm }: Props) {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? <TopBar title="ฟาร์มของฉัน" subtitle={`${farms.length} ฟาร์ม`} /> : null}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.brand}
            {...(Platform.OS === 'android' ? { colors: [t.brand] } : {})}
          />
        }
      >
        <View style={{ padding: 20, paddingBottom: 8 }}>
          <View
            style={{
              height: 48,
              borderRadius: radii.md,
              backgroundColor: t.surfaceAlt,
              borderWidth: 1,
              borderColor: t.border,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              gap: 10,
            }}
          >
            <Icon.search size={18} color={t.inkSoft} />
            <Text style={{ color: t.inkMute, fontSize: 14, fontFamily: type.family }}>
              ค้นหาฟาร์ม
            </Text>
          </View>
        </View>

        <Col gap={12} style={{ paddingHorizontal: 20 }}>
          {farms.map((fm) => (
            <FarmCard
              key={fm.id}
              farm={fm}
              subtitle={farmAddedSubtitle(fm.createdAt)}
              onPress={() => onOpenFarm?.(fm.id)}
            />
          ))}
        </Col>
      </ScrollView>
    </View>
  );
}

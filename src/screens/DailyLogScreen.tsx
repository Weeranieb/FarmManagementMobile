import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/tokens';
import { TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { useFarmsData, usePondData } from '@/data';
import type { PondMock } from '@/mock/data';
import { dailyLog } from '@/mock/data';
import { PondDailyLogPanel } from '@/screens/pond-daily-log/PondDailyLogForm';

type Props = {
  pondId?: number;
  onBack?: () => void;
  showHeader?: boolean;
};

export function DailyLogScreen({ pondId = dailyLog.pondId, onBack, showHeader = true }: Props) {
  const { t } = useTheme();
  const { data: farmsRaw } = useFarmsData();
  const farms = Array.isArray(farmsRaw) ? farmsRaw : [];
  const { data: pondRaw } = usePondData(Number.isFinite(pondId) ? pondId : undefined);
  const pond = pondRaw as PondMock | null;
  const farmSubtitle =
    pond?.farmName?.trim() ||
    (pond ? farms.find((f) => f.id === pond.farmId)?.name : undefined) ||
    '';

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? (
        <TopBar
          title={pond?.name ?? 'บันทึกอาหาร'}
          subtitle={farmSubtitle}
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
        />
      ) : null}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        <PondDailyLogPanel pondId={pondId} />
      </ScrollView>
    </View>
  );
}

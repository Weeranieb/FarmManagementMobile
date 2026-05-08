import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/tokens';
import { TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { PondDailyLogPanel } from '@/screens/pond-daily-log';

type Props = {
  pondId: number;
  title: string;
  subtitle: string;
  onBack?: () => void;
  showHeader?: boolean;
};

export function DailyLogView({ pondId, title, subtitle, onBack, showHeader = true }: Props) {
  const { t } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? (
        <TopBar
          title={title}
          subtitle={subtitle}
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

import { Pressable, View, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Icon } from '@/components/icons';
import { CHROME, thMonth } from '../constants';

type Props = {
  selectedDate: Date;
  onPrev: () => void;
  onNext: () => void;
  /** When true, forward month navigation is blocked (e.g. already at current month). */
  nextDisabled?: boolean;
};

export function MonthNavRow({ selectedDate, onPrev, onNext, nextDisabled = false }: Props) {
  const { t } = useTheme();
  const label = `${thMonth(selectedDate.getMonth())} ${selectedDate.getFullYear() + 543}`;

  return (
    <View
      style={{
        height: CHROME.month,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: t.surface,
      }}
    >
      <Pressable
        onPress={onPrev}
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: t.border,
          backgroundColor: t.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        accessibilityRole="button"
        accessibilityLabel="เดือนก่อนหน้า"
      >
        <Icon.chevL size={14} color={t.inkSoft} />
      </Pressable>

      <Pressable
        style={{
          flex: 1,
          height: 32,
          borderRadius: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <Text style={{ fontSize: 13.5, fontFamily: type.familyBold, color: t.ink }}>{label}</Text>
        <Icon.arrowDown size={13} color={t.inkSoft} />
      </Pressable>

      <Pressable
        onPress={onNext}
        disabled={nextDisabled}
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: t.border,
          backgroundColor: t.surface,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: nextDisabled ? 0.4 : 1,
        }}
        accessibilityRole="button"
        accessibilityLabel="เดือนถัดไป"
        accessibilityState={{ disabled: nextDisabled }}
      >
        <Icon.chevR size={14} color={nextDisabled ? t.borderStrong : t.inkSoft} />
      </Pressable>
    </View>
  );
}

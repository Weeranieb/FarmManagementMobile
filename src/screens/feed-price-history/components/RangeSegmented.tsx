import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Tappable } from '@/components/ui';
import { RANGES, type RangeId } from '../historyUtils';

type Props = {
  value: RangeId;
  onChange: (r: RangeId) => void;
};

export function RangeSegmented({ value, onChange }: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        padding: 4,
        borderRadius: 12,
        backgroundColor: t.surfaceAlt,
        borderWidth: 1,
        borderColor: t.border,
      }}
    >
      {RANGES.map((r) => {
        const sel = r.id === value;
        return (
          <Tappable
            key={r.id}
            feedback="opacity"
            accessibilityRole="tab"
            accessibilityState={{ selected: sel }}
            onPress={() => onChange(r.id)}
            style={{
              flex: 1,
              minHeight: 40,
              borderRadius: 9,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: sel ? t.surface : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontFamily: sel ? type.familyBold : type.familyMedium,
                color: sel ? t.ink : t.inkSoft,
              }}
            >
              {tx(r.labelKey)}
            </Text>
          </Tappable>
        );
      })}
    </View>
  );
}

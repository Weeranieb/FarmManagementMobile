import { Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';

type Props = { children: string };

export function SectionLabel({ children }: Props) {
  const { t } = useTheme();
  return (
    <Text
      style={{
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 8,
        fontSize: 12,
        fontFamily: type.familyBold,
        color: t.inkSoft,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Text>
  );
}

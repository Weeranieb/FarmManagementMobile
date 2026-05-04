import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { space, type } from '@/theme/tokens';

export function SectionHeading({ title, count }: { title: string; count?: number }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: space[5],
        paddingTop: space[6] - space[3],
        paddingBottom: space[2],
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
      }}
    >
      <Text
        style={{
          fontSize: type.sizes.xs,
          fontFamily: type.familyBold,
          color: t.inkSoft,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          flexShrink: 1,
        }}
      >
        {title}
      </Text>
      {count != null ? (
        <Text style={{ fontSize: type.sizes.xs, color: t.inkMute, fontFamily: type.familyNum }}>
          {count}
        </Text>
      ) : null}
    </View>
  );
}

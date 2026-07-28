import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { space, type } from '@/theme/tokens';

/**
 * Footer while more history exists. Deliberately not the `EndCap`: that one says
 * "แสดงครบ N รายการ", which is a lie until the last page has arrived.
 *
 * Stays mounted (rather than only rendering during a fetch) so the tail of the
 * list keeps saying "there is more below" between pages, instead of flickering
 * into an end-of-list cap.
 */
export function LoadingMore({ active }: { active: boolean }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        paddingTop: space[5],
        paddingBottom: space[3],
        alignItems: 'center',
        gap: space[2],
      }}
    >
      <ActivityIndicator size="small" color={active ? t.brand : t.inkMute} />
      <Text style={{ fontSize: type.sizes.xs, color: t.inkMute, fontFamily: type.family }}>
        {active ? 'กำลังโหลดเพิ่ม…' : 'เลื่อนลงเพื่อดูเพิ่ม'}
      </Text>
    </View>
  );
}

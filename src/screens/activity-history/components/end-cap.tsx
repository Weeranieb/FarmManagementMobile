import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { space, type } from '@/theme/tokens';

/** End-of-list cap — states the full count and the daily-log exclusion rule
 *  so the absence of feed rows reads as policy, not as missing data. */
export function EndCap({ count }: { count: number }) {
  const { t } = useTheme();
  return (
    <View style={{ paddingTop: space[5] + 2, paddingBottom: space[2], alignItems: 'center' }}>
      <Text style={{ fontSize: type.sizes.xs, color: t.inkMute, fontFamily: type.family }}>
        แสดงครบ <Text style={{ fontFamily: type.familyNumSemi, color: t.inkSoft }}>{count}</Text>{' '}
        รายการ
      </Text>
      <Text
        style={{
          fontSize: type.sizes.xs,
          color: t.inkMute,
          fontFamily: type.family,
          marginTop: 3,
        }}
      >
        การบันทึกประจำวันไม่แสดงในประวัตินี้
      </Text>
    </View>
  );
}

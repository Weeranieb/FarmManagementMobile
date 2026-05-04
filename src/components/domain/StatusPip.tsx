import { Text, View } from 'react-native';
import { Pill } from '@/components/ui';
import { Icon } from '@/components/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { dangerInk, warnInk } from '@/theme/ink';

export type DailyStatus = 'done' | 'late' | 'pending';

export function StatusPip({ kind }: { kind: DailyStatus }) {
  const { t, mode } = useTheme();
  if (kind === 'done') {
    return (
      <Pill tone="success">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon.check size={12} color={t.statusActive} />
          <Text style={{ color: t.statusActive, fontSize: 12, fontFamily: type.familyMedium }}>
            บันทึกแล้ว
          </Text>
        </View>
      </Pill>
    );
  }
  if (kind === 'late') {
    const fg = dangerInk(mode, t);
    return (
      <Pill tone="danger">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon.alert size={12} color={fg} />
          <Text style={{ color: fg, fontSize: 12, fontFamily: type.familyMedium }}>เลยกำหนด</Text>
        </View>
      </Pill>
    );
  }
  const fg = warnInk(mode, t);
  return (
    <Pill tone="warn">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Icon.clock size={12} color={fg} />
        <Text style={{ color: fg, fontSize: 12, fontFamily: type.familyMedium }}>รอบันทึก</Text>
      </View>
    </Pill>
  );
}

export function StatusBadge({ s }: { s: 'active' | 'maintenance' | string }) {
  if (s === 'active') return <Pill tone="success">ใช้งาน</Pill>;
  if (s === 'maintenance') return <Pill tone="maint">ปิดบ่อ</Pill>;
  return <Pill>{s}</Pill>;
}

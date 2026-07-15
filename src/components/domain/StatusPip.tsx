import { Pill } from '@/components/ui';

export function StatusBadge({ s }: { s: 'active' | 'maintenance' | string }) {
  if (s === 'active') return <Pill tone="success">ใช้งาน</Pill>;
  if (s === 'maintenance') return <Pill tone="maint">ปิดบ่อ</Pill>;
  return <Pill>{s}</Pill>;
}

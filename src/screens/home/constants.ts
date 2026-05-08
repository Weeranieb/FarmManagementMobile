import type { AlertItem } from './components/alert-row';
import type { ActivityItem } from './components/activity-row';

export const HOME_SUMMARY = {
  fish: { value: '86,400', unit: 'ตัว', caption: '9 บ่อ' },
  active: { value: '9 / 13', unit: 'บ่อ', caption: 'ปิดบ่อ 4' },
  feed: { value: '฿4,250', unit: '', caption: 'จาก 3 บ่อ' },
  deaths: { value: '8', unit: 'ตัว', caption: 'ใน 2 บ่อ' },
};

export const HOME_TASK = { pending: 6, total: 9, late: 2 };

export const HOME_ALERTS: AlertItem[] = [
  {
    id: 'a1',
    kind: 'danger',
    icon: 'alert',
    title: 'บ่อ A1 — ปลาตายสูงผิดปกติ',
    sub: 'เฉลี่ย 7 ตัว/วัน, สัปดาห์นี้ 23 ตัว',
  },
  {
    id: 'a2',
    kind: 'warn',
    icon: 'clock',
    title: 'บ่อ C5 — ไม่ได้บันทึก 2 วัน',
    sub: 'บันทึกล่าสุด 30 เม.ย. 2569',
  },
  {
    id: 'a3',
    kind: 'success',
    icon: 'check',
    title: 'บ่อ B2 — พร้อมจับ',
    sub: 'อายุ 165 วัน · ปลานิล',
  },
];

export const HOME_ACTIVITY: ActivityItem[] = [
  {
    id: 'e1',
    kind: 'feed',
    when: '09:30',
    pond: 'บ่อ A1',
    text: 'บันทึกอาหาร 22.5 kg',
    by: 'สมชาย',
  },
  {
    id: 'e2',
    kind: 'sell',
    when: 'เมื่อวาน 16:00',
    pond: 'บ่อ B3',
    text: 'ขายปลา ฿45,200',
    by: 'คุณอรรถพล',
    extra: 'ผู้รับ ABC Wholesale',
  },
  {
    id: 'e3',
    kind: 'move',
    when: '2 วันก่อน',
    pond: 'บ่อ C2',
    text: 'ย้ายปลา 5,000 ตัว → บ่อ D1',
    by: 'สมชาย',
  },
  {
    id: 'e4',
    kind: 'fill',
    when: '3 วันก่อน',
    pond: 'บ่อ A4',
    text: 'เติมปลา ปลานิล 4,500 ตัว',
    by: 'คุณอรรถพล',
  },
  {
    id: 'e5',
    kind: 'feed',
    when: '3 วันก่อน',
    pond: 'บ่อ B1',
    text: 'บันทึกอาหาร 18.0 kg',
    by: 'สมชาย',
  },
];

/** 12 px — keeps 8 pt grid */
export const GRID_GAP = 12;

// Filter logs in dev: `npx react-native log-ios | grep \[Home\]`
export const log = (...args: unknown[]) => console.log('[Home]', ...args);

export function joinValue(value: string, unit?: string): string {
  return unit ? `${value} ${unit}` : value;
}

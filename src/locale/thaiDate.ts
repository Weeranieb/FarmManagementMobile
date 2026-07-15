// Thai date helpers using the Buddhist calendar (พ.ศ. = ค.ศ. + 543).
// Ported 1:1 from "Farm OS/primitives.jsx" `window.thaiDate`.

const TH_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];
const TH_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];
const TH_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const TH_DAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

export const thaiDate = {
  long: (d: Date): string =>
    `วัน${TH_DAYS[d.getDay()]}ที่ ${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`,
  monthYear: (d: Date): string => `${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`,
  short: (d: Date): string =>
    `${d.getDate()} ${TH_MONTHS_SHORT[d.getMonth()]} ${(d.getFullYear() + 543) % 100}`,
  weekdayShort: (i: number): string => TH_DAYS_SHORT[i] ?? '',
  ago: (d: Date, now: Date = new Date()): string => {
    const diff = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
    if (diff <= 0) return 'วันนี้';
    if (diff === 1) return 'เมื่อวาน';
    if (diff < 7) return `${diff} วันที่แล้ว`;
    if (diff < 30) return `${Math.floor(diff / 7)} สัปดาห์ที่แล้ว`;
    return thaiDate.short(d);
  },
};

export const TH_WEEKDAYS_SHORT = TH_DAYS_SHORT;
export const TH_MONTH_NAMES_SHORT = TH_MONTHS_SHORT;
/** Full Thai month names (index 0 = January). */
export const TH_MONTH_NAMES_FULL = TH_MONTHS;

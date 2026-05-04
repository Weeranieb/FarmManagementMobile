// Ported from "Farm OS/mock-data.js". Used by screens until the real API
// is wired up.

export type FarmMock = {
  id: number;
  name: string;
  clientId: number;
  status: 'active' | 'maintenance';
  pondCount: number;
  activePonds: number;
  totalStock: number;
};

export type PondMock = {
  id: number;
  farmId: number;
  farmName: string;
  name: string;
  status: 'active' | 'maintenance';
  totalFish: number;
  fishTypes: string[];
  ageDays: number | null;
  startDate: string | null;
  latestActivityType: 'fill' | 'move' | 'sell';
  latestActivityDate: string;
  loggedToday: boolean;
  lateDays: number;
};

export type ActivityMock = {
  id: number;
  mode: 'fill' | 'move' | 'sell';
  date: string;
  amount: number;
  fishType: string;
  pricePerUnit?: number;
  total: number;
  remark?: string;
  merchant?: string;
};

export const today = new Date(2026, 4, 2);

export const farms: FarmMock[] = [
  {
    id: 1,
    name: 'ฟาร์ม FarmOS 1',
    clientId: 1,
    status: 'active',
    pondCount: 8,
    activePonds: 6,
    totalStock: 42500,
  },
  {
    id: 2,
    name: 'ฟาร์มบางพลี',
    clientId: 1,
    status: 'active',
    pondCount: 4,
    activePonds: 3,
    totalStock: 18200,
  },
];

export const ponds: PondMock[] = [
  {
    id: 11,
    farmId: 1,
    farmName: 'ฟาร์ม FarmOS 1',
    name: 'บ่อ A1',
    status: 'active',
    totalFish: 5200,
    fishTypes: ['nil'],
    ageDays: 120,
    startDate: '2026-01-02',
    latestActivityType: 'fill',
    latestActivityDate: '2026-01-02',
    loggedToday: false,
    lateDays: 0,
  },
  {
    id: 12,
    farmId: 1,
    farmName: 'ฟาร์ม FarmOS 1',
    name: 'บ่อ A2',
    status: 'active',
    totalFish: 8400,
    fishTypes: ['nil', 'duk'],
    ageDays: 88,
    startDate: '2026-02-03',
    latestActivityType: 'fill',
    latestActivityDate: '2026-02-03',
    loggedToday: true,
    lateDays: 0,
  },
  {
    id: 13,
    farmId: 1,
    farmName: 'ฟาร์ม FarmOS 1',
    name: 'บ่อ A3',
    status: 'active',
    totalFish: 3100,
    fishTypes: ['kaphong'],
    ageDays: 65,
    startDate: '2026-02-26',
    latestActivityType: 'move',
    latestActivityDate: '2026-04-15',
    loggedToday: false,
    lateDays: 0,
  },
  {
    id: 14,
    farmId: 1,
    farmName: 'ฟาร์ม FarmOS 1',
    name: 'บ่อ B1',
    status: 'active',
    totalFish: 12300,
    fishTypes: ['kang'],
    ageDays: 210,
    startDate: '2025-10-04',
    latestActivityType: 'fill',
    latestActivityDate: '2025-10-04',
    loggedToday: false,
    lateDays: 2,
  },
  {
    id: 15,
    farmId: 1,
    farmName: 'ฟาร์ม FarmOS 1',
    name: 'บ่อ B2',
    status: 'active',
    totalFish: 6700,
    fishTypes: ['nil'],
    ageDays: 145,
    startDate: '2025-12-08',
    latestActivityType: 'move',
    latestActivityDate: '2026-03-20',
    loggedToday: false,
    lateDays: 0,
  },
  {
    id: 16,
    farmId: 1,
    farmName: 'ฟาร์ม FarmOS 1',
    name: 'บ่อ B3',
    status: 'active',
    totalFish: 6800,
    fishTypes: ['kaphong', 'nil'],
    ageDays: 90,
    startDate: '2026-02-01',
    latestActivityType: 'fill',
    latestActivityDate: '2026-02-01',
    loggedToday: true,
    lateDays: 0,
  },
  {
    id: 17,
    farmId: 1,
    farmName: 'ฟาร์ม FarmOS 1',
    name: 'บ่อ C1',
    status: 'maintenance',
    totalFish: 0,
    fishTypes: [],
    ageDays: null,
    startDate: null,
    latestActivityType: 'sell',
    latestActivityDate: '2026-04-22',
    loggedToday: false,
    lateDays: 0,
  },
  {
    id: 18,
    farmId: 1,
    farmName: 'ฟาร์ม FarmOS 1',
    name: 'บ่อ C2',
    status: 'maintenance',
    totalFish: 0,
    fishTypes: [],
    ageDays: null,
    startDate: null,
    latestActivityType: 'sell',
    latestActivityDate: '2026-04-30',
    loggedToday: false,
    lateDays: 0,
  },
  {
    id: 21,
    farmId: 2,
    farmName: 'ฟาร์มบางพลี',
    name: 'บ่อ 1',
    status: 'active',
    totalFish: 7200,
    fishTypes: ['nil'],
    ageDays: 75,
    startDate: '2026-02-16',
    latestActivityType: 'fill',
    latestActivityDate: '2026-02-16',
    loggedToday: false,
    lateDays: 0,
  },
  {
    id: 22,
    farmId: 2,
    farmName: 'ฟาร์มบางพลี',
    name: 'บ่อ 2',
    status: 'active',
    totalFish: 5500,
    fishTypes: ['duk'],
    ageDays: 100,
    startDate: '2026-01-22',
    latestActivityType: 'fill',
    latestActivityDate: '2026-01-22',
    loggedToday: true,
    lateDays: 0,
  },
  {
    id: 23,
    farmId: 2,
    farmName: 'ฟาร์มบางพลี',
    name: 'บ่อ 3',
    status: 'active',
    totalFish: 5500,
    fishTypes: ['nil', 'kaphong'],
    ageDays: 50,
    startDate: '2026-03-13',
    latestActivityType: 'move',
    latestActivityDate: '2026-04-12',
    loggedToday: false,
    lateDays: 1,
  },
  {
    id: 24,
    farmId: 2,
    farmName: 'ฟาร์มบางพลี',
    name: 'บ่อ 4',
    status: 'maintenance',
    totalFish: 0,
    fishTypes: [],
    ageDays: null,
    startDate: null,
    latestActivityType: 'sell',
    latestActivityDate: '2026-04-18',
    loggedToday: false,
    lateDays: 0,
  },
];

export const merchants = [
  { id: 1, name: 'ร้านสมชาย ตลาดไท', contactNumber: '081-234-5678', location: 'ปทุมธานี' },
  { id: 2, name: 'ร้านลุงพร', contactNumber: '089-555-7890', location: 'นนทบุรี' },
  { id: 3, name: 'ตลาดสี่มุมเมือง', contactNumber: '02-987-6543', location: 'ปทุมธานี' },
];

export const feedCollections = [
  { id: 1, name: 'ปลาเป็ด สด', feedType: 'fresh', unit: 'kg', latestPrice: 12 },
  { id: 2, name: 'ไส้ไก่บด', feedType: 'fresh', unit: 'kg', latestPrice: 18 },
  { id: 3, name: 'อาหารเม็ด ซีพี 9950', feedType: 'pellet', unit: 'kg', latestPrice: 32 },
  { id: 4, name: 'อาหารเม็ด เบทาโกร', feedType: 'pellet', unit: 'kg', latestPrice: 30 },
];

export const sizeGrades = [
  { id: 1, name: 'ตัวใหญ่ 800g+' },
  { id: 2, name: 'ตัวกลาง 500-800g' },
  { id: 3, name: 'ตัวเล็ก 300-500g' },
  { id: 4, name: 'จ้ำม่ำ <300g' },
];

export const activitiesByPond: Record<number, ActivityMock[]> = {
  11: [
    {
      id: 101,
      mode: 'fill',
      date: '2026-01-02',
      amount: 5500,
      fishType: 'nil',
      pricePerUnit: 8,
      total: 44000,
      remark: 'เริ่มรอบใหม่',
    },
    {
      id: 102,
      mode: 'move',
      date: '2026-03-12',
      amount: 300,
      fishType: 'nil',
      pricePerUnit: 0,
      total: 0,
      remark: 'ย้ายไป A2',
    },
  ],
  14: [
    {
      id: 201,
      mode: 'fill',
      date: '2025-10-04',
      amount: 13000,
      fishType: 'kang',
      pricePerUnit: 15,
      total: 195000,
    },
    {
      id: 202,
      mode: 'sell',
      date: '2026-02-18',
      amount: 600,
      fishType: 'kang',
      total: 42000,
      merchant: 'ร้านสมชาย',
    },
    {
      id: 203,
      mode: 'sell',
      date: '2026-04-02',
      amount: 100,
      fishType: 'kang',
      total: 7800,
      merchant: 'ร้านสมชาย',
    },
  ],
  17: [
    {
      id: 301,
      mode: 'fill',
      date: '2025-08-10',
      amount: 8000,
      fishType: 'nil',
      pricePerUnit: 7,
      total: 56000,
    },
    {
      id: 302,
      mode: 'sell',
      date: '2026-04-22',
      amount: 7800,
      fishType: 'nil',
      total: 312000,
      merchant: 'ร้านลุงพร',
    },
  ],
};

export const dailyLog = {
  pondId: 11,
  month: '2026-05',
  freshFeedCollectionId: 1,
  freshFeedCollectionName: 'ปลาเป็ด สด',
  pelletFeedCollectionId: 3,
  pelletFeedCollectionName: 'อาหารเม็ด ซีพี 9950',
  entries: [
    {
      day: 1,
      freshMorning: 8,
      freshEvening: 9,
      pelletMorning: 5,
      pelletEvening: 5,
      deathFishCount: 2,
      touristCatchCount: 0,
    },
  ],
};

export const user = { id: 1, name: 'อรรถพล แสงทอง', role: 'owner', defaultFarmId: 1 };

import type { FarmModel } from '../adapters';

export const mockFarms: FarmModel[] = [
  {
    id: 1,
    name: 'ฟาร์ม FarmOS 1',
    clientId: 1,
    status: 'active',
    pondCount: 8,
    activePonds: 6,
    totalStock: 42500,
    createdAt: '2022-01-09T06:30:00.000Z',
  },
  {
    id: 2,
    name: 'ฟาร์มบางพลี',
    clientId: 1,
    status: 'active',
    pondCount: 4,
    activePonds: 3,
    totalStock: 18200,
    createdAt: '2022-01-16T08:00:00.000Z',
  },
];

import type { FeedCollectionModel } from '../adapters';

/** Mock feed catalogue — content mirrors "Farm OS/screens-feed.jsx" FEED_LIST. */
export const mockFeedCollections: FeedCollectionModel[] = [
  {
    id: 3,
    name: 'อาหารเม็ด ซีพี 9950',
    kind: 'pellet',
    unit: 'กก.',
    price: 32,
    fcr: 1.4,
    updatedAt: '2026-05-12',
  },
  {
    id: 4,
    name: 'อาหารเม็ด เบทาโกร',
    kind: 'pellet',
    unit: 'กก.',
    price: 30,
    fcr: 1.5,
    updatedAt: '2026-05-08',
  },
  {
    id: 5,
    name: 'อาหารเม็ด แหลมทอง โปร 30',
    kind: 'pellet',
    unit: 'กก.',
    price: 28,
    fcr: 1.6,
    updatedAt: '2026-04-28',
  },
  {
    id: 1,
    name: 'ปลาเป็ดสด',
    kind: 'fresh',
    unit: 'กก.',
    price: 12,
    fcr: null,
    updatedAt: '2026-05-14',
  },
  {
    id: 2,
    name: 'ไส้ไก่บด',
    kind: 'fresh',
    unit: 'กก.',
    price: 18,
    fcr: null,
    updatedAt: '2026-05-10',
  },
  {
    id: 6,
    name: 'อาหารเม็ด อินเทคฟีด เกรด A',
    kind: 'pellet',
    unit: 'กก.',
    price: 34,
    fcr: 1.35,
    updatedAt: '2026-05-15',
  },
];

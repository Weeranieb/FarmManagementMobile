import type { DailyLogResponse } from '../types';

export const mockDailyLog: DailyLogResponse = {
  pondId: 11,
  month: '2026-05',
  freshFeedCollectionId: 1,
  freshFeedCollectionName: 'ปลาเป็ด สด',
  pelletFeedCollectionId: 3,
  pelletFeedCollectionName: 'อาหารเม็ด ซีพี 9950',
  entries: [
    {
      day: 1,
      fresh: 17,
      pelletMorning: 5,
      pelletEvening: 5,
      deathFishCount: 2,
      touristCatchCount: 0,
    },
  ],
};

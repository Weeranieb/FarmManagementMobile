import { adaptFarm } from './adapters';
import type { FarmResponse } from './types';

function farmResponse(over: Partial<FarmResponse> = {}): FarmResponse {
  return { id: 1, name: 'ฟาร์ม 1', clientId: 3, status: 'active', ...over } as FarmResponse;
}

describe('adaptFarm', () => {
  it('defaults the pond counters to 0 rather than undefined', () => {
    // The cards render these directly; undefined would print as blank.
    const f = adaptFarm(farmResponse());
    expect(f.pondCount).toBe(0);
    expect(f.activePonds).toBe(0);
  });

  it('keeps real counts', () => {
    const f = adaptFarm(farmResponse({ pondCount: 19, activePonds: 4 }));
    expect(f.pondCount).toBe(19);
    expect(f.activePonds).toBe(4);
  });

  it('treats any status that is not maintenance as active', () => {
    expect(adaptFarm(farmResponse({ status: 'maintenance' })).status).toBe('maintenance');
    expect(adaptFarm(farmResponse({ status: 'active' })).status).toBe('active');
    expect(adaptFarm(farmResponse({ status: 'archived' as never })).status).toBe('active');
  });
});

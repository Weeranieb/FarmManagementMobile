import { adaptMerchant } from './adapters';
import type { MerchantResponse } from './types';

function merchantResponse(over: Partial<MerchantResponse> = {}): MerchantResponse {
  return { id: 1, name: 'ร้านลุงพร', ...over } as MerchantResponse;
}

describe('adaptMerchant', () => {
  it('turns absent optional fields into empty strings the UI can render', () => {
    const m = adaptMerchant(merchantResponse());
    expect(m.contactNumber).toBe('');
    expect(m.location).toBe('');
  });

  it('falls back to createdAt when the row has never been updated', () => {
    // The manage screen sorts and labels by updatedAt; without the fallback a
    // never-edited merchant would sort as if it had no date at all.
    expect(adaptMerchant(merchantResponse({ createdAt: '2026-05-01T00:00:00Z' })).updatedAt).toBe(
      '2026-05-01T00:00:00Z',
    );
    expect(
      adaptMerchant(
        merchantResponse({ createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-06-02T00:00:00Z' }),
      ).updatedAt,
    ).toBe('2026-06-02T00:00:00Z');
  });

  it('ends up with an empty string when neither date exists', () => {
    expect(adaptMerchant(merchantResponse()).updatedAt).toBe('');
  });
});

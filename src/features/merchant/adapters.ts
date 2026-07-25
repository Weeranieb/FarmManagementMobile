import type { MerchantModel, MerchantResponse } from './types';

export function adaptMerchant(m: MerchantResponse): MerchantModel {
  return {
    id: m.id,
    name: m.name,
    contactNumber: m.contactNumber ?? '',
    location: m.location ?? '',
    updatedAt: m.updatedAt ?? m.createdAt ?? '',
  };
}

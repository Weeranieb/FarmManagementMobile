import i18n from '@/locale/i18n';

// Merchant form validation — shared by the management add/edit sheet and the
// sell-flow inline "add merchant" sheet so both enforce the same rules.

export const MERCHANT_LIMITS = {
  name: 120,
  contact: 10,
  location: 160,
} as const;

export type MerchantFormValues = {
  name: string;
  contactNumber: string;
  location: string;
};

export type MerchantFormErrors = {
  name: string | null;
  contactNumber: string | null;
  location: string | null;
};

/**
 * Name is required; contact is optional but, when filled, must be digits only
 * and 9–10 long (Thai landline 9 / mobile 10). The input already strips
 * non-digits and caps length, so this mostly guards the too-short case and
 * paste edge-cases. Location is optional free text, length-capped.
 */
export function validateMerchantForm(values: MerchantFormValues): MerchantFormErrors {
  const name = values.name.trim();
  const contact = values.contactNumber.trim();
  const location = values.location.trim();

  let nameError: string | null = null;
  if (name === '') nameError = i18n.t('merchants.validation.nameRequired');
  else if (name.length > MERCHANT_LIMITS.name)
    nameError = i18n.t('merchants.validation.nameTooLong', { max: MERCHANT_LIMITS.name });

  let contactError: string | null = null;
  if (contact !== '') {
    if (!/^\d+$/.test(contact)) contactError = i18n.t('merchants.validation.contactDigits');
    else if (contact.length < 9 || contact.length > MERCHANT_LIMITS.contact)
      contactError = i18n.t('merchants.validation.contactLen', { max: MERCHANT_LIMITS.contact });
  }

  let locationError: string | null = null;
  if (location.length > MERCHANT_LIMITS.location)
    locationError = i18n.t('merchants.validation.locationTooLong', {
      max: MERCHANT_LIMITS.location,
    });

  return { name: nameError, contactNumber: contactError, location: locationError };
}

export function hasMerchantFormErrors(errors: MerchantFormErrors): boolean {
  return Boolean(errors.name || errors.contactNumber || errors.location);
}

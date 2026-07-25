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
  if (name === '') nameError = 'กรุณากรอกชื่อผู้ขาย';
  else if (name.length > MERCHANT_LIMITS.name) nameError = `ชื่อยาวเกินไป (ไม่เกิน ${MERCHANT_LIMITS.name} ตัวอักษร)`;

  let contactError: string | null = null;
  if (contact !== '') {
    if (!/^\d+$/.test(contact)) contactError = 'เบอร์ติดต่อต้องเป็นตัวเลขเท่านั้น';
    else if (contact.length < 9 || contact.length > MERCHANT_LIMITS.contact)
      contactError = `เบอร์ติดต่อต้องมี 9–${MERCHANT_LIMITS.contact} หลัก`;
  }

  let locationError: string | null = null;
  if (location.length > MERCHANT_LIMITS.location)
    locationError = `ที่อยู่ยาวเกินไป (ไม่เกิน ${MERCHANT_LIMITS.location} ตัวอักษร)`;

  return { name: nameError, contactNumber: contactError, location: locationError };
}

export function hasMerchantFormErrors(errors: MerchantFormErrors): boolean {
  return Boolean(errors.name || errors.contactNumber || errors.location);
}

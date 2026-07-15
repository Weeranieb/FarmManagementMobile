import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { changeMyPassword, getMe, updateMe, useAuthStore } from '@/features/auth';
import type { UserResponse } from '@/features/auth';
import { apiErrorMessage } from '@/shared/http';
import { WRONG_CURRENT_PASSWORD } from './components/ChangePasswordSheet';

const WRONG_CURRENT_PASSWORD_CODE = '500021';

type FormState = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  contactNumber: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_RE = /\d/g;

const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  contactNumber: '',
};

function toForm(user: UserResponse | null): FormState {
  if (!user) return EMPTY_FORM;
  return {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    username: user.username ?? '',
    email: user.email ?? '',
    contactNumber: user.contactNumber ?? '',
  };
}

export function useAccountInfoForm() {
  const router = useRouter();
  const { t: tx } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const updateUser = useAuthStore((s) => s.updateUser);

  const initial = useMemo(() => toForm(user), [user]);
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [showPasswordSheet, setShowPasswordSheet] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Refresh user from backend on mount so fields like email reflect the
  // server source-of-truth (SecureStore can hold a stale snapshot from a
  // pre-email login).
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void (async () => {
      try {
        const fresh = await getMe();
        if (cancelled) return;
        await updateUser(fresh);
      } catch {
        // non-fatal: keep showing whatever's in the store
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, updateUser]);

  // Re-seed the form whenever the underlying user changes (e.g. after the
  // mount refresh above). Skip while saving so we don't clobber edits.
  useEffect(() => {
    if (saving) return;
    setForm(initial);
  }, [initial, saving]);

  const dirty = useMemo(
    () => (Object.keys(form) as (keyof FormState)[]).some((k) => form[k] !== initial[k]),
    [form, initial],
  );

  const errors = useMemo<Errors>(() => {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = tx('profile.account.error.firstName');
    if (!form.username.trim()) e.username = tx('profile.account.error.username');
    if (form.email && !EMAIL_RE.test(form.email)) e.email = tx('profile.account.error.email');
    if (form.contactNumber) {
      const digits = form.contactNumber.match(PHONE_DIGITS_RE) ?? [];
      if (digits.length !== 10) e.contactNumber = tx('profile.account.error.contact');
    }
    return e;
  }, [form, tx]);

  const valid = Object.keys(errors).length === 0;
  const canSave = dirty && valid && !saving;

  const setField = useCallback(
    (key: keyof FormState) => (value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const body = {
        username: form.username.trim(),
        email: form.email.trim() || null,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || null,
        contactNumber: form.contactNumber.trim(),
      };
      const updated = await updateMe(body);
      await updateUser(updated);
      Alert.alert(tx('profile.account.toast.saved'));
      router.back();
    } catch (err) {
      Alert.alert(
        tx('profile.account.toast.error'),
        apiErrorMessage(err, tx('profile.account.toast.error')),
      );
    } finally {
      setSaving(false);
    }
  }, [canSave, form, router, tx, updateUser]);

  const handleBack = useCallback(() => {
    if (dirty) {
      setShowDiscardDialog(true);
      return;
    }
    router.back();
  }, [dirty, router]);

  const handleConfirmDiscard = useCallback(() => {
    setShowDiscardDialog(false);
    router.back();
  }, [router]);

  const handleSubmitPassword = useCallback(
    async (current: string, next: string) => {
      try {
        await changeMyPassword(current, next);
        Alert.alert(tx('profile.password.saved'));
      } catch (err) {
        const code =
          err && typeof err === 'object' && 'code' in err
            ? String((err as { code: unknown }).code)
            : '';
        if (code === WRONG_CURRENT_PASSWORD_CODE) {
          // Re-throw with a stable code the sheet maps to inline field error.
          throw Object.assign(new Error('wrong-current-password'), {
            code: WRONG_CURRENT_PASSWORD,
          });
        }
        const message = apiErrorMessage(err, tx('profile.account.toast.error'));
        Alert.alert(tx('profile.password.title'), message);
        throw err;
      }
    },
    [tx],
  );

  return {
    form,
    errors,
    saving,
    dirty,
    canSave,
    setField,
    handleSave,
    handleBack,
    showPasswordSheet,
    openPasswordSheet: () => setShowPasswordSheet(true),
    closePasswordSheet: () => setShowPasswordSheet(false),
    handleSubmitPassword,
    showDiscardDialog,
    handleCancelDiscard: () => setShowDiscardDialog(false),
    handleConfirmDiscard,
  };
}

import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import {
  usePondData,
  useSellPond,
  type MerchantOption,
  type PondModel,
  type SizeGradeOption,
} from '@/features/pond';
import { useAuthStore } from '@/features/auth';

/** TODO: replace with merchant list API when available on mobile. */
const MERCHANTS: MerchantOption[] = [];
/** TODO: replace with size-grade list API when available on mobile. */
const SIZE_GRADES: SizeGradeOption[] = [];

export function useSellFlow(pondId: number, onClose?: () => void) {
  const { data: pond } = usePondData(pondId);
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [merchantId, setMerchantId] = useState<number>(MERCHANTS[0]?.id ?? -1);
  const [gradeId, setGradeId] = useState<number>(SIZE_GRADES[0]?.id ?? -1);

  const total = useMemo(() => {
    const a = parseFloat(amount) || 0;
    const p = parseFloat(pricePerKg) || 0;
    return Math.round(a * p);
  }, [amount, pricePerKg]);
  const merchant = MERCHANTS.find((m) => m.id === merchantId);
  const grade = SIZE_GRADES.find((g) => g.id === gradeId);
  const sellMutation = useSellPond(pondId);
  const isAuthed = useAuthStore((s) => s.token != null);

  const handleConfirm = async () => {
    if (!isAuthed) {
      onClose?.();
      return;
    }
    try {
      await sellMutation.mutateAsync({
        amount: parseFloat(amount || '0'),
        pricePerKg: parseFloat(pricePerKg || '0'),
        merchantId,
        sizeGradeId: gradeId,
      });
      onClose?.();
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'บันทึกไม่สำเร็จ';
      Alert.alert('ขายปลาไม่สำเร็จ', msg);
    }
  };

  const goBack = () => {
    if (step === 1) onClose?.();
    else setStep(1);
  };

  return {
    pond: pond as PondModel | undefined,
    merchants: MERCHANTS,
    sizeGrades: SIZE_GRADES,
    step,
    setStep,
    amount,
    setAmount,
    pricePerKg,
    setPricePerKg,
    merchantId,
    setMerchantId,
    gradeId,
    setGradeId,
    merchant,
    grade,
    total,
    handleConfirm,
    isPending: sellMutation.isPending,
    goBack,
  };
}

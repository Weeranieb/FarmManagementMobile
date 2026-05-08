import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import {
  mockMerchants,
  mockPonds,
  mockSizeGrades,
  useSellPond,
  type PondModel,
} from '@/features/pond';
import { useAuthStore } from '@/features/auth';

export function useSellFlow(pondId: number, onClose?: () => void) {
  const pond = mockPonds.find((p) => p.id === pondId) ?? mockPonds[0];
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [merchantId, setMerchantId] = useState<number>(mockMerchants[0]?.id ?? -1);
  const [gradeId, setGradeId] = useState<number>(mockSizeGrades[0]?.id ?? -1);

  const total = useMemo(() => {
    const a = parseFloat(amount) || 0;
    const p = parseFloat(pricePerKg) || 0;
    return Math.round(a * p);
  }, [amount, pricePerKg]);
  const merchant = mockMerchants.find((m) => m.id === merchantId);
  const grade = mockSizeGrades.find((g) => g.id === gradeId);
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

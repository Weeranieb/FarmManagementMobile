import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { mockPonds, useFillPond, type PondModel } from '@/features/pond';
import { useAuthStore } from '@/features/auth';

export function useFillFlow(pondId: number, onClose?: () => void) {
  const pond = mockPonds.find((p) => p.id === pondId) ?? mockPonds[0];
  const [step, setStep] = useState<1 | 2>(1);
  const [fishType, setFishType] = useState<string>(pond?.fishTypes[0] ?? 'nil');
  const [amount, setAmount] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [remark, setRemark] = useState('');
  const fillMutation = useFillPond(pondId);
  const isAuthed = useAuthStore((s) => s.token != null);

  const handleConfirm = async () => {
    if (!isAuthed) {
      onClose?.();
      return;
    }
    try {
      await fillMutation.mutateAsync({
        fishType,
        amount: parseInt(amount || '0', 10),
        pricePerUnit: parseFloat(pricePerUnit || '0'),
        remark: remark || undefined,
      });
      onClose?.();
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'บันทึกไม่สำเร็จ';
      Alert.alert('บันทึกไม่สำเร็จ', msg);
    }
  };

  const total = useMemo(() => {
    const a = parseFloat(amount) || 0;
    const p = parseFloat(pricePerUnit) || 0;
    return Math.round(a * p);
  }, [amount, pricePerUnit]);

  const goBack = () => {
    if (step === 1) onClose?.();
    else setStep(1);
  };

  return {
    pond: pond as PondModel | undefined,
    step,
    setStep,
    fishType,
    setFishType,
    amount,
    setAmount,
    pricePerUnit,
    setPricePerUnit,
    remark,
    setRemark,
    total,
    handleConfirm,
    isPending: fillMutation.isPending,
    goBack,
  };
}

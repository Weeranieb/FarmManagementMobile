import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { mockPonds, useMovePond, type PondModel } from '@/features/pond';
import { useAuthStore } from '@/features/auth';

export function useMoveFlow(pondId: number, onClose?: () => void) {
  const fromPond = mockPonds.find((p) => p.id === pondId) ?? mockPonds[0];
  const candidates = mockPonds.filter((p) => p.id !== pondId && p.status === 'active');
  const [toId, setToId] = useState<number>(candidates[0]?.id ?? -1);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const toPond = candidates.find((p) => p.id === toId);
  const moveMutation = useMovePond(pondId);
  const isAuthed = useAuthStore((s) => s.token != null);

  const handleConfirm = async () => {
    if (!isAuthed || !toPond) {
      onClose?.();
      return;
    }
    try {
      await moveMutation.mutateAsync({
        toPondId: toPond.id,
        amount: parseInt(amount || '0', 10),
      });
      onClose?.();
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'บันทึกไม่สำเร็จ';
      Alert.alert('ย้ายปลาไม่สำเร็จ', msg);
    }
  };

  const after = useMemo(() => {
    const a = parseInt(amount || '0', 10);
    return {
      from: Math.max(0, (fromPond?.totalFish ?? 0) - a),
      to: (toPond?.totalFish ?? 0) + a,
    };
  }, [amount, fromPond, toPond]);

  const goBack = () => {
    if (step === 1) onClose?.();
    else setStep(1);
  };

  return {
    fromPond: fromPond as PondModel | undefined,
    toPond,
    candidates,
    toId,
    setToId,
    amount,
    setAmount,
    step,
    setStep,
    after,
    handleConfirm,
    isPending: moveMutation.isPending,
    goBack,
  };
}

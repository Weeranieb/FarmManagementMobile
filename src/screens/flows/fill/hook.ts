import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { mockPonds, useFillPond, type PondModel } from '@/features/pond';
import { useAuthStore } from '@/features/auth';
import { today } from '@/shared/time';

export function useFillFlow(pondId: number, onClose?: () => void) {
  const pond = mockPonds.find((p) => p.id === pondId) ?? mockPonds[0];
  const isStartCycle = pond?.status === 'maintenance';
  const [step, setStep] = useState<1 | 2>(1);
  const [fishType, setFishType] = useState<string>(pond?.fishTypes[0] ?? 'nil');
  const [amount, setAmount] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [avgWeightKg, setAvgWeightKg] = useState('');
  const [extraCost, setExtraCost] = useState('');
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

  const amountNum = parseInt(amount || '0', 10);
  const priceNum = parseFloat(pricePerUnit || '0');
  const weightNum = parseFloat(avgWeightKg || '0');
  const extraNum = parseFloat(extraCost || '0');

  const fishCost = useMemo(() => Math.round(amountNum * priceNum), [amountNum, priceNum]);
  const grandTotal = useMemo(() => fishCost + Math.round(extraNum), [fishCost, extraNum]);
  const totalWeightKg = useMemo(() => amountNum * weightNum, [amountNum, weightNum]);

  const stockBefore = pond?.totalFish ?? 0;
  const delta = amountNum;
  const stockAfter = stockBefore + delta;

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
    avgWeightKg,
    setAvgWeightKg,
    extraCost,
    setExtraCost,
    remark,
    setRemark,
    fishCost,
    extraTotal: Math.round(extraNum),
    grandTotal,
    totalWeightKg,
    stockBefore,
    stockAfter,
    delta,
    isStartCycle,
    date: today,
    handleConfirm,
    isPending: fillMutation.isPending,
    goBack,
  };
}

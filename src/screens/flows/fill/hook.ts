import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useFarmsData } from '@/features/farm';
import {
  useFillPond,
  usePondData,
  usePondsData,
  type AdditionalCostItem,
} from '@/features/pond';
import { useAuthStore } from '@/features/auth';
import { toIsoDate } from '@/shared/time';
import {
  additionalCostsTotal,
  type CostRow,
} from '../additional-costs';

/** Map UI rows to the wire-format `AdditionalCostItem[]`. Empty rows are
 *  dropped; partial rows (title but no amount, or vice-versa) keep their
 *  non-empty side and default the other to a sensible value. */
function toWireCosts(rows: CostRow[]): AdditionalCostItem[] {
  return rows
    .map((r) => ({ title: r.category.trim(), cost: parseFloat(r.amount) || 0 }))
    .filter((c) => c.title.length > 0 && c.cost > 0);
}

export function useFillFlow(initialPondId: number | undefined, onClose?: () => void) {
  const fromFab = initialPondId == null;

  const { data: farms } = useFarmsData();
  const defaultFarmId = farms[0]?.id ?? null;

  const [farmId, setFarmId] = useState<number | null>(null);
  const [selectedPondId, setSelectedPondId] = useState<number | null>(initialPondId ?? null);
  const { data: allPondsInFarm } = usePondsData(farmId ?? undefined);

  // Seed default farm once farms list loads (FAB entry only).
  useEffect(() => {
    if (!fromFab) return;
    if (farmId != null) return;
    if (defaultFarmId == null) return;
    setFarmId(defaultFarmId);
  }, [fromFab, farmId, defaultFarmId]);

  // Clear pond when farm changes to one that doesn't contain it.
  useEffect(() => {
    if (selectedPondId == null) return;
    if (farmId == null) return;
    const ponds = allPondsInFarm;
    if (ponds.length === 0) return;
    const stillValid = ponds.some((p) => p.id === selectedPondId);
    if (!stillValid) setSelectedPondId(null);
  }, [farmId, selectedPondId, allPondsInFarm]);

  // When entered from pond-detail with a pre-set pond, derive farmId from it.
  const { data: pond } = usePondData(selectedPondId ?? undefined);
  useEffect(() => {
    if (!pond) return;
    if (farmId === pond.farmId) return;
    setFarmId(pond.farmId);
  }, [pond, farmId]);

  const isStartCycle = pond?.status === 'maintenance';

  const [step, setStep] = useState<1 | 2>(1);
  // Default species when the pond doesn't carry one (new / empty pond):
  // kaphong is the business default per product. When the pond already has
  // a species, the seed effect below switches `fishType` to it.
  const [fishType, setFishType] = useState<string>(pond?.fishTypes[0] ?? 'kaphong');
  const [amount, setAmount] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [avgWeightKg, setAvgWeightKg] = useState('');
  const [additionalCosts, setAdditionalCosts] = useState<CostRow[]>([]);
  const [remark, setRemark] = useState('');
  // Lazy init so each fresh mount reads the wall clock (defends against the
  // app staying open across midnight — `today` from shared/time is evaluated
  // at module load and could be stale).
  const [date, setDate] = useState<Date>(() => new Date());

  const fillMutation = useFillPond(selectedPondId ?? 0);
  const isAuthed = useAuthStore((s) => s.token != null);

  // Seed `fishType` ONLY when the pond itself changes (not on every render).
  // Depending on `pond?.fishTypes` is unsafe because `adaptPond` rebuilds the
  // array each render — the effect would re-fire and clobber the user's
  // selection, locking them into the existing species. With `pond?.id` as
  // the dep the user can switch species freely; only switching to a different
  // pond re-seeds. New / empty ponds default to "kaphong" (business default).
  useEffect(() => {
    if (pond?.fishTypes[0]) setFishType(pond.fishTypes[0]);
    else if (pond) setFishType('kaphong');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pond?.id]);

  const validationMsg = fromFab
    ? farmId == null
      ? 'เลือกฟาร์มก่อน'
      : selectedPondId == null
        ? 'เลือกบ่อก่อน'
        : null
    : null;

  const handleConfirm = async () => {
    if (!isAuthed || selectedPondId == null) {
      onClose?.();
      return;
    }
    try {
      const wireCosts = toWireCosts(additionalCosts);
      const weight = parseFloat(avgWeightKg || '0');
      await fillMutation.mutateAsync({
        fishType,
        amount: parseInt(amount || '0', 10),
        // Server validates pricePerUnit > 0; treat empty as 0 and let the
        // server reject so the message surfaces back to the user.
        pricePerUnit: parseFloat(pricePerUnit || '0'),
        ...(weight > 0 ? { fishWeight: weight } : {}),
        ...(wireCosts.length > 0 ? { additionalCosts: wireCosts } : {}),
        activityDate: toIsoDate(date),
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

  // Cost basis = จำนวน × น้ำหนักเฉลี่ยต่อตัว × ราคาต่อกก.
  //   amount  ×    avgWeightKg              ×  pricePerKg
  // (matches web "ต้นทุนรวม = น้ำหนักรวม × ราคาต่อหน่วย".)
  const fishCost = useMemo(
    () => Math.round(amountNum * weightNum * priceNum),
    [amountNum, weightNum, priceNum],
  );
  const extraTotal = useMemo(
    () => Math.round(additionalCostsTotal(additionalCosts)),
    [additionalCosts],
  );
  const grandTotal = useMemo(() => fishCost + extraTotal, [fishCost, extraTotal]);
  const totalWeightKg = useMemo(() => amountNum * weightNum, [amountNum, weightNum]);

  const stockBefore = pond?.totalFish ?? 0;
  const delta = amountNum;
  const stockAfter = stockBefore + delta;

  const goBack = () => {
    if (step === 1) onClose?.();
    else setStep(1);
  };

  return {
    fromFab,
    farms,
    pondsInFarm: allPondsInFarm,
    defaultFarmId,
    farmId,
    setFarmId,
    selectedPondId,
    setSelectedPondId,
    pond,
    validationMsg,
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
    additionalCosts,
    setAdditionalCosts,
    remark,
    setRemark,
    fishCost,
    extraTotal,
    grandTotal,
    totalWeightKg,
    stockBefore,
    stockAfter,
    delta,
    isStartCycle,
    date,
    setDate,
    handleConfirm,
    isPending: fillMutation.isPending,
    goBack,
  };
}

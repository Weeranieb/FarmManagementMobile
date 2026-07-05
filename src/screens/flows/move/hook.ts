import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useFarmsData } from '@/features/farm';
import {
  useMovePond,
  usePondData,
  usePondsData,
  type AdditionalCostItem,
} from '@/features/pond';
import { useAuthStore } from '@/features/auth';
import { toIsoDate } from '@/shared/time';
import {
  additionalCostsTotal,
  EMPTY_COST_ROW,
  type CostRow,
} from '../additional-costs';

// Standard species ordering — same canonical list the fill flow uses. Keeps
// the chip order stable across flows so users see a consistent picker.
const STANDARD_FISH_TYPES = ['kaphong', 'nil', 'kang', 'duk'];

function toWireCosts(rows: CostRow[]): AdditionalCostItem[] {
  return rows
    .map((r) => ({ title: r.category.trim(), cost: parseFloat(r.amount) || 0 }))
    .filter((c) => c.title.length > 0 && c.cost > 0);
}

export function useMoveFlow(initialFromId: number | undefined, onClose?: () => void) {
  const fromFab = initialFromId == null;

  const { data: farms } = useFarmsData();
  const defaultFarmId = farms[0]?.id ?? null;

  const [farmId, setFarmId] = useState<number | null>(null);
  const [fromId, setFromId] = useState<number | null>(initialFromId ?? null);
  const [toId, setToId] = useState<number | null>(null);

  const { data: pondsInFarm } = usePondsData(farmId ?? undefined);
  const { data: fromPond } = usePondData(fromId ?? undefined);

  // Seed default farm on FAB entry.
  useEffect(() => {
    if (!fromFab) return;
    if (farmId != null) return;
    if (defaultFarmId == null) return;
    setFarmId(defaultFarmId);
  }, [fromFab, farmId, defaultFarmId]);

  // From pond-detail entry: derive farmId from the source pond.
  useEffect(() => {
    if (!fromPond) return;
    if (farmId === fromPond.farmId) return;
    setFarmId(fromPond.farmId);
  }, [fromPond, farmId]);

  // Clear source / destination when the farm changes to one that doesn't contain them.
  useEffect(() => {
    if (farmId == null) return;
    if (pondsInFarm.length === 0) return;
    if (fromId != null && !pondsInFarm.some((p) => p.id === fromId)) setFromId(null);
    if (toId != null && !pondsInFarm.some((p) => p.id === toId)) setToId(null);
  }, [farmId, pondsInFarm, fromId, toId]);

  // Destination candidates — used both for the form's destination list (pond-detail
  // entry) and for clamping `toId` when source changes.
  const candidates = useMemo(
    () => pondsInFarm.filter((p) => p.id !== fromId && p.status === 'active'),
    [pondsInFarm, fromId],
  );

  // When entered from pond-detail (no toId state initially), pick the first candidate.
  useEffect(() => {
    if (fromFab) return;
    if (candidates.length === 0) return;
    if (toId == null || !candidates.some((p) => p.id === toId)) {
      setToId(candidates[0]!.id);
    }
  }, [fromFab, candidates, toId]);

  const toPond = pondsInFarm.find((p) => p.id === toId);

  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [avgWeightKg, setAvgWeightKg] = useState('');
  const [fishType, setFishType] = useState<string>('kaphong');
  const [additionalCosts, setAdditionalCosts] = useState<CostRow[]>([EMPTY_COST_ROW]);
  const [date, setDate] = useState<Date>(() => new Date());
  const [markToClose, setMarkToClose] = useState(false);
  const [remark, setRemark] = useState('');

  // Re-seed fishType only when the source pond changes (not on every render —
  // adaptPond rebuilds fishTypes each render so depending on the array would
  // clobber the user's manual selection). Same pattern as the fill flow.
  useEffect(() => {
    if (fromPond?.fishTypes[0]) setFishType(fromPond.fishTypes[0]);
    else if (fromPond) setFishType('kaphong');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromPond?.id]);

  // Picker options: canonical standard species, then any non-standard ones
  // the source pond happens to carry. Selection is highlighted in place; the
  // standard prefix keeps ordering predictable.
  const fishTypeOptions = useMemo(() => {
    const pondTypes = fromPond?.fishTypes ?? [];
    return [
      ...STANDARD_FISH_TYPES,
      ...pondTypes.filter((t) => !STANDARD_FISH_TYPES.includes(t)),
    ];
  }, [fromPond]);

  const amountNum = parseInt(amount || '0', 10);
  const priceNum = parseFloat(pricePerUnit || '0');
  const weightNum = parseFloat(avgWeightKg || '0');
  const totalWeightKg = useMemo(() => amountNum * weightNum, [amountNum, weightNum]);

  // Fish-value at submit time: amount × avg weight × price/kg (matches the
  // CalculateMoveCost formula on the backend and the fill flow's cost basis).
  const fishCost = useMemo(
    () => Math.round(amountNum * weightNum * priceNum),
    [amountNum, weightNum, priceNum],
  );
  const extraTotal = useMemo(
    () => Math.round(additionalCostsTotal(additionalCosts)),
    [additionalCosts],
  );
  const grandTotal = useMemo(() => fishCost + extraTotal, [fishCost, extraTotal]);

  // Per-side cost split — mirrors the backend's CalcMovePond. Additional
  // costs are split 50/50; the source treats the move as a sale (fish value
  // is revenue, halfExtra is its cost share), the destination treats it as
  // a purchase (fish value + halfExtra). Useful for showing both sides on
  // the review screen without a preview round-trip.
  const halfExtra = useMemo(() => Math.round(extraTotal / 2), [extraTotal]);
  const sourceFishRevenue = fishCost;
  const sourceAdditionalCost = halfExtra;
  const sourceNetEffect = fishCost - halfExtra;
  const destFishCost = fishCost;
  const destAdditionalCost = halfExtra;
  const destTotalCost = fishCost + halfExtra;

  const moveMutation = useMovePond(fromId ?? 0);
  const isAuthed = useAuthStore((s) => s.token != null);

  const validationMsg = fromFab
    ? farmId == null
      ? 'เลือกฟาร์มก่อน'
      : fromId == null
        ? 'เลือกบ่อต้นทาง'
        : toId == null
          ? 'เลือกบ่อปลายทาง'
          : fromId === toId
            ? 'บ่อต้นทางและปลายทางต้องต่างกัน'
            : null
    : null;

  const handleConfirm = async () => {
    if (!isAuthed || !toPond || !fromPond || fromId == null) {
      onClose?.();
      return;
    }
    try {
      const wireCosts = toWireCosts(additionalCosts);
      await moveMutation.mutateAsync({
        toPondId: toPond.id,
        fishType,
        amount: amountNum,
        // fishWeight is required by the backend (a move needs amount × weight ×
        // price > 0 to record real fish value; the step-1 gate enforces > 0
        // so we always send it).
        fishWeight: weightNum,
        pricePerUnit: priceNum,
        activityDate: toIsoDate(date),
        ...(wireCosts.length > 0 ? { additionalCosts: wireCosts } : {}),
        ...(markToClose ? { markToClose: true } : {}),
        ...(remark.trim() ? { remark: remark.trim() } : {}),
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
    return {
      from: Math.max(0, (fromPond?.totalFish ?? 0) - amountNum),
      to: (toPond?.totalFish ?? 0) + amountNum,
    };
  }, [amountNum, fromPond, toPond]);

  // Stock validation: the move amount can't exceed the source pond's current
  // stock. The backend rejects the request (ErrPondInsufficientFish) but
  // catching it here lets the user fix the number before submit and keeps
  // the "ถัดไป" CTA from advancing into an invalid review screen.
  const sourceStock = fromPond?.totalFish ?? 0;
  const exceedsStock = amountNum > sourceStock;
  const amountError: string | null = !amount
    ? null
    : amountNum <= 0
      ? 'จำนวนต้องมากกว่า 0'
      : exceedsStock
        ? `เกินจำนวนปลาในบ่อต้นทาง (มี ${sourceStock.toLocaleString('en-US')} ตัว)`
        : null;

  const goBack = () => {
    if (step === 1) onClose?.();
    else setStep(1);
  };

  return {
    fromFab,
    farms,
    pondsInFarm,
    defaultFarmId,
    farmId,
    setFarmId,
    fromId,
    setFromId,
    toId,
    setToId,
    fromPond,
    toPond,
    candidates,
    validationMsg,
    amount,
    setAmount,
    pricePerUnit,
    setPricePerUnit,
    avgWeightKg,
    setAvgWeightKg,
    fishType,
    setFishType,
    fishTypeOptions,
    additionalCosts,
    setAdditionalCosts,
    fishCost,
    extraTotal,
    grandTotal,
    totalWeightKg,
    halfExtra,
    sourceFishRevenue,
    sourceAdditionalCost,
    sourceNetEffect,
    destFishCost,
    destAdditionalCost,
    destTotalCost,
    amountError,
    date,
    setDate,
    markToClose,
    setMarkToClose,
    remark,
    setRemark,
    step,
    setStep,
    after,
    handleConfirm,
    isPending: moveMutation.isPending,
    goBack,
  };
}

import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useFarmsData } from '@/features/farm';
import { useMovePond, usePondData, usePondsData } from '@/features/pond';
import { useAuthStore } from '@/features/auth';
import { apiErrorMessage } from '@/shared/http';
import { toIsoDate } from '@/shared/time';
import { toWireCosts, type CostRow } from '../additional-costs';
import {
  additionalCostsTotal,
  fishValue,
  moveSplit,
  toCount,
  toDecimal,
  totalWeightKg as totalWeight,
} from '../money';
import i18n from '@/locale/i18n';

// Standard species ordering — same canonical list the fill flow uses. Keeps
// the chip order stable across flows so users see a consistent picker.
const STANDARD_FISH_TYPES = ['kaphong', 'nil', 'kang', 'duk'];

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

  // The destination is never auto-picked — both entries choose it explicitly in
  // the stepped picker (see InlineMovePicker), so a mis-targeted move can't be
  // submitted just because the form arrived with a default already filled in.
  // Selecting the source can only invalidate it, which the effect above clears.

  const toPond = pondsInFarm.find((p) => p.id === toId);

  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [avgWeightKg, setAvgWeightKg] = useState('');
  const [fishType, setFishType] = useState<string>('kaphong');
  const [additionalCosts, setAdditionalCosts] = useState<CostRow[]>([]);
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

  // Picker options are limited to species the source pond actually holds
  // (per the API) — you can only move fish that are already there. Standard
  // species are ordered first for a predictable chip order; any non-standard
  // species the pond carries is appended after.
  const fishTypeOptions = useMemo(() => {
    const pondTypes = fromPond?.fishTypes ?? [];
    return [
      ...STANDARD_FISH_TYPES.filter((t) => pondTypes.includes(t)),
      ...pondTypes.filter((t) => !STANDARD_FISH_TYPES.includes(t)),
    ];
  }, [fromPond]);

  const amountNum = toCount(amount);
  const priceNum = toDecimal(pricePerUnit);
  const weightNum = toDecimal(avgWeightKg);
  const totalWeightKg = useMemo(
    () => totalWeight(amountNum, weightNum),
    [amountNum, weightNum],
  );

  // Fish value at submit time — same basis as the fill flow and the backend's
  // CalculateMoveCost. See `../money`.
  const fishCost = useMemo(
    () => fishValue(amountNum, weightNum, priceNum),
    [amountNum, weightNum, priceNum],
  );
  const extraTotal = useMemo(
    () => Math.round(additionalCostsTotal(additionalCosts)),
    [additionalCosts],
  );
  const grandTotal = useMemo(() => fishCost + extraTotal, [fishCost, extraTotal]);

  // Per-side split — mirrors the backend's CalcMovePond, so the review screen
  // can show both sides without a preview round-trip.
  const {
    halfExtra,
    sourceFishRevenue,
    sourceAdditionalCost,
    sourceNetEffect,
    destFishCost,
    destAdditionalCost,
    destTotalCost,
  } = useMemo(() => moveSplit(fishCost, extraTotal), [fishCost, extraTotal]);

  const moveMutation = useMovePond(fromId ?? 0);
  const isAuthed = useAuthStore((s) => s.token != null);

  // Same gate for both entries — pond-detail entry only skips the farm/source
  // steps, so its picker can still be incomplete (no destination yet).
  const validationMsg = fromFab
    ? farmId == null
      ? i18n.t('flows.pickFarmFirst')
      : fromId == null
        ? i18n.t('flows.move.pickSource')
        : toId == null
          ? i18n.t('flows.move.pickDest')
          : fromId === toId
            ? i18n.t('flows.move.sameSourceDest')
            : null
    : toId == null
      ? i18n.t('flows.move.pickDest')
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
      Alert.alert(i18n.t('flows.move.failed'), apiErrorMessage(err, i18n.t('flows.saveFailed')));
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
      ? i18n.t('flows.amountGtZero')
      : exceedsStock
        ? i18n.t('flows.move.exceeds', { count: sourceStock.toLocaleString('en-US') })
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

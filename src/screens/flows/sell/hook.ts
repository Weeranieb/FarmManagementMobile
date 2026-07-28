import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useFarmsData } from '@/features/farm';
import {
  usePondData,
  usePondsData,
  useSellPond,
  type PondModel,
  type SellPondDetailItem,
} from '@/features/pond';
import { adaptMerchant, useCreateMerchant, useMerchantsData, type MerchantModel } from '@/features/merchant';
import { useFishSizeGradesData } from '@/features/size-grade';
import { useAuthStore } from '@/features/auth';
import { apiErrorMessage } from '@/shared/http';
import { toIsoDate } from '@/shared/time';
import { additionalCostsTotal, toWireCosts, type CostRow } from '../additional-costs';
import i18n from '@/locale/i18n';

/**
 * One editable sell-row in the UI. Values are strings so partial input
 * survives across re-renders without parseFloat clobbering "0." mid-typing.
 * `gradeId` is null until the user picks a size grade — submission rejects
 * rows where it's still null.
 */
export type SellRow = {
  /** Stable id for React keying and patch addressing. NOT sent to the API. */
  id: string;
  gradeId: number | null;
  weightKg: string;
  pricePerKg: string;
  /** Required: the backend decrements the pond's head count by this per line. */
  fishCount: string;
};

let nextRowId = 1;
function emptyRow(): SellRow {
  return {
    id: `r${nextRowId++}`,
    gradeId: null,
    weightKg: '',
    pricePerKg: '',
    fishCount: '',
  };
}

function rowIsSubmittable(r: SellRow): boolean {
  return (
    r.gradeId != null &&
    parseFloat(r.weightKg) > 0 &&
    parseFloat(r.pricePerKg) > 0 &&
    parseInt(r.fishCount, 10) > 0
  );
}

function rowSubtotal(r: SellRow): number {
  const w = parseFloat(r.weightKg) || 0;
  const p = parseFloat(r.pricePerKg) || 0;
  return Math.round(w * p);
}

/** Passed to `onClose` when — and only when — a sale was actually saved. */
export type SellResult = {
  /** The pond the sale was booked against (the picked one on FAB entry). */
  pondId: number;
  /** True when "ปิดบ่อหลังขาย" was on — the cycle just ended. */
  pondClosed: boolean;
};

export function useSellFlow(
  initialPondId: number | undefined,
  onClose?: (result?: SellResult) => void,
) {
  const fromFab = initialPondId == null;

  const { data: farms } = useFarmsData();
  const defaultFarmId = farms[0]?.id ?? null;

  const [farmId, setFarmId] = useState<number | null>(null);
  const [selectedPondId, setSelectedPondId] = useState<number | null>(initialPondId ?? null);
  const { data: pondsInFarm } = usePondsData(farmId ?? undefined);

  useEffect(() => {
    if (!fromFab) return;
    if (farmId != null) return;
    if (defaultFarmId == null) return;
    setFarmId(defaultFarmId);
  }, [fromFab, farmId, defaultFarmId]);

  useEffect(() => {
    if (selectedPondId == null) return;
    if (farmId == null) return;
    if (pondsInFarm.length === 0) return;
    const stillValid = pondsInFarm.some((p) => p.id === selectedPondId);
    if (!stillValid) setSelectedPondId(null);
  }, [farmId, selectedPondId, pondsInFarm]);

  const { data: pond } = usePondData(selectedPondId ?? undefined);
  useEffect(() => {
    if (!pond) return;
    if (farmId === pond.farmId) return;
    setFarmId(pond.farmId);
  }, [pond, farmId]);

  // Backend list endpoints — these become real once the user is authenticated.
  const { data: merchants } = useMerchantsData();
  const { data: sizeGrades } = useFishSizeGradesData();

  const [step, setStep] = useState<1 | 2>(1);
  const [rows, setRows] = useState<SellRow[]>(() => [emptyRow()]);
  const [merchantId, setMerchantId] = useState<number | null>(null);
  const [additionalCosts, setAdditionalCosts] = useState<CostRow[]>([]);
  const [date, setDate] = useState<Date>(() => new Date());
  const [markToClose, setMarkToClose] = useState(false);
  const [remark, setRemark] = useState('');

  // Once a size-grade catalogue arrives and the user hasn't yet touched the
  // first row, seed it with the first option. Keeps initial render less
  // empty without locking the user into anything.
  useEffect(() => {
    if (sizeGrades.length === 0) return;
    setRows((prev) => {
      const first = prev[0];
      if (!first) return prev;
      if (first.gradeId != null) return prev;
      if (first.weightKg !== '' || first.pricePerKg !== '' || first.fishCount !== '') return prev;
      return [{ ...first, gradeId: sizeGrades[0]!.id }, ...prev.slice(1)];
    });
  }, [sizeGrades]);

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (id: string) =>
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  const updateRow = (id: string, patch: Partial<SellRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  // Per-row subtotals and the grand revenue. Memoized so the review screen
  // can show a stable list without recomputing on every parent re-render.
  const subtotals = useMemo(() => rows.map(rowSubtotal), [rows]);
  const grossRevenue = useMemo(() => subtotals.reduce((s, v) => s + v, 0), [subtotals]);
  const extraTotal = useMemo(
    () => Math.round(additionalCostsTotal(additionalCosts)),
    [additionalCosts],
  );
  const netRevenue = useMemo(() => grossRevenue - extraTotal, [grossRevenue, extraTotal]);

  // Fish count sanity check: the user-entered ตัว totals must not exceed
  // the source pond's stock. Sums whatever has been typed so far (including
  // not-yet-submittable rows), so the warning appears while editing.
  const totalFishCount = useMemo(
    () =>
      rows.reduce((sum, r) => {
        const n = parseInt(r.fishCount, 10);
        return sum + (Number.isFinite(n) && n > 0 ? n : 0);
      }, 0),
    [rows],
  );
  const sourceStock = pond?.totalFish ?? 0;
  const exceedsStock = totalFishCount > sourceStock;
  const fishCountError: string | null =
    totalFishCount > 0 && exceedsStock
      ? i18n.t('flows.sell.exceedsStock', {
          total: totalFishCount.toLocaleString('en-US'),
          stock: sourceStock.toLocaleString('en-US'),
        })
      : null;

  const submittableRows = useMemo(() => rows.filter(rowIsSubmittable), [rows]);
  const hasAnyValidRow = submittableRows.length > 0;
  const canSubmit =
    selectedPondId != null && merchantId != null && hasAnyValidRow && fishCountError == null;

  const merchant = merchants.find((m) => m.id === merchantId) ?? null;

  // Inline "เพิ่มผู้ซื้อใหม่" from the merchant picker — create then auto-select
  // the new merchant so the user never leaves the sell flow. The mutation
  // invalidates ['merchants'], so the picker + field refresh to include it.
  const createMerchantMutation = useCreateMerchant();
  const creatingMerchant = createMerchantMutation.isPending;
  const createAndSelectMerchant = async (payload: {
    name: string;
    contactNumber: string;
    location: string;
  }): Promise<MerchantModel> => {
    const created = await createMerchantMutation.mutateAsync({
      name: payload.name,
      contactNumber: payload.contactNumber,
      location: payload.location,
    });
    const model = adaptMerchant(created);
    setMerchantId(model.id);
    return model;
  };

  const sellMutation = useSellPond(selectedPondId ?? 0);
  const isAuthed = useAuthStore((s) => s.token != null);

  const validationMsg = fromFab
    ? farmId == null
      ? i18n.t('flows.pickFarmFirst')
      : selectedPondId == null
        ? i18n.t('flows.sell.pickPond')
        : null
    : null;

  const handleConfirm = async () => {
    if (!isAuthed || selectedPondId == null || merchantId == null) {
      onClose?.();
      return;
    }
    if (!hasAnyValidRow) return;
    try {
      const wireCosts = toWireCosts(additionalCosts);
      // rowIsSubmittable already guarantees fishCount > 0 for every row here.
      const details: SellPondDetailItem[] = submittableRows.map((r) => ({
        fishSizeGradeId: r.gradeId as number,
        weight: parseFloat(r.weightKg),
        pricePerUnit: parseFloat(r.pricePerKg),
        fishCount: parseInt(r.fishCount, 10),
      }));
      await sellMutation.mutateAsync({
        activityDate: toIsoDate(date),
        details,
        merchantId,
        ...(wireCosts.length > 0 ? { additionalCosts: wireCosts } : {}),
        ...(markToClose ? { markToClose: true } : {}),
      });
      // Only this exit carries a result, so the caller can tell a saved sale
      // from a cancel and land the user where the outcome now lives.
      onClose?.({ pondId: selectedPondId, pondClosed: markToClose });
    } catch (err) {
      Alert.alert(i18n.t('flows.sell.failed'), apiErrorMessage(err, i18n.t('flows.saveFailed')));
    }
  };

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
    selectedPondId,
    setSelectedPondId,
    pond: pond as PondModel | null,
    validationMsg,
    merchants,
    sizeGrades,
    step,
    setStep,
    rows,
    addRow,
    removeRow,
    updateRow,
    merchantId,
    setMerchantId,
    merchant,
    createAndSelectMerchant,
    creatingMerchant,
    subtotals,
    grossRevenue,
    additionalCosts,
    setAdditionalCosts,
    extraTotal,
    netRevenue,
    totalFishCount,
    fishCountError,
    sourceStock,
    canSubmit,
    date,
    setDate,
    markToClose,
    setMarkToClose,
    remark,
    setRemark,
    handleConfirm,
    isPending: sellMutation.isPending,
    goBack,
  };
}

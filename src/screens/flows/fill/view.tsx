import { useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Btn, Input, Pill, TopBar } from '@/components/ui';
import { DateField } from '@/components/date-selector';
import { Row, Col } from '@/components/layout/Row';
import { Icon } from '@/components/icons';
import { fmt, FISH_TH, displayFarmName, displayPondName } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import type { FarmModel } from '@/features/farm';
import type { PondModel } from '@/features/pond';
import { BottomBar, FieldRow, FishPicker, FlowBackBtn, NoteField, PreviewCard } from '../shared';
import { DimWrap, InlineFarmPondPicker, PickerValidationBanner, useAutoAdvance } from '../picker';
import { AdditionalCostsEditor, type CostRow } from '../additional-costs';
import {
  AdditionalCostsList,
  ClosePondBadge,
  GrandTotalBlock,
  ImpactCell,
  ReviewRow,
  ReviewSection,
  WarningBanner,
} from '../review';

type Props = {
  fromFab: boolean;
  farms: FarmModel[];
  pondsInFarm: PondModel[];
  defaultFarmId: number | null;
  farmId: number | null;
  setFarmId: (id: number) => void;
  selectedPondId: number | null;
  setSelectedPondId: (id: number) => void;
  pond: PondModel | null;
  validationMsg: string | null;
  step: 1 | 2;
  setStep: (s: 1 | 2) => void;
  fishType: string;
  setFishType: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  pricePerUnit: string;
  setPricePerUnit: (v: string) => void;
  avgWeightKg: string;
  setAvgWeightKg: (v: string) => void;
  additionalCosts: CostRow[];
  setAdditionalCosts: (rows: CostRow[]) => void;
  remark: string;
  setRemark: (v: string) => void;
  fishCost: number;
  extraTotal: number;
  grandTotal: number;
  totalWeightKg: number;
  stockBefore: number;
  stockAfter: number;
  delta: number;
  isStartCycle: boolean;
  date: Date;
  setDate: (d: Date) => void;
  handleConfirm: () => void;
  isPending: boolean;
  goBack: () => void;
};

export function FillView(props: Props) {
  const { step } = props;
  return step === 1 ? <FillStep1 {...props} /> : <FillStep2 {...props} />;
}

function FillStep1(props: Props) {
  const {
    fromFab,
    farms,
    pondsInFarm,
    defaultFarmId,
    farmId,
    setFarmId,
    selectedPondId,
    setSelectedPondId,
    pond,
    validationMsg,
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
    stockBefore,
    stockAfter,
    delta,
    isStartCycle,
    date,
    setDate,
    goBack,
  } = props;
  const { t } = useTheme();
  const fieldsReady = pond != null;

  // Canonical species order — kaphong is the business default and always
  // leftmost. Any non-standard species the pond happens to carry (rare;
  // e.g. legacy data) is appended at the end so the canonical order is
  // never disturbed. The pre-selected chip is highlighted wherever it
  // sits — leftmost-kaphong is purely an ordering invariant.
  const STANDARD_FISH_TYPES = ['kaphong', 'nil', 'kang', 'duk'];
  const pondTypes = pond?.fishTypes ?? [];
  const fishTypes = [
    ...STANDARD_FISH_TYPES,
    ...pondTypes.filter((t) => !STANDARD_FISH_TYPES.includes(t)),
  ];

  const { scrollRef, scrollToAnchor } = useAutoAdvance();
  const pondAnchorRef = useRef<View | null>(null);
  const formAnchorRef = useRef<View | null>(null);

  const handleFarmPick = (id: number) => {
    setFarmId(id);
    scrollToAnchor(pondAnchorRef);
  };
  const handlePondPick = (id: number) => {
    setSelectedPondId(id);
    scrollToAnchor(formAnchorRef);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        title={isStartCycle ? 'เริ่มรอบใหม่' : 'เติมปลา'}
        subtitle={
          fromFab && !pond
            ? 'เลือกฟาร์มและบ่อ แล้วกรอกรายละเอียด'
            : pond
              ? `${displayPondName(pond.name)}${pond.farmName ? ` · ${displayFarmName(pond.farmName)}` : ''}`
              : undefined
        }
        leading={<FlowBackBtn step={1} onPress={goBack} />}
        trailing={<Pill tone="fill">ขั้นที่ 1/2</Pill>}
      />

      <ScrollView
        delaysContentTouches={false}
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {fromFab ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
            <InlineFarmPondPicker
              action="fill"
              farms={farms}
              ponds={pondsInFarm}
              defaultFarmId={defaultFarmId}
              farmId={farmId}
              pondId={selectedPondId}
              onFarmChange={handleFarmPick}
              onPondChange={handlePondPick}
              pondSectionRef={pondAnchorRef}
            />
          </View>
        ) : null}

        {isStartCycle && fieldsReady ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                alignItems: 'flex-start',
                padding: 12,
                backgroundColor: t.fillSoft,
                borderWidth: 1,
                borderColor: t.fill + '40',
                borderRadius: radii.sm,
              }}
            >
              <Icon.cycle size={16} color={t.fillInk} />
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: t.fillInk,
                  fontFamily: type.family,
                  lineHeight: 19,
                }}
              >
                บ่อนี้กำลังปิดอยู่ — การเติมจะเริ่มรอบใหม่โดยอัตโนมัติ
              </Text>
            </View>
          </View>
        ) : null}

        <View ref={formAnchorRef} />
        <View style={{ padding: 20 }}>
          <DimWrap
            ready={fieldsReady}
            hint={fromFab ? 'เลือกฟาร์มและบ่อก่อน เพื่อกรอกรายละเอียด' : undefined}
          >
            <FieldRow label="ชนิดปลา">
              <FishPicker types={fishTypes} selected={fishType} onChange={setFishType} />
            </FieldRow>

            <FieldRow label="จำนวน">
              <Input
                big
                keyboardType="number-pad"
                suffix="ตัว"
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
              />
            </FieldRow>

            <FieldRow label="น้ำหนักเฉลี่ยต่อตัว">
              <Input
                keyboardType="decimal-pad"
                suffix="กก./ตัว"
                value={avgWeightKg}
                onChangeText={setAvgWeightKg}
                placeholder="0.05"
              />
            </FieldRow>

            <FieldRow label="ราคาต่อกก.">
              <Input
                keyboardType="decimal-pad"
                suffix="฿/กก."
                value={pricePerUnit}
                onChangeText={setPricePerUnit}
                placeholder="0"
              />
            </FieldRow>

            <FieldRow label="วันที่">
              <DateField value={date} onChange={setDate} />
            </FieldRow>

            <FieldRow label="ค่าใช้จ่ายเพิ่มเติม" optional>
              <AdditionalCostsEditor
                tone="fill"
                rows={additionalCosts}
                onChange={setAdditionalCosts}
              />
            </FieldRow>

            <FieldRow label="โน้ต">
              <NoteField value={remark} onChange={setRemark} />
            </FieldRow>
          </DimWrap>
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <Col gap={14}>
            {fieldsReady ? (
              <>
                <PreviewCard
                  tone="fill"
                  rows={[
                    ['ต้นทุนปลา', fmt.baht(fishCost)],
                    ['ค่าใช้จ่ายเพิ่มเติม', fmt.baht(extraTotal)],
                  ]}
                  totalLabel="รวมทั้งหมด"
                  total={fmt.baht(grandTotal)}
                />
                <StockImpactRow
                  before={stockBefore}
                  after={stockAfter}
                  delta={delta}
                  accent={t.fill}
                />
              </>
            ) : (
              <PickerValidationBanner msg={validationMsg} />
            )}
            <Btn
              tone="fill"
              size="lg"
              block
              onPress={() => setStep(2)}
              disabled={!fieldsReady || !amount || !avgWeightKg || parseFloat(avgWeightKg) <= 0}
            >
              ตรวจสอบและบันทึก
            </Btn>
          </Col>
        </View>
      </ScrollView>
    </View>
  );
}

function FillStep2(props: Props) {
  const {
    pond,
    fishType,
    amount,
    pricePerUnit,
    avgWeightKg,
    additionalCosts,
    fishCost,
    grandTotal,
    totalWeightKg,
    stockBefore,
    stockAfter,
    delta,
    isStartCycle,
    date,
    handleConfirm,
    isPending,
    goBack,
  } = props;
  const { t } = useTheme();
  if (!pond) return null;
  const amountNum = parseInt(amount || '0', 10);
  const priceNum = parseFloat(pricePerUnit || '0');
  const fishLabel = FISH_TH[fishType] ?? fishType;
  const pondLabel = displayPondName(pond.name);
  const farmLabel = pond.farmName ? displayFarmName(pond.farmName) : '';

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        title="ตรวจสอบและยืนยัน"
        subtitle={`เติมปลา · ${pondLabel}`}
        leading={<FlowBackBtn step={2} onPress={goBack} />}
        trailing={<Pill tone="fill">ขั้นที่ 2/2</Pill>}
      />

      <ScrollView
        delaysContentTouches={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero summary */}
        <View
          style={{
            paddingTop: 20,
            paddingBottom: 18,
            paddingHorizontal: 18,
            backgroundColor: t.fillSoft,
            borderWidth: 1.5,
            borderColor: t.fill + '40',
            borderRadius: radii.lg,
          }}
        >
          <View
            style={{
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingVertical: 7,
              paddingHorizontal: 12,
              borderRadius: 9999,
              backgroundColor: t.fill,
            }}
          >
            <Icon.plus size={14} color="#ffffff" stroke={2.4} />
            <Text style={{ color: '#ffffff', fontSize: 14, fontFamily: type.familyBold }}>
              เติมปลา
            </Text>
          </View>
          <Text
            style={{
              marginTop: 12,
              fontFamily: type.familyNumBold,
              fontSize: 34,
              color: t.fillInk,
              letterSpacing: -1,
            }}
          >
            +{fmt.num(amountNum)} ตัว
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontSize: 14,
              color: t.fillInk,
              opacity: 0.85,
              fontFamily: type.family,
            }}
          >
            {fishLabel} · ราคา {fmt.baht(priceNum)}/กก.
            {isStartCycle ? ' · เริ่มรอบใหม่' : ''}
          </Text>
        </View>

        <ReviewSection title="ข้อมูลทั่วไป">
          <ReviewRow l="บ่อปลายทาง" v={farmLabel ? `${pondLabel} · ${farmLabel}` : pondLabel} />
          <ReviewRow l="วันที่บันทึก" v={thaiDate.long(date)} last />
        </ReviewSection>

        <ReviewSection title="รายละเอียดปลา">
          <ReviewRow l="พันธุ์ปลา" v={fishLabel} />
          <ReviewRow l="จำนวน" v={`${fmt.num(amountNum)} ตัว`} />
          {avgWeightKg ? (
            <>
              <ReviewRow l="น้ำหนักเฉลี่ย" v={`${avgWeightKg} กก./ตัว`} />
              <ReviewRow l="น้ำหนักรวม" v={fmt.kg(totalWeightKg)} />
            </>
          ) : null}
          <ReviewRow l="ราคาต่อกก." v={`${fmt.bahtPrecise(priceNum)}/กก.`} />
          <ReviewRow l="ต้นทุนปลาเริ่มต้น" v={fmt.baht(fishCost)} last />
        </ReviewSection>

        <ReviewSection title={`ค่าใช้จ่ายเพิ่มเติม (${countNonEmpty(additionalCosts)} รายการ)`}>
          <AdditionalCostsList rows={additionalCosts} />
        </ReviewSection>

        <GrandTotalBlock tone="fill" label="ยอดรวมทั้งหมด" value={fmt.baht(grandTotal)} />

        <ReviewSection title="ผลกระทบต่อปริมาณปลา">
          <Row gap={10} style={{ paddingVertical: 14 }}>
            <ImpactCell label="ก่อน" v={fmt.num(stockBefore)} />
            <Icon.arrow size={18} color={t.inkSoft} />
            <ImpactCell label="หลัง" v={fmt.num(stockAfter)} accent={t.fill} />
            <ImpactCell label="เพิ่ม" v={`+${fmt.num(delta)}`} accent={t.fill} />
          </Row>
          {isStartCycle ? (
            <View style={{ paddingHorizontal: 0, paddingBottom: 14 }}>
              <ClosePondBadge msg={`${pondLabel} จะเริ่มรอบใหม่หลังลงปลาเสร็จ`} />
            </View>
          ) : null}
        </ReviewSection>

        <WarningBanner />
      </ScrollView>

      <BottomBar>
        <Btn
          tone="fill"
          size="lg"
          block
          onPress={handleConfirm}
          disabled={isPending}
        >
          {isPending ? 'กำลังบันทึก…' : 'ยืนยันและลงปลา'}
        </Btn>
      </BottomBar>
    </View>
  );
}

function countNonEmpty(rows: CostRow[]): number {
  return rows.filter((r) => r.category.trim() || parseFloat(r.amount) > 0).length;
}

function StockImpactRow({
  before,
  after,
  delta,
  accent,
}: {
  before: number;
  after: number;
  delta: number;
  accent: string;
}) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 4,
      }}
    >
      <StockCell label="ก่อน" v={fmt.num(before)} />
      <Icon.arrow size={14} color={t.inkSoft} />
      <StockCell label="หลัง" v={fmt.num(after)} accent={accent} />
      <Text
        style={{
          marginLeft: 'auto',
          fontFamily: type.familyNumBold,
          fontSize: 12,
          color: accent,
        }}
      >
        {delta > 0 ? '+' : ''}
        {fmt.num(delta)}
      </Text>
    </View>
  );
}

function StockCell({ label, v, accent }: { label: string; v: string; accent?: string }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: t.surfaceAlt,
        borderRadius: radii.xs,
      }}
    >
      <Text style={{ fontSize: 10, color: t.inkMute, fontFamily: type.familyMedium }}>{label}</Text>
      <Text
        style={{
          fontFamily: type.familyNumBold,
          fontSize: 14,
          color: accent ?? t.ink,
        }}
      >
        {v}
      </Text>
    </View>
  );
}


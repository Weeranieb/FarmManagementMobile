import { useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Btn, Input, Pill, TopBar } from '@/components/ui';
import { DateField } from '@/components/date-selector';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { fmt, FISH_TH, displayFarmName, displayPondName } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import type { FarmModel } from '@/features/farm';
import type { PondModel } from '@/features/pond';
import { BottomBar, CloseAfterActionToggle, FieldRow, FishPicker, FlowBackBtn } from '../shared';
import { DimWrap, InlineMovePicker, PickerValidationBanner, useAutoAdvance } from '../picker';
import { AdditionalCostsEditor, type CostRow } from '../additional-costs';
import {
  AdditionalCostsList,
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
  fromId: number | null;
  setFromId: (id: number) => void;
  toId: number | null;
  setToId: (id: number) => void;
  fromPond: PondModel | null;
  toPond: PondModel | undefined;
  candidates: PondModel[];
  validationMsg: string | null;
  amount: string;
  setAmount: (v: string) => void;
  pricePerUnit: string;
  setPricePerUnit: (v: string) => void;
  avgWeightKg: string;
  setAvgWeightKg: (v: string) => void;
  fishType: string;
  setFishType: (v: string) => void;
  fishTypeOptions: string[];
  additionalCosts: CostRow[];
  setAdditionalCosts: (rows: CostRow[]) => void;
  fishCost: number;
  extraTotal: number;
  grandTotal: number;
  totalWeightKg: number;
  halfExtra: number;
  sourceFishRevenue: number;
  sourceAdditionalCost: number;
  sourceNetEffect: number;
  destFishCost: number;
  destAdditionalCost: number;
  destTotalCost: number;
  amountError: string | null;
  date: Date;
  setDate: (d: Date) => void;
  markToClose: boolean;
  setMarkToClose: (v: boolean) => void;
  step: 1 | 2;
  setStep: (s: 1 | 2) => void;
  after: { from: number; to: number };
  handleConfirm: () => void;
  isPending: boolean;
  goBack: () => void;
};

export function MoveView({
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
  step,
  setStep,
  after,
  handleConfirm,
  isPending,
  goBack,
}: Props) {
  const { t } = useTheme();
  const fieldsReady = fromPond != null && toPond != null && fromPond.id !== toPond.id;

  const { scrollRef, scrollToAnchor } = useAutoAdvance();
  const sourceAnchorRef = useRef<View | null>(null);
  const destAnchorRef = useRef<View | null>(null);
  const formAnchorRef = useRef<View | null>(null);

  const handleFarmPick = (id: number) => {
    setFarmId(id);
    scrollToAnchor(sourceAnchorRef);
  };
  const handleSourcePick = (id: number) => {
    setFromId(id);
    scrollToAnchor(destAnchorRef);
  };
  const handleDestPick = (id: number) => {
    setToId(id);
    scrollToAnchor(formAnchorRef);
  };

  if (step === 2) {
    if (!fromPond) return null;
    const fromLabel = displayPondName(fromPond.name);
    const fromFarmLabel = fromPond.farmName ? displayFarmName(fromPond.farmName) : '';
    const toLabel = toPond ? displayPondName(toPond.name) : '—';
    const toFarmLabel = toPond?.farmName ? displayFarmName(toPond.farmName) : '';
    const amountNum = parseInt(amount || '0', 10);
    const fishLabel = FISH_TH[fishType] ?? fishType;
    return (
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <TopBar
          title="ตรวจสอบและยืนยัน"
          subtitle={`ย้ายปลา · ${fromLabel} → ${toLabel}`}
          leading={<FlowBackBtn step={2} onPress={goBack} />}
          trailing={<Pill tone="move">ขั้นที่ 2/2</Pill>}
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
              backgroundColor: t.moveSoft,
              borderWidth: 1.5,
              borderColor: t.move + '40',
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
                backgroundColor: t.move,
              }}
            >
              <Icon.swap size={14} color="#ffffff" stroke={2.4} />
              <Text style={{ color: '#ffffff', fontSize: 14, fontFamily: type.familyBold }}>
                ย้ายปลา
              </Text>
            </View>
            <Text
              style={{
                marginTop: 12,
                fontFamily: type.familyNumBold,
                fontSize: 30,
                color: t.moveInk,
                letterSpacing: -0.6,
              }}
            >
              {fmt.num(amountNum)} ตัว
            </Text>
            <Row gap={8} style={{ marginTop: 4 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: t.moveInk,
                  opacity: 0.85,
                  fontFamily: type.familySemi,
                }}
              >
                {fromLabel}
              </Text>
              <Icon.arrow size={14} color={t.moveInk} />
              <Text
                style={{
                  fontSize: 14,
                  color: t.moveInk,
                  opacity: 0.85,
                  fontFamily: type.familySemi,
                }}
              >
                {toLabel}
              </Text>
            </Row>
          </View>

          <ReviewSection title="ข้อมูลทั่วไป">
            <ReviewRow
              l="บ่อต้นทาง"
              v={fromFarmLabel ? `${fromLabel} · ${fromFarmLabel}` : fromLabel}
            />
            <ReviewRow
              l="บ่อปลายทาง"
              v={toFarmLabel ? `${toLabel} · ${toFarmLabel}` : toLabel}
            />
            <ReviewRow l="วันที่บันทึก" v={thaiDate.long(date)} />
            <ReviewRow
              l="หลังย้าย"
              v={markToClose ? `ปิดบ่อ ${fromLabel}` : 'เปิดบ่อต้นทางต่อ'}
              last
            />
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
            <ReviewRow l="ราคาต่อกก." v={`${fmt.bahtPrecise(parseFloat(pricePerUnit || '0'))}/กก.`} />
            <ReviewRow l="มูลค่าปลา" v={fmt.baht(fishCost)} last />
          </ReviewSection>

          <ReviewSection title={`ค่าใช้จ่ายเพิ่มเติม (${countNonEmpty(additionalCosts)} รายการ)`}>
            <AdditionalCostsList rows={additionalCosts} />
          </ReviewSection>

          <MoveCostSplitPanel
            fromLabel={fromLabel}
            toLabel={toLabel}
            fishValue={fishCost}
            halfExtra={halfExtra}
            extraTotal={extraTotal}
            grandTotal={grandTotal}
            sourceFishRevenue={sourceFishRevenue}
            sourceAdditionalCost={sourceAdditionalCost}
            sourceNetEffect={sourceNetEffect}
            destFishCost={destFishCost}
            destAdditionalCost={destAdditionalCost}
            destTotalCost={destTotalCost}
          />

          <ReviewSection title="ผลกระทบต่อปริมาณปลา">
            <Col gap={10} style={{ paddingVertical: 14 }}>
              <Col gap={6}>
                <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.familySemi }}>
                  บ่อต้นทาง · {fromLabel}
                </Text>
                <Row gap={10}>
                  <ImpactCell label="ก่อน" v={fmt.num(fromPond.totalFish)} />
                  <Icon.arrow size={16} color={t.inkSoft} />
                  <ImpactCell label="หลัง" v={fmt.num(after.from)} accent={t.move} />
                  <ImpactCell label="ลด" v={`-${fmt.num(amountNum)}`} accent={t.danger} />
                </Row>
              </Col>
              {toPond ? (
                <Col gap={6}>
                  <Text
                    style={{ fontSize: 11, color: t.inkMute, fontFamily: type.familySemi }}
                  >
                    บ่อปลายทาง · {toLabel}
                  </Text>
                  <Row gap={10}>
                    <ImpactCell label="ก่อน" v={fmt.num(toPond.totalFish)} />
                    <Icon.arrow size={16} color={t.inkSoft} />
                    <ImpactCell label="หลัง" v={fmt.num(after.to)} accent={t.move} />
                    <ImpactCell label="เพิ่ม" v={`+${fmt.num(amountNum)}`} accent={t.fill} />
                  </Row>
                </Col>
              ) : null}
            </Col>
          </ReviewSection>

          <WarningBanner />
        </ScrollView>
        <BottomBar>
          <Btn
            tone="move"
            size="lg"
            block
            onPress={handleConfirm}
            disabled={isPending}
          >
            {isPending ? 'กำลังบันทึก…' : 'ยืนยันและย้าย'}
          </Btn>
        </BottomBar>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        title="ย้ายปลา"
        subtitle={
          fromFab && !fieldsReady
            ? 'เลือกฟาร์มและบ่อ แล้วกรอกรายละเอียด'
            : fromPond
              ? `${fromPond.name}${fromPond.farmName ? ` · ${fromPond.farmName}` : ''}`
              : undefined
        }
        leading={<FlowBackBtn step={1} onPress={goBack} />}
        trailing={<Pill tone="move">ขั้นที่ 1/2</Pill>}
      />

      <ScrollView
        delaysContentTouches={false}
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {fromFab ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
            <InlineMovePicker
              farms={farms}
              ponds={pondsInFarm}
              defaultFarmId={defaultFarmId}
              farmId={farmId}
              fromId={fromId}
              toId={toId}
              onFarmChange={handleFarmPick}
              onFromChange={handleSourcePick}
              onToChange={handleDestPick}
              sourceSectionRef={sourceAnchorRef}
              destSectionRef={destAnchorRef}
            />
          </View>
        ) : null}

        <View ref={formAnchorRef} />
        <View style={{ padding: 20 }}>
          <DimWrap
            ready={fieldsReady}
            hint={fromFab ? 'เลือกฟาร์มและบ่อ แล้วกรอกจำนวนที่ย้าย' : undefined}
          >
            <FieldRow label="พันธุ์ปลา">
              <FishPicker types={fishTypeOptions} selected={fishType} onChange={setFishType} />
            </FieldRow>

            <FieldRow label="จำนวนที่ย้าย">
              <Input
                big
                keyboardType="number-pad"
                suffix="ตัว"
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
              />
              {amountError ? (
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: t.danger,
                    fontFamily: type.familySemi,
                  }}
                >
                  {amountError}
                </Text>
              ) : fromPond ? (
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: t.inkMute,
                    fontFamily: type.family,
                  }}
                >
                  มีปลาในบ่อต้นทาง {fmt.num(fromPond.totalFish)} ตัว
                </Text>
              ) : null}
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

            {!fromFab ? (
              <FieldRow label="ปลายทาง">
                <Col gap={8}>
                  {candidates.map((p) => {
                    const sel = p.id === toId;
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => setToId(p.id)}
                        style={{
                          padding: 14,
                          borderRadius: radii.md,
                          borderWidth: 1.5,
                          borderColor: sel ? t.move : t.border,
                          backgroundColor: sel ? t.moveSoft : t.surface,
                        }}
                      >
                        <Row justify="space-between">
                          <Col gap={2}>
                            <Text
                              style={{ fontFamily: type.familyBold, fontSize: 14, color: t.ink }}
                            >
                              {p.name}
                            </Text>
                            <Text
                              style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}
                            >
                              {p.farmName} · {fmt.num(p.totalFish)} ตัว
                            </Text>
                          </Col>
                          <Pill tone="ghost">
                            {p.fishTypes.map((f) => FISH_TH[f] ?? f).join(', ') || '—'}
                          </Pill>
                        </Row>
                      </Pressable>
                    );
                  })}
                </Col>
              </FieldRow>
            ) : null}

            <FieldRow label="วันที่">
              <DateField value={date} onChange={setDate} />
            </FieldRow>

            <View style={{ marginTop: 2, marginBottom: 14 }}>
              <Row gap={6} style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontFamily: type.familySemi, color: t.ink }}>
                  ค่าใช้จ่ายเพิ่มเติม
                </Text>
                <Text style={{ fontSize: 13, color: t.inkMute, fontFamily: type.family }}>
                  · ไม่บังคับ
                </Text>
              </Row>
              <AdditionalCostsEditor
                tone="move"
                rows={additionalCosts}
                onChange={setAdditionalCosts}
              />
            </View>

            <CloseAfterActionToggle
              value={markToClose}
              onChange={setMarkToClose}
              label="ปิดบ่อต้นทางหลังย้าย"
              activeHelper="{pondName} จะถูกพักรอบ จนกว่าจะเริ่มรอบใหม่"
              inactiveHelper="เปิดบ่อต้นทางต่อ — ไม่ปิดรอบ"
              pondName={fromPond ? displayPondName(fromPond.name) : ''}
            />

            {fieldsReady && fromPond ? (
              <View style={{ marginTop: 8 }}>
                <MoveStep1Preview
                  fromText={`${displayPondName(fromPond.name)} · ${fmt.num(fromPond.totalFish)} → ${fmt.num(after.from)}`}
                  toText={
                    toPond
                      ? `${displayPondName(toPond.name)} · ${fmt.num(toPond.totalFish)} → ${fmt.num(after.to)}`
                      : '—'
                  }
                  amountText={`${fmt.num(parseInt(amount || '0', 10))} ตัว`}
                  fishValue={fmt.baht(fishCost)}
                  extraText={fmt.baht(extraTotal)}
                />
              </View>
            ) : null}
          </DimWrap>
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <Col gap={14}>
            {!fieldsReady ? <PickerValidationBanner msg={validationMsg} /> : null}
            <Btn
              tone="move"
              size="lg"
              block
              onPress={() => setStep(2)}
              disabled={
                !fieldsReady ||
                !amount ||
                parseInt(amount || '0', 10) <= 0 ||
                parseFloat(avgWeightKg || '0') <= 0 ||
                parseFloat(pricePerUnit || '0') <= 0 ||
                amountError != null
              }
            >
              ถัดไป
            </Btn>
          </Col>
        </View>
      </ScrollView>
    </View>
  );
}

function countNonEmpty(rows: CostRow[]): number {
  return rows.filter((r) => r.category.trim() || parseFloat(r.amount) > 0).length;
}

function MoveStep1Preview({
  fromText,
  toText,
  amountText,
  fishValue,
  extraText,
}: {
  fromText: string;
  toText: string;
  amountText: string;
  fishValue: string;
  extraText: string;
}) {
  const { t } = useTheme();
  return (
    <View
      style={{
        padding: 16,
        backgroundColor: t.moveSoft,
        borderWidth: 1,
        borderColor: t.moveInk + '30',
        borderRadius: radii.md,
      }}
    >
      <Col gap={6}>
        <PreviewRow label="จาก" value={fromText} />
        <PreviewRow label="ไป" value={toText} />
        <PreviewRow label="จำนวนย้าย" value={amountText} />
        <PreviewRow label="มูลค่าปลา" value={fishValue} bold />
        <PreviewRow label="ค่าใช้จ่ายเพิ่มเติม" value={extraText} bold />
      </Col>
    </View>
  );
}

function PreviewRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  const { t } = useTheme();
  return (
    <Row justify="space-between">
      <Text
        style={{
          color: t.moveInk,
          opacity: bold ? 1 : 0.8,
          fontSize: 13,
          fontFamily: bold ? type.familyBold : type.family,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: t.moveInk,
          fontSize: bold ? 14 : 13,
          fontFamily: bold ? type.familyNumBold : type.familyNumSemi,
        }}
      >
        {value}
      </Text>
    </Row>
  );
}

function MoveCostSplitPanel({
  fromLabel,
  toLabel,
  fishValue,
  halfExtra,
  extraTotal,
  grandTotal,
  sourceFishRevenue,
  sourceAdditionalCost,
  sourceNetEffect,
  destFishCost,
  destAdditionalCost,
  destTotalCost,
}: {
  fromLabel: string;
  toLabel: string;
  fishValue: number;
  halfExtra: number;
  extraTotal: number;
  grandTotal: number;
  sourceFishRevenue: number;
  sourceAdditionalCost: number;
  sourceNetEffect: number;
  destFishCost: number;
  destAdditionalCost: number;
  destTotalCost: number;
}) {
  const { t } = useTheme();
  return (
    <View style={{ marginTop: 18, gap: 12 }}>
      <Text
        style={{
          fontSize: 13,
          fontFamily: type.familyBold,
          color: t.ink,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}
      >
        ผลทางบัญชี
      </Text>
      <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
        บ่อต้นทางบันทึกเป็นการขายปลา · บ่อปลายทางบันทึกเป็นการรับซื้อปลา
        {extraTotal > 0 ? ' · ค่าใช้จ่ายเพิ่มเติมหารครึ่งระหว่างสองบ่อ' : ''}
      </Text>

      <PerspectiveCard
        tone="sell"
        title={`บ่อต้นทาง · ${fromLabel}`}
        subtitle="ขายปลาออก"
        rows={[
          ['มูลค่าปลา (รายได้)', `+${fmt.baht(sourceFishRevenue)}`],
          ['ค่าใช้จ่ายร่วม (ครึ่ง)', `-${fmt.baht(sourceAdditionalCost)}`],
        ]}
        totalLabel="ผลรวม (กระทบ P&L)"
        totalValue={`${sourceNetEffect >= 0 ? '+' : ''}${fmt.baht(sourceNetEffect)}`}
      />

      <PerspectiveCard
        tone="fill"
        title={`บ่อปลายทาง · ${toLabel}`}
        subtitle="รับปลาเข้า"
        rows={[
          ['มูลค่าปลา (ต้นทุน)', fmt.baht(destFishCost)],
          ['ค่าใช้จ่ายร่วม (ครึ่ง)', fmt.baht(destAdditionalCost)],
        ]}
        totalLabel="ต้นทุนรวม"
        totalValue={fmt.baht(destTotalCost)}
      />

      <View
        style={{
          marginTop: 4,
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: t.surface,
          borderWidth: 1.5,
          borderColor: t.border,
          borderRadius: radii.md,
        }}
      >
        <Row justify="space-between" align="baseline">
          <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 13, color: t.ink, fontFamily: type.familySemi }}>
              มูลค่าการย้ายรวม
            </Text>
            <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>
              มูลค่าปลา {fmt.baht(fishValue)}
              {extraTotal > 0 ? ` + ค่าใช้จ่ายเพิ่มเติม ${fmt.baht(extraTotal)}` : ''}
            </Text>
          </Col>
          <Text style={{ fontFamily: type.familyNumBold, fontSize: 18, color: t.ink }}>
            {fmt.baht(grandTotal)}
          </Text>
        </Row>
      </View>
    </View>
  );
}

function PerspectiveCard({
  tone,
  title,
  subtitle,
  rows,
  totalLabel,
  totalValue,
}: {
  tone: 'fill' | 'sell';
  title: string;
  subtitle: string;
  rows: [string, string][];
  totalLabel: string;
  totalValue: string;
}) {
  const { t } = useTheme();
  const accentMap = {
    fill: { fg: t.fillInk, bg: t.fillSoft, border: t.fill },
    sell: { fg: t.sellInk, bg: t.sellSoft, border: t.sell },
  } as const;
  const { fg, bg, border } = accentMap[tone];
  return (
    <View
      style={{
        padding: 14,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border + '60',
        borderLeftWidth: 4,
        borderLeftColor: border,
        borderRadius: radii.md,
      }}
    >
      <Row justify="space-between" align="center" style={{ marginBottom: 10 }}>
        <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 14, color: fg, fontFamily: type.familyBold }}>{title}</Text>
          <Text style={{ fontSize: 11, color: fg, opacity: 0.75, fontFamily: type.family }}>
            {subtitle}
          </Text>
        </Col>
      </Row>
      <Col gap={6}>
        {rows.map(([label, value], i) => (
          <Row key={i} justify="space-between">
            <Text style={{ color: fg, opacity: 0.85, fontSize: 13, fontFamily: type.family }}>
              {label}
            </Text>
            <Text style={{ color: fg, fontSize: 13, fontFamily: type.familyNumSemi }}>
              {value}
            </Text>
          </Row>
        ))}
        <View style={{ height: 1, backgroundColor: fg + '30', marginVertical: 4 }} />
        <Row justify="space-between" align="baseline">
          <Text style={{ color: fg, fontSize: 13, fontFamily: type.familyBold }}>{totalLabel}</Text>
          <Text style={{ color: fg, fontFamily: type.familyNumBold, fontSize: 18 }}>
            {totalValue}
          </Text>
        </Row>
      </Col>
    </View>
  );
}


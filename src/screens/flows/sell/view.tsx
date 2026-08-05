import { useRef, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Btn, Input, Pill, Tappable, TopBar } from '@/components/ui';
import { DateField } from '@/components/date-selector';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { fmt, FISH_TH, displayFarmName, displayPondName } from '@/utils/fmt';
import { thaiDate } from '@/locale/thaiDate';
import type { FarmModel } from '@/features/farm';
import type { PondModel } from '@/features/pond';
import type { MerchantModel } from '@/features/merchant';
import type { SizeGradeModel } from '@/features/size-grade';
import { BottomBar, CloseAfterActionToggle, FieldRow, FlowBackBtn, NoteField } from '../shared';
import { DimWrap, InlineFarmPondPicker, PickerValidationBanner, useAutoAdvance } from '../picker';
import { AdditionalCostsEditor, type CostRow } from '../additional-costs';
import {
  AdditionalCostsList,
  GrandTotalBlock,
  ReviewRow,
  ReviewSection,
  WarningBanner,
} from '../review';
import type { SellRow } from './hook';
import { MerchantSheet } from './components/MerchantSheet';
import { SizeGradeSheet } from './components/SizeGradeSheet';
import { SheetMerchantForm } from '@/screens/merchants/components/SheetMerchantForm';
import { apiErrorMessage, apiErrorStatus } from '@/shared/http';

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
  merchants: MerchantModel[];
  sizeGrades: SizeGradeModel[];
  step: 1 | 2;
  setStep: (s: 1 | 2) => void;
  rows: SellRow[];
  addRow: () => void;
  removeRow: (id: string) => void;
  updateRow: (id: string, patch: Partial<SellRow>) => void;
  merchantId: number | null;
  setMerchantId: (id: number) => void;
  merchant: MerchantModel | null;
  createAndSelectMerchant: (payload: {
    name: string;
    contactNumber: string;
    location: string;
  }) => Promise<MerchantModel>;
  creatingMerchant: boolean;
  subtotals: number[];
  grossRevenue: number;
  additionalCosts: CostRow[];
  setAdditionalCosts: (rows: CostRow[]) => void;
  extraTotal: number;
  netRevenue: number;
  totalFishCount: number;
  fishCountError: string | null;
  sourceStock: number;
  canSubmit: boolean;
  date: Date;
  setDate: (d: Date) => void;
  markToClose: boolean;
  setMarkToClose: (v: boolean) => void;
  remark: string;
  setRemark: (v: string) => void;
  handleConfirm: () => void;
  isPending: boolean;
  goBack: () => void;
};

export function SellView(props: Props) {
  const { step } = props;
  if (step === 2) return <SellStep2 {...props} />;
  return <SellStep1 {...props} />;
}

// ─── Step 1: form ────────────────────────────────────────────────────────────

function SellStep1({
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
  merchants,
  sizeGrades,
  setStep,
  rows,
  addRow,
  removeRow,
  updateRow,
  merchantId,
  setMerchantId,
  createAndSelectMerchant,
  creatingMerchant,
  subtotals,
  grossRevenue,
  additionalCosts,
  setAdditionalCosts,
  fishCountError,
  sourceStock,
  canSubmit,
  date,
  setDate,
  markToClose,
  setMarkToClose,
  remark,
  setRemark,
  goBack,
}: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const fieldsReady = pond != null;

  const { scrollRef, scrollToAnchor } = useAutoAdvance();
  const pondAnchorRef = useRef<View | null>(null);
  const formAnchorRef = useRef<View | null>(null);

  // Sheet state lives here — the sell rows editor and merchant picker each
  // just emit "open" requests. `gradeRowId` tracks which row we're picking
  // for; clearing both fields effectively closes any open sheet.
  // `merchant-add` swaps the picker for the inline create form.
  const [sheet, setSheet] = useState<'grade' | 'merchant' | 'merchant-add' | null>(null);
  const [gradeRowId, setGradeRowId] = useState<string | null>(null);
  const closeSheet = () => {
    setSheet(null);
    setGradeRowId(null);
  };
  const gradeRow = gradeRowId ? rows.find((r) => r.id === gradeRowId) ?? null : null;

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
        title={tx('flows.sell.title')}
        subtitle={
          fromFab && !pond
            ? tx('flows.sell.pickFarmPond')
            : pond
              ? `${displayPondName(pond.name)}${pond.farmName ? ` · ${displayFarmName(pond.farmName)}` : ''}`
              : undefined
        }
        leading={<FlowBackBtn step={1} onPress={goBack} />}
        trailing={<Pill tone="sell">{tx('flows.step1')}</Pill>}
      />

      <ScrollView
        delaysContentTouches={false}
        ref={scrollRef}
        contentContainerStyle={{ padding: 0, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {fromFab ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
            <InlineFarmPondPicker
              action="sell"
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

        <View ref={formAnchorRef} />
        <View style={{ padding: 20 }}>
          <DimWrap
            ready={fieldsReady}
            hint={fromFab ? tx('flows.sell.pickFarmPondFirst') : undefined}
          >
            {pond ? <SourcePondCard pond={pond} /> : null}

            <FieldRow label={tx('flows.sell.sellDateReq')}>
              <DateField value={date} onChange={setDate} />
            </FieldRow>

            <SellRowsEditor
              rows={rows}
              sizeGrades={sizeGrades}
              subtotals={subtotals}
              grossRevenue={grossRevenue}
              fishCountError={fishCountError}
              onAdd={addRow}
              onRemove={removeRow}
              onUpdate={updateRow}
              onOpenGrade={(rowId) => {
                setGradeRowId(rowId);
                setSheet('grade');
              }}
            />

            <FieldRow label={tx('flows.sell.buyerReq')}>
              <MerchantField
                merchant={merchants.find((m) => m.id === merchantId) ?? null}
                onOpen={() => setSheet('merchant')}
              />
            </FieldRow>

            <FieldRow label={tx('flows.extraCost')} optional>
              <AdditionalCostsEditor
                tone="sell"
                rows={additionalCosts}
                onChange={setAdditionalCosts}
              />
            </FieldRow>

            <CloseAfterActionToggle
              value={markToClose}
              onChange={setMarkToClose}
              label={tx('flows.sell.closeAfter')}
              activeHelper={tx('flows.closeStatus')}
              inactiveHelper={tx('flows.sell.keepOpenSub')}
              pondName={pond ? displayPondName(pond.name) : ''}
            />

            <FieldRow label={tx('flows.notes')}>
              <NoteField value={remark} onChange={setRemark} />
            </FieldRow>

            {fieldsReady && sourceStock > 0 ? (
              <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
                {tx('flows.sell.stockInPond', { count: fmt.num(sourceStock) })}
              </Text>
            ) : null}
          </DimWrap>
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <Col gap={14}>
            {!fieldsReady ? <PickerValidationBanner msg={validationMsg} /> : null}
            <Btn
              tone="sell"
              size="lg"
              block
              onPress={() => setStep(2)}
              disabled={!canSubmit}
            >
              {tx('daily.next')}
            </Btn>
          </Col>
        </View>
      </ScrollView>

      {/* Sheets render above the form. Only one can be open at a time — the
          state machine in `sheet` enforces it, and BottomSheet's own backdrop
          handles dismiss on outside tap. */}
      <SizeGradeSheet
        visible={sheet === 'grade' && gradeRow != null}
        // Hide grades already chosen by other rows so the user can't double-
        // book a size. The current row's own pick stays in the list so it
        // remains visible as the active selection.
        grades={sizeGrades.filter(
          (g) =>
            g.id === gradeRow?.gradeId ||
            !rows.some((r) => r.id !== gradeRowId && r.gradeId === g.id),
        )}
        selectedId={gradeRow?.gradeId ?? null}
        onPick={(gradeId) => {
          if (gradeRowId) updateRow(gradeRowId, { gradeId });
          closeSheet();
        }}
        onClose={closeSheet}
      />
      <MerchantSheet
        visible={sheet === 'merchant'}
        merchants={merchants}
        selectedId={merchantId}
        onPick={(id) => {
          setMerchantId(id);
          closeSheet();
        }}
        onAddNew={() => setSheet('merchant-add')}
        onClose={closeSheet}
      />

      {/* Inline create — swaps in over the picker. Cancel returns to the
          picker; a successful save auto-selects the new merchant and closes. */}
      <SheetMerchantForm
        visible={sheet === 'merchant-add'}
        editing={null}
        saving={creatingMerchant}
        onClose={() => setSheet('merchant')}
        onSubmit={async (payload) => {
          try {
            await createAndSelectMerchant(payload);
            closeSheet();
          } catch (err) {
            Alert.alert(
              tx('flows.sell.addBuyerFailed'),
              apiErrorStatus(err) === 409
                ? tx('flows.sell.duplicateContact')
                : apiErrorMessage(err, tx('flows.saveFailed')),
            );
          }
        }}
      />
    </View>
  );
}

// ─── Step 2: review ──────────────────────────────────────────────────────────

function SellStep2({
  pond,
  rows,
  sizeGrades,
  subtotals,
  grossRevenue,
  additionalCosts,
  extraTotal,
  netRevenue,
  merchant,
  date,
  markToClose,
  remark,
  handleConfirm,
  isPending,
  goBack,
}: Props) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  if (!pond) return null;
  const pondLabel = displayPondName(pond.name);
  const farmLabel = pond.farmName ? displayFarmName(pond.farmName) : '';
  const visibleRows = rows.filter((_, i) => subtotals[i]! > 0 || rows.length === 1);
  const gradeName = (gradeId: number | null) =>
    gradeId == null ? '—' : (sizeGrades.find((g) => g.id === gradeId)?.name ?? '—');

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        title={tx('flows.reviewConfirm')}
        subtitle={tx('flows.sell.titleWith', { pond: pondLabel })}
        leading={<FlowBackBtn step={2} onPress={goBack} />}
        trailing={<Pill tone="sell">{tx('flows.step2')}</Pill>}
      />
      <ScrollView
        delaysContentTouches={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero — net revenue */}
        <View
          style={{
            paddingTop: 20,
            paddingBottom: 18,
            paddingHorizontal: 18,
            backgroundColor: t.sellSoft,
            borderWidth: 1.5,
            borderColor: t.sell + '40',
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
              backgroundColor: t.sell,
            }}
          >
            <Icon.tag size={14} color="#ffffff" stroke={2.4} />
            <Text style={{ color: '#ffffff', fontSize: 14, fontFamily: type.familyBold }}>
              {tx('flows.sell.title')}
            </Text>
          </View>
          <Text
            style={{
              marginTop: 12,
              fontFamily: type.familyNumBold,
              fontSize: 32,
              color: t.sellInk,
              letterSpacing: -0.8,
              lineHeight: 36,
            }}
          >
            {fmt.baht(grossRevenue)}
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontSize: 14,
              color: t.sellInk,
              opacity: 0.85,
              fontFamily: type.family,
            }}
          >
            {tx('flows.sell.grossBefore')}
          </Text>
        </View>

        <ReviewSection title={tx('flows.general')}>
          <ReviewRow
            l={tx('flows.sell.pondSold')}
            v={farmLabel ? `${pondLabel} · ${farmLabel}` : pondLabel}
          />
          <ReviewRow l={tx('flows.sell.sellDate')} v={thaiDate.long(date)} />
          <ReviewRow l={tx('flows.sell.buyer')} v={merchant?.name ?? '—'} />
          <ReviewRow
            l={tx('flows.sell.afterSale')}
            v={
              markToClose
                ? tx('flows.closePondNamed', { pond: pondLabel })
                : tx('flows.sell.keepOpen')
            }
            last
          />
        </ReviewSection>

        <ReviewSection title={tx('flows.sell.linesCount', { count: visibleRows.length })}>
          {rows.map((r, i) => {
            const sub = subtotals[i] ?? 0;
            return (
              <View
                key={r.id}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: i === rows.length - 1 ? 0 : 1,
                  borderBottomColor: t.border + '80',
                }}
              >
                <Row justify="space-between">
                  <Col gap={2} style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontFamily: type.familyBold, color: t.ink }}>
                      {gradeName(r.gradeId)}
                    </Text>
                    <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
                      {fmt.kg(parseFloat(r.weightKg || '0'))} ·{' '}
                      {tx('flows.sell.perKgLine', {
                        price: fmt.baht(parseFloat(r.pricePerKg || '0')),
                      })}
                      {r.fishCount
                        ? tx('flows.sell.fishCountLine', {
                            count: fmt.num(parseInt(r.fishCount, 10)),
                          })
                        : ''}
                    </Text>
                  </Col>
                  <Text
                    style={{
                      fontFamily: type.familyNumBold,
                      fontSize: 15,
                      color: t.sellInk,
                    }}
                  >
                    {fmt.baht(sub)}
                  </Text>
                </Row>
              </View>
            );
          })}
        </ReviewSection>

        <ReviewSection title={tx('flows.sell.revenueSummary')}>
          <ReviewRow l={tx('flows.sell.grossRevenue')} v={fmt.baht(grossRevenue)} />
          {extraTotal > 0 ? (
            <ReviewRow l={tx('flows.extraCosts')} v={`-${fmt.baht(extraTotal)}`} />
          ) : null}
          <ReviewRow l={tx('flows.sell.netRevenue')} v={fmt.baht(netRevenue)} last />
        </ReviewSection>

        {extraTotal > 0 ? (
          <ReviewSection
            title={tx('flows.extraCostsCount', { count: countNonEmpty(additionalCosts) })}
          >
            <AdditionalCostsList rows={additionalCosts} signed="-" />
          </ReviewSection>
        ) : null}

        <GrandTotalBlock
          tone="sell"
          label={tx('flows.sell.netIncome')}
          value={fmt.baht(netRevenue)}
        />

        {remark ? (
          <ReviewSection title={tx('flows.notes')}>
            <Text
              style={{
                paddingVertical: 12,
                fontSize: 14,
                color: t.ink,
                fontFamily: type.family,
              }}
            >
              {remark}
            </Text>
          </ReviewSection>
        ) : null}

        <WarningBanner />
      </ScrollView>
      <BottomBar>
        <Btn
          tone="sell"
          size="lg"
          block
          onPress={handleConfirm}
          disabled={isPending}
        >
          {isPending ? tx('common.saving') : tx('flows.sell.confirm')}
        </Btn>
      </BottomBar>
    </View>
  );
}

// ─── Source pond hero card ───────────────────────────────────────────────────

// Anatomy (Sell · Step 1 — ④ Anatomy → "Pond context hero"): fish-tile · stock
// count + inline "ตัว" · species pill, all on a sell-tinted card.
function SourcePondCard({ pond }: { pond: PondModel }) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const fishTypes = pond.fishTypes
    .map((f) => FISH_TH[f] ?? f)
    .filter(Boolean)
    .join(', ');
  return (
    <View
      style={{
        marginBottom: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: t.sellSoft,
        borderWidth: 1.5,
        borderColor: t.sell + '40',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.55)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon.fish size={22} color={t.sellInk} stroke={1.8} />
      </View>
      <Col gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontSize: 11,
            color: t.inkMute,
            fontFamily: type.familySemi,
          }}
        >
          {tx('flows.sell.currentStock')}
        </Text>
        <Text
          style={{
            fontFamily: type.familyNumBold,
            fontSize: 26,
            color: t.sellInk,
            letterSpacing: -0.5,
            lineHeight: 30,
          }}
        >
          {fmt.num(pond.totalFish)}
          <Text
            style={{
              fontFamily: type.familyNum,
              fontSize: 13,
              color: t.sellInk,
              opacity: 0.7,
            }}
          >
            {' '}
            {tx('unit.fish')}
          </Text>
        </Text>
      </Col>
      <Col gap={6} align="flex-end" style={{ minWidth: 0 }}>
        <Text
          style={{
            fontSize: 11,
            color: t.inkMute,
            fontFamily: type.familySemi,
          }}
        >
          {tx('flows.sell.speciesInPond')}
        </Text>
        <Pill tone="sell">{fishTypes || '—'}</Pill>
      </Col>
    </View>
  );
}

// ─── Sell rows editor ───────────────────────────────────────────────────────

function SellRowsEditor({
  rows,
  sizeGrades,
  subtotals,
  grossRevenue,
  fishCountError,
  onAdd,
  onRemove,
  onUpdate,
  onOpenGrade,
}: {
  rows: SellRow[];
  sizeGrades: SizeGradeModel[];
  subtotals: number[];
  grossRevenue: number;
  fishCountError: string | null;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<SellRow>) => void;
  onOpenGrade: (rowId: string) => void;
}) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  return (
    <View style={{ marginTop: 2, marginBottom: 14 }}>
      <Row gap={8} justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Text style={{ fontSize: 13, fontFamily: type.familySemi, color: t.ink }}>
          {tx('flows.sell.speciesSold')}
          <Text style={{ color: t.danger }}> *</Text>
        </Text>
        <Tappable
          onPress={onAdd}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 9999,
            backgroundColor: 'transparent',
          }}
        >
          <Row gap={4} align="center">
            <Icon.plus size={14} color={t.sellInk} stroke={2.4} />
            <Text style={{ fontSize: 13, color: t.sellInk, fontFamily: type.familySemi }}>
              {tx('flows.sell.addSizeRow')}
            </Text>
          </Row>
        </Tappable>
      </Row>

      <Col gap={10}>
        {rows.map((r, i) => (
          <SellRowEditor
            key={r.id}
            row={r}
            sizeGrades={sizeGrades}
            subtotal={subtotals[i] ?? 0}
            canRemove={rows.length > 1}
            onChange={(patch) => onUpdate(r.id, patch)}
            onRemove={() => onRemove(r.id)}
            onOpenGrade={() => onOpenGrade(r.id)}
          />
        ))}
      </Col>

      <View
        style={{
          marginTop: 10,
          padding: 14,
          borderRadius: radii.md,
          backgroundColor: t.sellSoft,
          borderWidth: 1,
          borderColor: t.sell + '30',
        }}
      >
        <Row justify="space-between" align="baseline">
          <Text style={{ fontSize: 13, color: t.sellInk, fontFamily: type.familySemi }}>
            {tx('flows.sell.grossRevenue')}
          </Text>
          <Text
            style={{
              fontFamily: type.familyNumBold,
              fontSize: 18,
              color: t.sellInk,
              letterSpacing: -0.3,
            }}
          >
            {fmt.baht(grossRevenue)}
          </Text>
        </Row>
      </View>

      {fishCountError ? (
        <Text
          style={{
            marginTop: 8,
            fontSize: 12,
            color: t.danger,
            fontFamily: type.familySemi,
          }}
        >
          {fishCountError}
        </Text>
      ) : null}
    </View>
  );
}

function SellRowEditor({
  row,
  sizeGrades,
  subtotal,
  canRemove,
  onChange,
  onRemove,
  onOpenGrade,
}: {
  row: SellRow;
  sizeGrades: SizeGradeModel[];
  subtotal: number;
  canRemove: boolean;
  onChange: (patch: Partial<SellRow>) => void;
  onRemove: () => void;
  onOpenGrade: () => void;
}) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  const grade = row.gradeId == null ? null : sizeGrades.find((g) => g.id === row.gradeId) ?? null;
  return (
    <View
      style={{
        padding: 14,
        borderRadius: radii.md,
        backgroundColor: t.surface,
        borderWidth: 1.5,
        borderColor: t.border,
      }}
    >
      {/* Top: grade pill (opens bottom-sheet) + trash. The pill switches
          between a solid sell-soft chip (picked) and a dashed outlined chip
          (empty) so the empty state is clearly inviting a tap. */}
      <Row justify="space-between" align="center" style={{ marginBottom: 10 }}>
        <Tappable onPress={onOpenGrade} hitSlop={6}>
          <Row gap={6} align="center">
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 9999,
                backgroundColor: grade ? t.sellSoft : 'transparent',
                borderWidth: 1.5,
                borderColor: grade ? t.sell + '30' : t.sell + '60',
                borderStyle: grade ? 'solid' : 'dashed',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Text
                style={{
                  color: t.sellInk,
                  fontFamily: grade ? type.familyBold : type.familySemi,
                  fontSize: 13,
                }}
              >
                {grade ? grade.name : tx('flows.sell.pickSize')}
              </Text>
              <Icon.chevR size={12} color={t.sellInk} />
            </View>
          </Row>
        </Tappable>
        <Tappable
          onPress={onRemove}
          disabled={!canRemove}
          hitSlop={8}
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            borderWidth: 1,
            borderColor: canRemove ? t.border : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: canRemove ? 1 : 0.4,
          }}
        >
          <Icon.trash size={15} color={canRemove ? t.danger : t.inkMute} />
        </Tappable>
      </Row>

      <Row gap={8} align="flex-start" style={{ marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <FieldLabel required>{tx('flows.weight')}</FieldLabel>
          <Input
            keyboardType="decimal-pad"
            suffix={tx('unit.kg')}
            value={row.weightKg}
            onChangeText={(v) => onChange({ weightKg: v })}
            placeholder="0.0"
            containerStyle={rowInputStyle}
          />
        </View>
        <View style={{ flex: 1 }}>
          <FieldLabel required>{tx('flows.pricePerKg')}</FieldLabel>
          <Input
            keyboardType="decimal-pad"
            suffix={tx('flows.bahtPerKg')}
            value={row.pricePerKg}
            onChangeText={(v) => onChange({ pricePerKg: v })}
            placeholder="0"
            containerStyle={rowInputStyle}
          />
        </View>
      </Row>

      <View style={{ marginBottom: 10 }}>
        <FieldLabel required>{tx('flows.countFish')}</FieldLabel>
        <Input
          keyboardType="number-pad"
          suffix={tx('unit.fish')}
          value={row.fishCount}
          onChangeText={(v) => onChange({ fishCount: v })}
          placeholder="0"
          containerStyle={rowInputStyle}
        />
      </View>

      <Row
        justify="space-between"
        align="baseline"
        style={{
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: t.border,
        }}
      >
        <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.familySemi }}>
          {tx('flows.sell.subtotal')}
        </Text>
        <Text
          style={{
            fontFamily: type.familyNumBold,
            fontSize: 17,
            color: subtotal > 0 ? t.sellInk : t.inkMute,
          }}
        >
          {fmt.baht(subtotal)}
        </Text>
      </Row>
    </View>
  );
}

const rowInputStyle = {
  height: 48,
  borderRadius: radii.sm,
  paddingHorizontal: 12,
} as const;

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  const { t } = useTheme();
  return (
    <Text
      style={{
        fontSize: 11,
        color: t.inkMute,
        fontFamily: type.familySemi,
        marginBottom: 4,
      }}
    >
      {children}
      {required ? <Text style={{ color: t.sell }}> *</Text> : null}
    </Text>
  );
}

// ─── Merchant field (select-style trigger) ──────────────────────────────────

/**
 * Replaces the old MerchantPicker. Renders a 52px select-style row that opens
 * the merchant bottom-sheet — even when the merchant list is empty, so the
 * empty-state guidance lives in the sheet rather than inline.
 */
function MerchantField({
  merchant,
  onOpen,
}: {
  merchant: MerchantModel | null;
  onOpen: () => void;
}) {
  const { t } = useTheme();
  const { t: tx } = useTranslation();
  return (
    <Tappable
      onPress={onOpen}
      style={{
        width: '100%',
        minHeight: 52,
        paddingHorizontal: 14,
        borderRadius: radii.md,
        backgroundColor: t.surface,
        borderWidth: 1.5,
        borderColor: t.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          backgroundColor: t.surfaceAlt ?? t.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon.user size={14} color={t.inkSoft} />
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: 15,
          color: merchant ? t.ink : t.inkMute,
          fontFamily: merchant ? type.familySemi : type.family,
        }}
        numberOfLines={1}
      >
        {merchant ? merchant.name : tx('flows.sell.pickBuyer')}
      </Text>
      <Icon.chevR size={16} color={t.inkSoft} />
    </Tappable>
  );
}

function countNonEmpty(rows: CostRow[]): number {
  return rows.filter((r) => r.category.trim() || parseFloat(r.amount) > 0).length;
}

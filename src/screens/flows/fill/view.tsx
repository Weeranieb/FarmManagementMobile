import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';
import { Btn, Input, TopBar } from '@/components/ui';
import { Row } from '@/components/layout/Row';
import { fmt, FISH_TH } from '@/utils/fmt';
import type { PondModel } from '@/features/pond';
import { BottomBar, FieldRow, FishPicker, FlowBackBtn, PreviewCard } from '../shared';

type Props = {
  pond: PondModel;
  step: 1 | 2;
  setStep: (s: 1 | 2) => void;
  fishType: string;
  setFishType: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  pricePerUnit: string;
  setPricePerUnit: (v: string) => void;
  remark: string;
  setRemark: (v: string) => void;
  total: number;
  handleConfirm: () => void;
  isPending: boolean;
  goBack: () => void;
};

export function FillView({
  pond,
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
  isPending,
  goBack,
}: Props) {
  const { t } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        title={step === 1 ? `เติมปลา · ${pond.name}` : 'ตรวจสอบข้อมูล'}
        leading={<FlowBackBtn step={step} onPress={goBack} />}
      />

      {step === 1 ? (
        <>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
            <FieldRow label="ชนิดปลา">
              <FishPicker
                types={['nil', 'kaphong', 'kang', 'duk']}
                selected={fishType}
                onChange={setFishType}
              />
            </FieldRow>
            <FieldRow label="จำนวน" hint="หน่วย: ตัว">
              <Input
                big
                keyboardType="numeric"
                suffix="ตัว"
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
              />
            </FieldRow>
            <FieldRow label="ราคาต่อตัว" hint="บาท / ตัว">
              <Input
                big
                keyboardType="numeric"
                suffix="฿/ตัว"
                value={pricePerUnit}
                onChangeText={setPricePerUnit}
                placeholder="0"
              />
            </FieldRow>
            <FieldRow label="หมายเหตุ" optional>
              <Input value={remark} onChangeText={setRemark} placeholder="เช่น เริ่มรอบใหม่" />
            </FieldRow>
            <View style={{ marginTop: 8 }}>
              <PreviewCard
                tone="fill"
                rows={[
                  ['ชนิด', FISH_TH[fishType] ?? fishType],
                  ['จำนวน', `${fmt.num(parseInt(amount || '0', 10))} ตัว`],
                  ['ราคาต่อตัว', `${fmt.baht(parseFloat(pricePerUnit || '0'))}/ตัว`],
                ]}
                total={fmt.baht(total)}
              />
            </View>
          </ScrollView>
          <BottomBar>
            <Btn tone="fill" size="lg" block onPress={() => setStep(2)}>
              ถัดไป
            </Btn>
          </BottomBar>
        </>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 120 }}>
            <Text style={{ fontSize: 22, fontFamily: type.familyBold, color: t.ink }}>
              เติมปลาที่ {pond.name}
            </Text>
            <PreviewCard
              tone="fill"
              rows={[
                ['ชนิด', FISH_TH[fishType] ?? fishType],
                ['จำนวน', `${fmt.num(parseInt(amount || '0', 10))} ตัว`],
                ['ราคาต่อตัว', `${fmt.baht(parseFloat(pricePerUnit || '0'))}/ตัว`],
                ['หมายเหตุ', remark || '—'],
              ]}
              total={fmt.baht(total)}
            />
            <Text style={{ color: t.inkSoft, fontSize: 13, fontFamily: type.family }}>
              ยืนยันการบันทึกหรือไม่? กิจกรรมนี้จะปรากฏในประวัติของบ่อ
            </Text>
          </ScrollView>
          <BottomBar>
            <Row gap={8}>
              <Btn
                tone="fill"
                variant="ghost"
                size="lg"
                style={{ flex: 1 }}
                onPress={() => setStep(1)}
              >
                แก้ไข
              </Btn>
              <Btn
                tone="fill"
                size="lg"
                style={{ flex: 1 }}
                onPress={handleConfirm}
                disabled={isPending}
              >
                {isPending ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </Btn>
            </Row>
          </BottomBar>
        </>
      )}
    </View>
  );
}

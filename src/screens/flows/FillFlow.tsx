import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Btn, Input, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row } from '@/components/layout/Row';
import { FieldRow, FishPicker, PreviewCard } from './FlowShared';
import { fmt, FISH_TH } from '@/utils/fmt';
import { ponds } from '@/mock/data';
import { useFillPond } from '@/api/queries';
import { useAuthStore } from '@/store/auth';

type Props = {
  pondId: number;
  onClose?: () => void;
};

export function FillFlow({ pondId, onClose }: Props) {
  const { t } = useTheme();
  const pond = ponds.find((p) => p.id === pondId) ?? ponds[0];
  const [step, setStep] = useState<1 | 2>(1);
  const [fishType, setFishType] = useState<string>(pond?.fishTypes[0] ?? 'nil');
  const [amount, setAmount] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
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

  const total = useMemo(() => {
    const a = parseFloat(amount) || 0;
    const p = parseFloat(pricePerUnit) || 0;
    return Math.round(a * p);
  }, [amount, pricePerUnit]);

  if (!pond) return null;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        title={step === 1 ? `เติมปลา · ${pond.name}` : 'ตรวจสอบข้อมูล'}
        leading={
          <Pressable
            onPress={step === 1 ? onClose : () => setStep(1)}
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: t.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {step === 1 ? (
              <Icon.x size={18} color={t.ink} />
            ) : (
              <Icon.back size={18} color={t.ink} />
            )}
          </Pressable>
        }
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
                disabled={fillMutation.isPending}
              >
                {fillMutation.isPending ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </Btn>
            </Row>
          </BottomBar>
        </>
      )}
    </View>
  );
}

function BottomBar({ children }: { children: React.ReactNode }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        backgroundColor: t.bg,
        borderTopWidth: 1,
        borderTopColor: t.border,
      }}
    >
      {children}
    </View>
  );
}

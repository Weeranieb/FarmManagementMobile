import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { Btn, Input, Pill, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { FieldRow, PreviewCard } from './FlowShared';
import { fmt, FISH_TH } from '@/utils/fmt';
import { ponds } from '@/mock/data';
import { useMovePond } from '@/api/queries';
import { useAuthStore } from '@/store/auth';

type Props = {
  pondId: number;
  onClose?: () => void;
};

export function MoveFlow({ pondId, onClose }: Props) {
  const { t } = useTheme();
  const fromPond = ponds.find((p) => p.id === pondId) ?? ponds[0];
  const candidates = ponds.filter((p) => p.id !== pondId && p.status === 'active');
  const [toId, setToId] = useState<number>(candidates[0]?.id ?? -1);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const toPond = candidates.find((p) => p.id === toId);
  const moveMutation = useMovePond(pondId);
  const isAuthed = useAuthStore((s) => s.token != null);

  const handleConfirm = async () => {
    if (!isAuthed || !toPond) {
      onClose?.();
      return;
    }
    try {
      await moveMutation.mutateAsync({
        toPondId: toPond.id,
        amount: parseInt(amount || '0', 10),
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
    const a = parseInt(amount || '0', 10);
    return {
      from: Math.max(0, (fromPond?.totalFish ?? 0) - a),
      to: (toPond?.totalFish ?? 0) + a,
    };
  }, [amount, fromPond, toPond]);

  if (!fromPond) return null;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        title={step === 1 ? `ย้ายปลา · ${fromPond.name}` : 'ตรวจสอบข้อมูล'}
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
            <FieldRow label="จำนวนที่ย้าย" hint="หน่วย: ตัว">
              <Input
                big
                keyboardType="numeric"
                suffix="ตัว"
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
              />
            </FieldRow>

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
                          <Text style={{ fontFamily: type.familyBold, fontSize: 14, color: t.ink }}>
                            {p.name}
                          </Text>
                          <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
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

            <View style={{ marginTop: 8 }}>
              <PreviewCard
                tone="move"
                rows={[
                  [
                    'จาก',
                    `${fromPond.name} · ${fmt.num(fromPond.totalFish)} → ${fmt.num(after.from)}`,
                  ],
                  [
                    'ไป',
                    toPond
                      ? `${toPond.name} · ${fmt.num(toPond.totalFish)} → ${fmt.num(after.to)}`
                      : '—',
                  ],
                ]}
                totalLabel="จำนวนย้าย"
                total={`${fmt.num(parseInt(amount || '0', 10))} ตัว`}
              />
            </View>
          </ScrollView>
          <BottomBar>
            <Btn
              tone="move"
              size="lg"
              block
              onPress={() => setStep(2)}
              disabled={!toPond || !amount}
            >
              ถัดไป
            </Btn>
          </BottomBar>
        </>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 120 }}>
            <Text style={{ fontSize: 22, fontFamily: type.familyBold, color: t.ink }}>
              ย้าย {fmt.num(parseInt(amount || '0', 10))} ตัว
            </Text>
            <PreviewCard
              tone="move"
              rows={[
                ['จาก', fromPond.name],
                ['ไป', toPond?.name ?? '—'],
                ['หลังย้าย (ต้นทาง)', `${fmt.num(after.from)} ตัว`],
                ['หลังย้าย (ปลายทาง)', `${fmt.num(after.to)} ตัว`],
              ]}
              totalLabel="จำนวนย้าย"
              total={`${fmt.num(parseInt(amount || '0', 10))} ตัว`}
            />
          </ScrollView>
          <BottomBar>
            <Row gap={8}>
              <Btn
                tone="move"
                variant="ghost"
                size="lg"
                style={{ flex: 1 }}
                onPress={() => setStep(1)}
              >
                แก้ไข
              </Btn>
              <Btn
                tone="move"
                size="lg"
                style={{ flex: 1 }}
                onPress={handleConfirm}
                disabled={moveMutation.isPending}
              >
                {moveMutation.isPending ? 'กำลังบันทึก...' : 'ยืนยัน'}
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

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, type } from '@/theme/tokens';
import { warnInk } from '@/theme/ink';
import { Btn, Card, Input, Pill, TopBar } from '@/components/ui';
import { Icon } from '@/components/icons';
import { Row, Col } from '@/components/layout/Row';
import { thaiDate, TH_WEEKDAYS_SHORT } from '@/locale/thaiDate';
import { dailyLog, ponds, today } from '@/mock/data';

type Props = {
  pondId?: number;
  onBack?: () => void;
  showHeader?: boolean;
};

export function DailyLogScreen({ pondId = dailyLog.pondId, onBack, showHeader = true }: Props) {
  const { t, mode } = useTheme();
  const pond = ponds.find((p) => p.id === pondId) ?? ponds[0];
  const monthDate = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), []);
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const todayDate = today.getDate();
  const [selectedDay, setSelectedDay] = useState<number>(todayDate);
  const hasData = useMemo(() => new Set(dailyLog.entries.map((e) => e.day)), []);
  const entry = dailyLog.entries.find((e) => e.day === selectedDay);

  const [freshMorning, setFreshMorning] = useState(entry?.freshMorning?.toString() ?? '');
  const [freshEvening, setFreshEvening] = useState(entry?.freshEvening?.toString() ?? '');
  const [pelletMorning, setPelletMorning] = useState(entry?.pelletMorning?.toString() ?? '');
  const [pelletEvening, setPelletEvening] = useState(entry?.pelletEvening?.toString() ?? '');
  const [deaths, setDeaths] = useState(entry?.deathFishCount?.toString() ?? '');
  const [tourist, setTourist] = useState(entry?.touristCatchCount?.toString() ?? '');

  const selectedFullDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), selectedDay);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {showHeader ? (
        <TopBar
          title={pond?.name ?? 'บันทึกอาหาร'}
          subtitle={pond?.farmName}
          leading={
            onBack ? (
              <Pressable
                onPress={onBack}
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
                <Icon.back size={18} color={t.ink} />
              </Pressable>
            ) : null
          }
        />
      ) : null}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        <Row
          justify="space-between"
          style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 }}
        >
          <Pressable
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
            <Icon.chevL size={18} color={t.ink} />
          </Pressable>
          <Col gap={1} align="center">
            <Text style={{ fontFamily: type.familyBold, fontSize: 17, color: t.ink }}>
              {thaiDate.monthYear(monthDate)}
            </Text>
            <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.family }}>
              เลือกวันเพื่อบันทึก
            </Text>
          </Col>
          <Pressable
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
            <Icon.chevR size={18} color={t.ink} />
          </Pressable>
        </Row>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 14 }}
        >
          <Row gap={6}>
            {days.map((d) => {
              const sel = d === selectedDay;
              const has = hasData.has(d);
              const isFuture = d > todayDate;
              const dt = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
              return (
                <Pressable
                  key={d}
                  disabled={isFuture}
                  onPress={() => setSelectedDay(d)}
                  style={{
                    minWidth: 46,
                    height: 64,
                    borderRadius: 12,
                    backgroundColor: sel ? t.brand : isFuture ? t.surfaceAlt : t.surface,
                    borderWidth: 1,
                    borderColor: sel ? t.brand : t.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 4,
                    gap: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      color: sel ? '#fff' : isFuture ? t.inkMute : t.inkSoft,
                      fontFamily: type.familyMedium,
                    }}
                  >
                    {TH_WEEKDAYS_SHORT[dt.getDay()]}
                  </Text>
                  <Text
                    style={{
                      fontFamily: type.familyNumBold,
                      fontSize: 17,
                      color: sel ? '#fff' : isFuture ? t.inkMute : t.ink,
                    }}
                  >
                    {d}
                  </Text>
                  {has && !sel ? (
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: t.success,
                      }}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </Row>
        </ScrollView>

        <View style={{ paddingHorizontal: 20 }}>
          <Card padded={false}>
            <View style={{ padding: 16, paddingBottom: 6 }}>
              <Row justify="space-between">
                <Text style={{ fontSize: 15, fontFamily: type.familyBold, color: t.ink }}>
                  {thaiDate.long(selectedFullDate)}
                </Text>
                {entry ? (
                  <Pill tone="success">
                    <Row gap={4}>
                      <Icon.check size={11} color={t.statusActive} />
                      <Text
                        style={{
                          color: t.statusActive,
                          fontSize: 12,
                          fontFamily: type.familyMedium,
                        }}
                      >
                        บันทึกแล้ว
                      </Text>
                    </Row>
                  </Pill>
                ) : (
                  <Pill tone="warn">
                    <Row gap={4}>
                      <Icon.clock size={11} color={warnInk(mode, t)} />
                      <Text
                        style={{
                          color: warnInk(mode, t),
                          fontSize: 12,
                          fontFamily: type.familyMedium,
                        }}
                      >
                        ยังไม่บันทึก
                      </Text>
                    </Row>
                  </Pill>
                )}
              </Row>
            </View>
            <FeedSection
              title="เหยื่อสด"
              subtitle={`${dailyLog.freshFeedCollectionName} · ฿12/กก.`}
              morning={freshMorning}
              evening={freshEvening}
              onMorningChange={setFreshMorning}
              onEveningChange={setFreshEvening}
            />
            <Sep />
            <FeedSection
              title="อาหารเม็ด"
              subtitle={`${dailyLog.pelletFeedCollectionName} · ฿32/กก.`}
              morning={pelletMorning}
              evening={pelletEvening}
              onMorningChange={setPelletMorning}
              onEveningChange={setPelletEvening}
            />
            <Sep />
            <View style={{ padding: 16, gap: 10 }}>
              <Row gap={10}>
                <NumField label="ปลาตาย" unit="ตัว" value={deaths} onChange={setDeaths} />
                <NumField
                  label="จับปลาเป็น"
                  optional
                  unit="ตัว"
                  value={tourist}
                  onChange={setTourist}
                />
              </Row>
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
          <Row gap={8}>
            <Btn tone="brand" size="lg" style={{ flex: 1 }}>
              บันทึก
            </Btn>
            <Btn
              tone="brand"
              variant="soft"
              size="lg"
              style={{ flex: 1 }}
              onPress={() => setSelectedDay((d) => Math.min(d + 1, daysInMonth))}
            >
              บันทึก & วันถัดไป
            </Btn>
          </Row>
        </View>
      </ScrollView>
    </View>
  );
}

function FeedSection({
  title,
  subtitle,
  morning,
  evening,
  onMorningChange,
  onEveningChange,
}: {
  title: string;
  subtitle: string;
  morning: string;
  evening: string;
  onMorningChange: (v: string) => void;
  onEveningChange: (v: string) => void;
}) {
  const { t } = useTheme();
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 }}>
      <Row justify="space-between" style={{ marginBottom: 8 }}>
        <Col gap={1}>
          <Text style={{ fontFamily: type.familyBold, fontSize: 14, color: t.ink }}>{title}</Text>
          <Text style={{ fontSize: 12, color: t.inkMute, fontFamily: type.family }}>
            {subtitle}
          </Text>
        </Col>
        <Pressable>
          <Text style={{ color: t.brand, fontSize: 13, fontFamily: type.familySemi }}>เปลี่ยน</Text>
        </Pressable>
      </Row>
      <Row gap={10}>
        <NumField label="เช้า" unit="กก." value={morning} onChange={onMorningChange} />
        <NumField label="เย็น" unit="กก." value={evening} onChange={onEveningChange} />
      </Row>
    </View>
  );
}

function NumField({
  label,
  unit,
  value,
  onChange,
  optional,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  optional?: boolean;
}) {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Row justify="space-between" style={{ marginBottom: 4 }}>
        <Text style={{ fontSize: 11, color: t.inkSoft, fontFamily: type.familySemi }}>
          {label}
          {optional ? (
            <Text style={{ color: t.inkMute, fontFamily: type.family }}> · ไม่บังคับ</Text>
          ) : null}
        </Text>
        <Text style={{ fontSize: 11, color: t.inkMute, fontFamily: type.familyNum }}>{unit}</Text>
      </Row>
      <Input big value={value} onChangeText={onChange} keyboardType="numeric" placeholder="0" />
    </View>
  );
}

function Sep() {
  const { t } = useTheme();
  return <View style={{ height: 1, backgroundColor: t.border, marginHorizontal: 16 }} />;
}

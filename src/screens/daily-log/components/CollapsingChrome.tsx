import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { CHROME } from '../constants';
import { FarmChipRow } from './FarmChipRow';
import { MonthNavRow } from './MonthNavRow';
import { DayStripRow } from './DayStripRow';

type Props = {
  scrollT: number;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  farmName: string;
  savedCount: number;
  total: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  nextMonthDisabled?: boolean;
  onFarmPress?: () => void;
  onMonthLabelPress?: () => void;
  daysWithDrafts?: ReadonlySet<string>;
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function CollapsingChrome({
  scrollT,
  selectedDate,
  onSelectDate,
  farmName,
  savedCount,
  total,
  onPrevMonth,
  onNextMonth,
  nextMonthDisabled = false,
  onFarmPress,
  onMonthLabelPress,
  daysWithDrafts,
}: Props) {
  const { t } = useTheme();

  const segFarm = clamp01(scrollT / 0.33);
  const segMonth = clamp01((scrollT - 0.33) / 0.33);
  const segDay = clamp01((scrollT - 0.66) / 0.34);

  const farmH = CHROME.farm * (1 - ease(segFarm));
  const monthH = CHROME.month * (1 - ease(segMonth));
  const dayH = CHROME.day * (1 - ease(segDay));

  const farmOp = lerp(1, 0, clamp01(segFarm * 1.4));
  const monthOp = lerp(1, 0, clamp01(segMonth * 1.4));
  const dayOp = lerp(1, 0, clamp01(segDay * 1.4));

  const dayExpanded = dayH >= CHROME.day - 1;

  return (
    <View
      style={{
        backgroundColor: t.surface,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: t.border,
      }}
    >
      <View style={{ height: farmH, opacity: farmOp, overflow: 'hidden' }}>
        <FarmChipRow
          farmName={farmName}
          savedCount={savedCount}
          total={total}
          onPress={onFarmPress}
        />
      </View>
      <View style={{ height: monthH, opacity: monthOp, overflow: 'hidden' }}>
        <MonthNavRow
          selectedDate={selectedDate}
          onPrev={onPrevMonth}
          onNext={onNextMonth}
          nextDisabled={nextMonthDisabled}
          onLabelPress={onMonthLabelPress}
        />
      </View>
      <View
        style={{
          height: dayH,
          opacity: dayOp,
          overflow: dayExpanded ? 'visible' : 'hidden',
        }}
      >
        <DayStripRow
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          daysWithDrafts={daysWithDrafts}
        />
      </View>
    </View>
  );
}

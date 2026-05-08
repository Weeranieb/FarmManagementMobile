import { mockDailyLog } from '@/features/daily-log';
import { useDailyLogScreen } from './hook';
import { DailyLogView } from './view';

type Props = {
  pondId?: number;
  onBack?: () => void;
  showHeader?: boolean;
};

export function DailyLogScreen({ pondId = mockDailyLog.pondId, ...rest }: Props) {
  const state = useDailyLogScreen(pondId);
  return <DailyLogView pondId={pondId} {...state} {...rest} />;
}

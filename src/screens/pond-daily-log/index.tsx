import { usePondDailyLog } from './hook';
import { PondDailyLogView } from './view';

type Props = {
  pondId: number;
  /** Extra bottom padding when embedded in an outer ScrollView (e.g. tab). */
  contentPaddingBottom?: number;
};

export function PondDailyLogPanel({ pondId, contentPaddingBottom = 0 }: Props) {
  const state = usePondDailyLog(pondId);
  return <PondDailyLogView {...state} contentPaddingBottom={contentPaddingBottom} />;
}

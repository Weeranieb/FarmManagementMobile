import { useTranslation } from 'react-i18next';
import { Pill } from '@/components/ui';

export function StatusBadge({ s }: { s: 'active' | 'maintenance' | string }) {
  const { t: tx } = useTranslation();
  if (s === 'active') return <Pill tone="success">{tx('pond.active')}</Pill>;
  if (s === 'maintenance') return <Pill tone="maint">{tx('pond.maintenance')}</Pill>;
  return <Pill>{s}</Pill>;
}

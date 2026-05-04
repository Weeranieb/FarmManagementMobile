import { Pill } from '@/components/ui';
import { Row } from '@/components/layout/Row';
import { FISH_TH } from '@/utils/fmt';

export function FishChips({ types }: { types: string[] | undefined | null }) {
  if (!types?.length) return null;
  return (
    <Row gap={4}>
      {types.map((ft) => (
        <Pill key={ft} tone="ghost">
          {FISH_TH[ft] ?? ft}
        </Pill>
      ))}
    </Row>
  );
}

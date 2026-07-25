import { ThemedSafeAreaView } from '@/components/layout/ThemedSafeAreaView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SellFlow } from '@/screens/flows/sell';

export default function SellRoute() {
  const params = useLocalSearchParams<{ pondId?: string }>();
  const router = useRouter();
  const parsed = params.pondId != null ? Number(params.pondId) : NaN;
  const pondId = Number.isFinite(parsed) ? parsed : undefined;

  // A saved sale entered from a pond's detail page dismisses back onto that
  // page and points it at the tab that now holds the outcome — the closed
  // cycle's P&L when the sale ended the cycle, otherwise the activity it just
  // recorded. A cancel (no result), or FAB entry with no pond page underneath,
  // just closes the modal.
  return (
    <ThemedSafeAreaView edges={['top']}>
      <SellFlow
        pondId={pondId}
        onClose={(result) => {
          if (!result || pondId == null) {
            router.back();
            return;
          }
          router.dismissTo({
            pathname: '/(app)/pond/[id]',
            params: {
              id: String(result.pondId),
              tab: result.pondClosed ? 'cycles' : 'history',
            },
          });
        }}
      />
    </ThemedSafeAreaView>
  );
}

import { useQuery } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import { listFishSizeGrades } from './service';
import { adaptSizeGrade } from './adapters';
import type { SizeGradeModel } from './types';

export const sizeGradeKeys = {
  all: () => ['fish-size-grades'] as const,
} as const;

export function useFishSizeGrades() {
  const enabled = useIsAuthenticated();
  return useQuery({
    queryKey: sizeGradeKeys.all(),
    queryFn: listFishSizeGrades,
    enabled,
  });
}

/**
 * Returns adapted size-grade options for the sell-row picker. The list is
 * tiny and seldom changes — fetched once and shared across every sell-row
 * editor on the screen.
 */
export function useFishSizeGradesData(): {
  data: SizeGradeModel[];
  isLoading: boolean;
  isError: boolean;
} {
  const enabled = useIsAuthenticated();
  const q = useFishSizeGrades();
  if (!enabled || q.isError || q.data == null || !Array.isArray(q.data)) {
    return { data: [], isLoading: enabled && q.isLoading, isError: !enabled || q.isError };
  }
  return {
    data: q.data.map(adaptSizeGrade),
    isLoading: q.isLoading,
    isError: q.isError,
  };
}

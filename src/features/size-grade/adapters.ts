import type { DropdownItem, SizeGradeModel } from './types';

export function adaptSizeGrade(d: DropdownItem): SizeGradeModel {
  return {
    id: d.key,
    name: d.value,
  };
}

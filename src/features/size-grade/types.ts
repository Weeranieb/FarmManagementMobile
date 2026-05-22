// Mirrors backend/src/internal/dto/common.go `DropdownItem`. Keep in sync.

export type DropdownItem = {
  key: number;
  value: string;
};

/** UI-facing size-grade picker option. */
export type SizeGradeModel = {
  id: number;
  name: string;
};

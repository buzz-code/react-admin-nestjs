import { findByThreshold } from '@shared/utils/reportData.util';

export const ABSENCE_THRESHOLDS = [
  { min: 0.8, argb: 'FFFF0000' },
  { min: 0.6, argb: 'FFFF6666' },
  { min: 0.4, argb: 'FFFFA500' },
  { min: 0.2, argb: 'FFFFFF88' },
] as const;

export type AbsenceThreshold = (typeof ABSENCE_THRESHOLDS)[number];

export function getThresholdArgb(ratio: number | null): string | null {
  return findByThreshold(ratio, ABSENCE_THRESHOLDS, 'min', 'argb');
}

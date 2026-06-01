import { getColorForValue } from '@shared/utils/thresholdUtil';

export const ABSENCE_THRESHOLDS = [
    { min: 0.80, color: '#ff0000' },
    { min: 0.60, color: '#ff6666' },
    { min: 0.40, color: '#ffa500' },
    { min: 0.20, color: '#ffff88' },
];

export function getThresholdColor(value) {
    return getColorForValue(value, ABSENCE_THRESHOLDS);
}

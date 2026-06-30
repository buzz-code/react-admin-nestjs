import { getColorForValue } from '@shared/utils/thresholdUtil';

export const ABSENCE_THRESHOLDS = [
    { min: 0.8, color: '#ff0000' },
    { min: 0.6, color: '#ff6666' },
    { min: 0.4, color: '#ffa500' },
    { min: 0.2, color: '#ffff88' },
];

export function getThresholdColor(value) {
    return getColorForValue(value, ABSENCE_THRESHOLDS);
}

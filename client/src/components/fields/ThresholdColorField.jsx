import React from 'react';
import { FunctionField } from 'react-admin';
import { getColorForValue } from '@shared/utils/thresholdUtil';

const defaultFormat = (v) => `${(v * 100).toFixed(1)}%`;

const ThresholdColorField = ({
    source,
    label,
    thresholds = [],
    format = defaultFormat,
    sortable = false,
}) => (
    <FunctionField
        source={source}
        label={label}
        sortable={sortable}
        render={(record) => {
            const value = record[source];
            if (value === null || value === undefined || value === '') return '—';
            const n = Number(value);
            if (isNaN(n)) return <span>{value}</span>;
            const color = getColorForValue(n, thresholds);
            return (
                <span style={color ? { backgroundColor: color, padding: '2px 6px', borderRadius: '4px' } : undefined}>
                    {format(n)}
                </span>
            );
        }}
    />
);

export default ThresholdColorField;

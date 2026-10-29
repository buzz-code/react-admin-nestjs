import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AbsenceReasonAutocomplete } from './AbsenceReasonInput';

jest.mock('src/settings/settingsUtil', () => ({
    useAbsenceReasons: () => ['חתונה', 'מחלה'],
}));

const Wrapper = ({ initialValue = '', onChange }) => {
    const [value, setValue] = useState(initialValue);
    return (
        <AbsenceReasonAutocomplete
            label="סיבה"
            value={value}
            onChange={(newValue) => {
                setValue(newValue);
                onChange(newValue);
            }}
        />
    );
};

describe('AbsenceReasonAutocomplete', () => {
    it('picks a reason from the settings list', () => {
        const onChange = jest.fn();
        render(<Wrapper onChange={onChange} />);
        const input = screen.getByLabelText('סיבה');
        fireEvent.mouseDown(input);
        fireEvent.click(screen.getByText('מחלה'));
        expect(onChange).toHaveBeenLastCalledWith('מחלה');
        expect(input.value).toBe('מחלה');
    });

    it('keeps free text that is not in the list', () => {
        const onChange = jest.fn();
        render(<Wrapper onChange={onChange} />);
        const input = screen.getByLabelText('סיבה');
        fireEvent.change(input, { target: { value: 'סיבה אחרת' } });
        expect(onChange).toHaveBeenLastCalledWith('סיבה אחרת');
        expect(input.value).toBe('סיבה אחרת');
    });

    it('shows an existing value without changing it', () => {
        const onChange = jest.fn();
        render(<Wrapper initialValue="ברית" onChange={onChange} />);
        expect(screen.getByLabelText('סיבה').value).toBe('ברית');
        expect(onChange).not.toHaveBeenCalled();
    });
});

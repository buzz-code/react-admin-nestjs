import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminContext } from 'react-admin';
import Settings from './Settings';

jest.mock('./GeneralSettingsInput', () => ({ GeneralSettingsInput: () => null }));
jest.mock('./ReportStylesInput', () => ({ ReportStylesInput: () => null }));
jest.mock('./ReportCardSettingsInput', () => ({ ReportCardSettingsInput: () => null }));
jest.mock('./ManagerPhoneSettingsInput', () => ({ ManagerPhoneSettingsInput: () => null }));
jest.mock('@shared/components/phone/YemotSettingsInput', () => ({ YemotSettingsInput: () => null }));
jest.mock('@shared/components/phone/PhoneSettingsInput', () => ({ PhoneSettingsInput: () => null }));
jest.mock('@shared/components/settings/DashboardItemsInput', () => ({ DashboardItemsInput: () => null }));

const identity = {
    id: 1,
    fullName: 'test',
    phoneNumber: '0500000000',
    mailAddressTitle: 'Old School',
    mailAddressAlias: 'old-school',
    additionalData: {},
};

const authProvider = {
    login: jest.fn(),
    logout: jest.fn(),
    checkAuth: jest.fn(() => Promise.resolve()),
    checkError: jest.fn(() => Promise.resolve()),
    getPermissions: jest.fn(() => Promise.resolve({})),
    getIdentity: jest.fn(() => Promise.resolve(identity)),
};

const dataProvider = {
    updateSettings: jest.fn(() => Promise.resolve({ success: true })),
    updateProfile: jest.fn(() => Promise.resolve({ success: true })),
};

const originalLocation = window.location;

beforeEach(() => {
    jest.clearAllMocks();
    delete window.location;
    window.location = { ...originalLocation, href: originalLocation.href, pathname: '/', search: '', hash: '', reload: jest.fn() };
});

afterAll(() => {
    window.location = originalLocation;
});

test('sends only changed mail fields to updateProfile', async () => {
    render(
        <AdminContext dataProvider={dataProvider} authProvider={authProvider}>
            <Settings />
        </AdminContext>,
    );

    const titleInput = await screen.findByDisplayValue('Old School');
    expect(screen.getByDisplayValue('old-school')).toBeInTheDocument();

    fireEvent.change(titleInput, { target: { value: 'New School' } });
    fireEvent.click(screen.getByRole('button', { name: /save|שמירה/i }));

    await waitFor(() => expect(dataProvider.updateProfile).toHaveBeenCalledWith({ data: { mailAddressTitle: 'New School' } }));
    expect(dataProvider.updateSettings).toHaveBeenCalled();
    expect(dataProvider.updateSettings.mock.calls[0][0].data).not.toHaveProperty('mailAddressTitle');
});

test('skips updateProfile when no profile field changed', async () => {
    render(
        <AdminContext dataProvider={dataProvider} authProvider={authProvider}>
            <Settings />
        </AdminContext>,
    );

    await screen.findByDisplayValue('Old School');
    fireEvent.click(screen.getByRole('button', { name: /save|שמירה/i }));

    await waitFor(() => expect(dataProvider.updateSettings).toHaveBeenCalled());
    expect(dataProvider.updateProfile).not.toHaveBeenCalled();
});

import { render, screen, act } from '@testing-library/react';
import { AdminContext, memoryStore } from 'react-admin';
import { TeacherGuard, TEACHER_IDLE_TIMEOUT_MS } from './TeacherAccess';

const teacher = { id: 7, name: 'כהן', tz: '123456789' };

const renderGuard = (store) =>
    render(
        <AdminContext store={store} dataProvider={{ getList: jest.fn() }}>
            <TeacherGuard>
                <div>תוכן מורה</div>
            </TeacherGuard>
        </AdminContext>,
    );

beforeEach(() => {
    sessionStorage.clear();
    jest.useFakeTimers();
});

afterEach(() => {
    jest.useRealTimers();
});

test('shows login when teacher stored but tab session is new (tab was closed)', () => {
    const store = memoryStore({ teacher });
    renderGuard(store);
    expect(screen.queryByText('תוכן מורה')).toBeNull();
    expect(screen.getByText('כניסת מורה')).toBeTruthy();
    expect(store.getItem('teacher')).toBeFalsy();
});

test('shows content when teacher stored and tab session is active', () => {
    sessionStorage.setItem('teacherLastActive', String(Date.now()));
    renderGuard(memoryStore({ teacher }));
    expect(screen.getByText('תוכן מורה')).toBeTruthy();
});

test('logs out after idle timeout', () => {
    sessionStorage.setItem('teacherLastActive', String(Date.now()));
    const store = memoryStore({ teacher });
    renderGuard(store);
    expect(screen.getByText('תוכן מורה')).toBeTruthy();

    act(() => {
        jest.advanceTimersByTime(TEACHER_IDLE_TIMEOUT_MS + 60 * 1000);
    });

    expect(screen.queryByText('תוכן מורה')).toBeNull();
    expect(store.getItem('teacher')).toBeFalsy();
});

test('activity keeps teacher logged in', () => {
    sessionStorage.setItem('teacherLastActive', String(Date.now()));
    renderGuard(memoryStore({ teacher }));

    for (let i = 0; i < 4; i++) {
        act(() => {
            jest.advanceTimersByTime(TEACHER_IDLE_TIMEOUT_MS / 2);
            window.dispatchEvent(new Event('keydown'));
        });
    }

    expect(screen.getByText('תוכן מורה')).toBeTruthy();
});

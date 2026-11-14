import { BadGatewayException, BadRequestException } from '@nestjs/common';
import {
  buildTikufSummaryQuery,
  clearTikufSummaryCache,
  getStudentTikufSummary,
  normalizeTz,
} from '../tikuf-summary.util';

const user = { additionalData: { studentReportApiKey: 'k'.repeat(32) } };
const body = { students: [{ tz: '0123', count: 2, dates: ['2026-11-01', '2026-11-09'] }, { tz: '555', count: 1, dates: ['2026-11-02'] }] };

const mockFetch = (response: Partial<Response> | Error) =>
  jest.spyOn(global, 'fetch').mockImplementation(async () => {
    if (response instanceof Error) throw response;
    return { ok: true, status: 200, json: async () => body, ...response } as Response;
  });

describe('tikuf summary util', () => {
  const originalUrl = process.env.STUDENT_REPORT_API_URL;

  beforeEach(() => {
    process.env.STUDENT_REPORT_API_URL = 'https://tikuf.example.org/api/';
    clearTikufSummaryCache();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.STUDENT_REPORT_API_URL = originalUrl;
  });

  describe('normalizeTz', () => {
    it('trims and drops leading zeros', () => {
      expect(normalizeTz(' 0123 ')).toBe('123');
      expect(normalizeTz(123)).toBe('123');
      expect(normalizeTz(undefined)).toBe('');
    });
  });

  describe('buildTikufSummaryQuery', () => {
    it('uses explicit dates and ignores the default year', () => {
      expect(buildTikufSummaryQuery({ startDate: '2026-11-01', endDate: '2026-11-30', year: 5787 })).toEqual({
        fromDate: '2026-11-01',
        toDate: '2026-11-30',
      });
    });

    it('accepts a single date', () => {
      expect(buildTikufSummaryQuery({ startDate: '2026-11-01', year: 5787 })).toEqual({ fromDate: '2026-11-01', toDate: undefined });
    });

    it('falls back to the year when there are no valid dates', () => {
      expect(buildTikufSummaryQuery({ startDate: '', endDate: 'x', year: 5787 })).toEqual({ year: 5787 });
    });
  });

  describe('getStudentTikufSummary', () => {
    it('calls the site once with the key and matches the student by normalized tz', async () => {
      const fetchSpy = mockFetch({});

      const [first, second, missing] = await Promise.all([
        getStudentTikufSummary(user, '123', { year: 5787 }),
        getStudentTikufSummary(user, '555', { year: 5787 }),
        getStudentTikufSummary(user, '999', { year: 5787 }),
      ]);

      expect(first).toEqual({ count: 2, dates: ['2026-11-01', '2026-11-09'] });
      expect(second).toEqual({ count: 1, dates: ['2026-11-02'] });
      expect(missing).toEqual({ count: 0, dates: [] });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, init] = fetchSpy.mock.calls[0];
      expect(url).toBe('https://tikuf.example.org/api/integration/tikuf-summary?year=5787');
      expect((init as RequestInit).headers).toEqual({ 'x-api-key': user.additionalData.studentReportApiKey });
    });

    it('sends date filters instead of year', async () => {
      const fetchSpy = mockFetch({});
      await getStudentTikufSummary(user, '123', { fromDate: '2026-11-01', toDate: '2026-11-30' });
      expect(fetchSpy.mock.calls[0][0]).toBe(
        'https://tikuf.example.org/api/integration/tikuf-summary?fromDate=2026-11-01&toDate=2026-11-30',
      );
    });

    it('asks again for a different query', async () => {
      const fetchSpy = mockFetch({});
      await getStudentTikufSummary(user, '123', { year: 5787 });
      await getStudentTikufSummary(user, '123', { year: 5786 });
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('requires the site address and the key', async () => {
      const fetchSpy = mockFetch({});
      await expect(getStudentTikufSummary({ additionalData: {} }, '123', {})).rejects.toBeInstanceOf(BadRequestException);
      delete process.env.STUDENT_REPORT_API_URL;
      await expect(getStudentTikufSummary(user, '123', {})).rejects.toBeInstanceOf(BadRequestException);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('fails clearly when the site is unreachable, and retries on the next call', async () => {
      mockFetch(new Error('ECONNREFUSED'));
      await expect(getStudentTikufSummary(user, '123', { year: 1 })).rejects.toBeInstanceOf(BadGatewayException);

      jest.restoreAllMocks();
      const fetchSpy = mockFetch({});
      await expect(getStudentTikufSummary(user, '123', { year: 1 })).resolves.toEqual({ count: 2, dates: ['2026-11-01', '2026-11-09'] });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('fails clearly on a rejected key or a server error', async () => {
      mockFetch({ ok: false, status: 401 });
      await expect(getStudentTikufSummary(user, '123', {})).rejects.toThrow('מפתח החיבור');

      clearTikufSummaryCache();
      mockFetch({ ok: false, status: 500 });
      await expect(getStudentTikufSummary(user, '123', {})).rejects.toThrow('500');
    });
  });
});

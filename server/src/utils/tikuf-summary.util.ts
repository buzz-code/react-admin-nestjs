import { BadGatewayException, BadRequestException } from '@nestjs/common';
import { User } from '@shared/entities/User.entity';

export interface TikufSummary {
  count: number;
  dates: string[];
}

export interface TikufSummaryQuery {
  fromDate?: string;
  toDate?: string;
  year?: number;
}

type TikufSummaryByTz = Map<string, TikufSummary>;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CACHE_TTL_MS = 60 * 1000;
const REQUEST_TIMEOUT_MS = 30 * 1000;

// A bulk report asks for every student at once: they share one request instead of one each
const cache = new Map<string, { expires: number; promise: Promise<TikufSummaryByTz> }>();

export const normalizeTz = (tz: string | number): string => String(tz ?? '').trim().replace(/^0+/, '');

// Explicit dates win; the default year only applies when no dates were chosen
export function buildTikufSummaryQuery(params: { startDate?: string; endDate?: string; year?: number }): TikufSummaryQuery {
  const fromDate = DATE_PATTERN.test(params.startDate ?? '') ? params.startDate : undefined;
  const toDate = DATE_PATTERN.test(params.endDate ?? '') ? params.endDate : undefined;
  return fromDate || toDate ? { fromDate, toDate } : { year: params.year };
}

async function requestTikufSummary(baseUrl: string, apiKey: string, query: TikufSummaryQuery): Promise<TikufSummaryByTz> {
  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => value && searchParams.set(key, String(value)));
  const url = `${baseUrl.replace(/\/+$/, '')}/integration/tikuf-summary?${searchParams}`;

  let response: Response;
  try {
    response = await fetch(url, { headers: { 'x-api-key': apiKey }, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch {
    throw new BadGatewayException('לא ניתן להתחבר לאתר התיקוף. נסו שוב מאוחר יותר');
  }
  if (response.status === 401) {
    throw new BadGatewayException('מפתח החיבור לאתר התיקוף אינו תקין. יש לפנות לתמיכה');
  }
  if (!response.ok) {
    throw new BadGatewayException(`אתר התיקוף החזיר שגיאה (${response.status}). נסו שוב מאוחר יותר`);
  }

  const body = await response.json();
  const summaries: TikufSummaryByTz = new Map();
  for (const student of body?.students ?? []) {
    summaries.set(normalizeTz(student.tz), { count: student.count, dates: student.dates ?? [] });
  }
  return summaries;
}

function getTikufSummaries(baseUrl: string, apiKey: string, query: TikufSummaryQuery): Promise<TikufSummaryByTz> {
  const cacheKey = JSON.stringify([baseUrl, apiKey, query]);
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.promise;
  }

  const promise = requestTikufSummary(baseUrl, apiKey, query);
  cache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, promise });
  promise.catch(() => cache.delete(cacheKey));
  return promise;
}

/**
 * The tikuf days of one student, read from the student-report site. The site address comes from the
 * server environment, the key from the user's settings (`additionalData.studentReportApiKey`).
 * Throws when the site is not set up or unreachable, so a letter is never produced without data
 * the caller asked for.
 */
export async function getStudentTikufSummary(
  user: Pick<User, 'additionalData'>,
  studentTz: string,
  query: TikufSummaryQuery,
): Promise<TikufSummary> {
  const baseUrl = process.env.STUDENT_REPORT_API_URL;
  const apiKey = user?.additionalData?.studentReportApiKey;
  if (!baseUrl || !apiKey) {
    throw new BadRequestException('לא הוגדר חיבור לאתר התיקוף. יש לפנות לתמיכה');
  }

  const summaries = await getTikufSummaries(baseUrl, apiKey, query);
  return summaries.get(normalizeTz(studentTz)) ?? { count: 0, dates: [] };
}

export const clearTikufSummaryCache = () => cache.clear();

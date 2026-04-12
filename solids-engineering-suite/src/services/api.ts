// ============================================================
// Centralized API Service — SOLIDS Engineering Suite
// Production-hardened with:
//   - Firebase Auth token injection
//   - Exponential backoff retry (with 429 Retry-After handling)
//   - In-flight request deduplication
//   - In-memory TTL cache for static data
//   - AbortController support for request cancellation
// ============================================================

import { auth } from '../lib/firebase';
import type {
  CalculationSummary,
  CalculationSavePayload,
  CalculationDetail,
  SaveResponse,
  FatigueInput,
  FatigueResult,
  FailureTheoriesInput,
  FailureTheoriesResult,
  MohrCircleInput,
  MohrCircleResult,
  TorsionInput,
  TorsionResult,
  DynamicInput,
  DynamicResult,
  BeamsInput,
  BeamsResult,
  Material,
  AshbyMaterial,
  ThinCylinderInput,
  ThinCylinderResult,
  BucklingInput,
  BucklingResult,
} from '../types/api';

// ---------------------------------------------------------------------------
// Base URL helper
// ---------------------------------------------------------------------------

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

function apiUrl(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${BASE_URL}${normalizedEndpoint}`;
}

// Re-export for any remaining direct usages during migration
export { apiUrl };

// ---------------------------------------------------------------------------
// Error Classes
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class RateLimitError extends ApiError {
  constructor(
    public retryAfterSeconds: number,
    endpoint: string,
  ) {
    super(
      `Rate limit exceeded. Please wait ${retryAfterSeconds}s before retrying.`,
      429,
      endpoint,
    );
    this.name = 'RateLimitError';
  }
}

// ---------------------------------------------------------------------------
// In-memory TTL Cache (for static data like materials)
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlMs = DEFAULT_CACHE_TTL_MS): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ---------------------------------------------------------------------------
// In-flight request deduplication
// ---------------------------------------------------------------------------

const inFlightRequests = new Map<string, Promise<unknown>>();

// ---------------------------------------------------------------------------
// Firebase Auth Token Helper
// ---------------------------------------------------------------------------

async function getAuthToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Retry Logic with Exponential Backoff
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Generic request helper with auth, retry, dedup, and caching
// ---------------------------------------------------------------------------

interface RequestOptions extends RequestInit {
  /** If true, cache the response using the endpoint as key */
  cacheable?: boolean;
  /** Cache TTL in ms (default 5 min) */
  cacheTtlMs?: number;
  /** AbortController signal for cancellation */
  signal?: AbortSignal;
  /** Skip deduplication (e.g. for mutations) */
  skipDedup?: boolean;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { cacheable, cacheTtlMs, skipDedup, ...fetchOptions } = options;
  const method = (fetchOptions.method || 'GET').toUpperCase();
  const dedupKey = `${method}:${endpoint}:${fetchOptions.body || ''}`;

  // 1. Check cache for GET requests
  if (cacheable && method === 'GET') {
    const cached = getCached<T>(endpoint);
    if (cached) return cached;
  }

  // 2. Deduplicate in-flight requests (skip for mutations)
  if (!skipDedup && inFlightRequests.has(dedupKey)) {
    return inFlightRequests.get(dedupKey) as Promise<T>;
  }

  // 3. Create the actual request promise
  const requestPromise = executeWithRetry<T>(endpoint, fetchOptions, cacheable, cacheTtlMs);

  // 4. Store in dedup map
  if (!skipDedup) {
    inFlightRequests.set(dedupKey, requestPromise);
    requestPromise.finally(() => inFlightRequests.delete(dedupKey));
  }

  return requestPromise;
}

async function executeWithRetry<T>(
  endpoint: string,
  fetchOptions: RequestInit,
  cacheable?: boolean,
  cacheTtlMs?: number,
): Promise<T> {
  const url = apiUrl(endpoint);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Inject auth token on every attempt (token may refresh)
      const token = await getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      // --- Handle 429 Rate Limiting ---
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
        if (attempt < MAX_RETRIES) {
          console.warn(
            `[API] Rate limited on ${endpoint} (attempt ${attempt + 1}/${MAX_RETRIES + 1}). ` +
            `Retrying in ${retryAfter}s...`
          );
          await sleep(retryAfter * 1000);
          continue;
        }
        throw new RateLimitError(retryAfter, endpoint);
      }

      // --- Handle other errors ---
      if (!response.ok) {
        const detail = await response.text().catch(() => response.statusText);
        throw new ApiError(
          `API request failed: ${detail}`,
          response.status,
          endpoint,
        );
      }

      const data = (await response.json()) as T;

      // Cache successful GET responses
      if (cacheable && (fetchOptions.method || 'GET').toUpperCase() === 'GET') {
        setCache(endpoint, data, cacheTtlMs);
      }

      return data;
    } catch (error) {
      // Don't retry on abort
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }

      // Don't retry on auth errors
      if (error instanceof ApiError && error.status === 401) {
        throw error;
      }

      // Don't retry if we already threw a RateLimitError (exhausted retries)
      if (error instanceof RateLimitError) {
        throw error;
      }

      lastError = error instanceof Error ? error : new Error(String(error));

      // Retry with exponential backoff for transient errors
      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `[API] Error on ${endpoint} (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${lastError.message}. ` +
          `Retrying in ${delay}ms...`
        );
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  if (lastError instanceof ApiError) throw lastError;

  console.error(`[API] All retries exhausted for ${endpoint}:`, lastError);
  throw new ApiError(
    lastError?.message || 'Unknown network error',
    0,
    endpoint,
  );
}

// ---------------------------------------------------------------------------
// Calculation CRUD service
// ---------------------------------------------------------------------------

export const calculationService = {
  list: () =>
    request<CalculationSummary[]>('/api/recent-calculations'),

  load: (id: string) =>
    request<CalculationDetail>(`/api/load-calculation/${id}`),

  save: (payload: CalculationSavePayload) =>
    request<SaveResponse>('/api/save-calculation', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipDedup: true,
    }),

  delete: (id: string) =>
    request<{ status: string }>(`/api/delete-calculation/${id}`, {
      method: 'DELETE',
      skipDedup: true,
    }),

  clearAll: () =>
    request<{ status: string }>('/api/clear-calculations', {
      method: 'DELETE',
      skipDedup: true,
    }),
};

// ---------------------------------------------------------------------------
// Engineering analysis services
// ---------------------------------------------------------------------------

export const fatigueService = {
  analyze: (input: FatigueInput, signal?: AbortSignal) =>
    request<FatigueResult>('/api/fatigue', {
      method: 'POST',
      body: JSON.stringify(input),
      signal,
    }),
};

export const failureService = {
  analyze: (input: FailureTheoriesInput, signal?: AbortSignal) =>
    request<FailureTheoriesResult>('/api/failure-theories', {
      method: 'POST',
      body: JSON.stringify(input),
      signal,
    }),
};

export const mohrService = {
  analyze: (input: MohrCircleInput, signal?: AbortSignal) =>
    request<MohrCircleResult>('/api/mohr-circle', {
      method: 'POST',
      body: JSON.stringify(input),
      signal,
    }),
};

export const torsionService = {
  analyze: (input: TorsionInput, signal?: AbortSignal) =>
    request<TorsionResult>('/api/torsion', {
      method: 'POST',
      body: JSON.stringify(input),
      signal,
    }),
};

export const dynamicService = {
  analyze: (input: DynamicInput, signal?: AbortSignal) =>
    request<DynamicResult>('/api/dynamic-loading', {
      method: 'POST',
      body: JSON.stringify(input),
      signal,
    }),
};

export const beamsService = {
  analyze: (input: BeamsInput, signal?: AbortSignal) =>
    request<BeamsResult>('/api/beams', {
      method: 'POST',
      body: JSON.stringify(input),
      signal,
    }),
};

export const materialsService = {
  list: () =>
    request<Material[]>('/api/materials', { cacheable: true }),

  listAshby: () =>
    request<AshbyMaterial[]>('/api/ashby-materials', { cacheable: true }),
};

export const thinCylinderService = {
  analyze: (input: ThinCylinderInput, signal?: AbortSignal) =>
    request<ThinCylinderResult>('/api/thin-cylinder', {
      method: 'POST',
      body: JSON.stringify(input),
      signal,
    }),
};

export const bucklingService = {
  analyze: (input: BucklingInput, signal?: AbortSignal) =>
    request<BucklingResult>('/api/buckling', {
      method: 'POST',
      body: JSON.stringify(input),
      signal,
    }),
};

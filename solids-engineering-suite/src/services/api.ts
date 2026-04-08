// ============================================================
// Centralized API Service — SOLIDS Engineering Suite
// Typed, structured fetch wrappers for all backend endpoints.
// ============================================================

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
// Generic request helper with structured error handling
// ---------------------------------------------------------------------------

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = apiUrl(endpoint);

  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        endpoint,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    console.error(`[API] Network error on ${endpoint}:`, error);
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown network error',
      0,
      endpoint,
    );
  }
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
    }),

  delete: (id: string) =>
    request<{ status: string }>(`/api/delete-calculation/${id}`, {
      method: 'DELETE',
    }),

  clearAll: () =>
    request<{ status: string }>('/api/clear-calculations', {
      method: 'DELETE',
    }),
};

// ---------------------------------------------------------------------------
// Engineering analysis services
// ---------------------------------------------------------------------------

export const fatigueService = {
  analyze: (input: FatigueInput) =>
    request<FatigueResult>('/api/fatigue', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

export const failureService = {
  analyze: (input: FailureTheoriesInput) =>
    request<FailureTheoriesResult>('/api/failure-theories', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

export const mohrService = {
  analyze: (input: MohrCircleInput) =>
    request<MohrCircleResult>('/api/mohr-circle', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

export const torsionService = {
  analyze: (input: TorsionInput) =>
    request<TorsionResult>('/api/torsion', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

export const dynamicService = {
  analyze: (input: DynamicInput) =>
    request<DynamicResult>('/api/dynamic-loading', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

export const beamsService = {
  analyze: (input: BeamsInput) =>
    request<BeamsResult>('/api/beams', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

export const materialsService = {
  list: () =>
    request<Material[]>('/api/materials'),

  listAshby: () =>
    request<AshbyMaterial[]>('/api/ashby-materials'),
};

export const thinCylinderService = {
  analyze: (input: ThinCylinderInput) =>
    request<ThinCylinderResult>('/api/thin-cylinder', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

export const bucklingService = {
  analyze: (input: BucklingInput) =>
    request<BucklingResult>('/api/buckling', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

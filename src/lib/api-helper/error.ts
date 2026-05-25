export const API_ERROR_PRESETS = {
  BAD_REQUEST: { status: 400, message: 'Bad request' },
  UNAUTHORIZED: { status: 401, message: 'Unauthorized' },
  FORBIDDEN: { status: 403, message: 'Forbidden' },
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  CONFLICT: { status: 409, message: 'Conflict' },
  UNPROCESSABLE_ENTITY: { status: 422, message: 'Unprocessable entity' },
  TOO_MANY_REQUESTS: { status: 429, message: 'Too many requests' },
  INTERNAL_SERVER_ERROR: { status: 500, message: 'Internal server error' },
} as const;

export type ApiErrorCode = keyof typeof API_ERROR_PRESETS | 'CUSTOM_ERROR';
type PresetApiErrorCode = keyof typeof API_ERROR_PRESETS;

type ApiErrorOptions = {
  message?: string;
  status?: number;
  code?: ApiErrorCode;
};

type ResolvedApiError = {
  code: ApiErrorCode;
  message: string;
  status: number;
};

function isApiErrorCode(value: string): value is PresetApiErrorCode {
  return value in API_ERROR_PRESETS;
}

function resolveCustomError(
  message = 'API request failed',
  statusOrOptions: number | ApiErrorOptions = 401,
): ResolvedApiError {
  if (typeof statusOrOptions === 'number') {
    return {
      code: 'CUSTOM_ERROR',
      message,
      status: statusOrOptions,
    };
  }

  return {
    code: statusOrOptions.code ?? 'CUSTOM_ERROR',
    message,
    status: statusOrOptions.status ?? 401,
  };
}

function resolvePresetError(
  code: PresetApiErrorCode,
  options: ApiErrorOptions = {},
): ResolvedApiError {
  const preset = API_ERROR_PRESETS[code];

  return {
    code: options.code ?? code,
    message: options.message ?? preset.message,
    status: options.status ?? preset.status,
  };
}

/**
 * Custom error class for API failures (4xx/5xx)
 */
export class ApiError extends Error {
  status: number;
  code: ApiErrorCode;

  constructor(message?: string, status?: number);
  constructor(code: PresetApiErrorCode, options?: ApiErrorOptions);
  constructor(
    input = 'API request failed',
    statusOrOptions: number | ApiErrorOptions = 401,
  ) {
    const resolved = isApiErrorCode(input)
      ? resolvePresetError(
          input,
          typeof statusOrOptions === 'number' ? {} : statusOrOptions,
        )
      : resolveCustomError(input, statusOrOptions);

    super(resolved.message);
    this.status = resolved.status;
    this.code = resolved.code;
    this.name = 'ApiError';
  }

  static fromCode(
    code: PresetApiErrorCode,
    options?: Omit<ApiErrorOptions, 'code'>,
  ) {
    return new ApiError(code, options);
  }

  static custom(message: string, status = 401) {
    return new ApiError(message, status);
  }

  static badRequest(message?: string) {
    return ApiError.fromCode('BAD_REQUEST', { message });
  }

  static unauthorized(message?: string) {
    return ApiError.fromCode('UNAUTHORIZED', { message });
  }

  static forbidden(message?: string) {
    return ApiError.fromCode('FORBIDDEN', { message });
  }

  static notFound(message?: string) {
    return ApiError.fromCode('NOT_FOUND', { message });
  }

  static conflict(message?: string) {
    return ApiError.fromCode('CONFLICT', { message });
  }

  static unprocessableEntity(message?: string) {
    return ApiError.fromCode('UNPROCESSABLE_ENTITY', { message });
  }

  static tooManyRequests(message?: string) {
    return ApiError.fromCode('TOO_MANY_REQUESTS', { message });
  }

  static internalServerError(message?: string) {
    return ApiError.fromCode('INTERNAL_SERVER_ERROR', { message });
  }
}

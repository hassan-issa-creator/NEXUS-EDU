// Error codes for consistent error handling
export const ERROR_CODES = {
    // Auth errors
    AUTH_INVALID_CREDENTIALS: 'AUTH_001',
    AUTH_TOKEN_EXPIRED: 'AUTH_002',
    AUTH_UNAUTHORIZED: 'AUTH_003',
    AUTH_FORBIDDEN: 'AUTH_004',

    // Validation errors
    VALIDATION_FAILED: 'VAL_001',
    VALIDATION_REQUIRED_FIELD: 'VAL_002',

    // Resource errors
    RESOURCE_NOT_FOUND: 'RES_001',
    RESOURCE_ALREADY_EXISTS: 'RES_002',
    RESOURCE_CONFLICT: 'RES_003',

    // Server errors
    SERVER_INTERNAL_ERROR: 'SRV_001',
    SERVER_DATABASE_ERROR: 'SRV_002',
    SERVER_EXTERNAL_SERVICE_ERROR: 'SRV_003',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

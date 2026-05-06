// Application constants
export const APP_CONSTANTS = {
    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,

    // Cache TTL (in seconds)
    CACHE_TTL_SHORT: 60, // 1 minute
    CACHE_TTL_MEDIUM: 300, // 5 minutes
    CACHE_TTL_LONG: 3600, // 1 hour

    // Rate limiting
    RATE_LIMIT_DEFAULT: 100,
    RATE_LIMIT_AUTH: 10,

    // File upload
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

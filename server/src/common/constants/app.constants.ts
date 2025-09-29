export const APP_CONSTANTS = {
  JWT: {
    DEFAULT_SECRET: 'al-abraar-super-secret-jwt-key-2024',
    DEFAULT_EXPIRES_IN: '7d',
  },
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  BOOKING: {
    MIN_ADVANCE_HOURS: 2,
    MAX_ADVANCE_DAYS: 90,
    MIN_CANCELLATION_HOURS: 24,
  },
  PLATFORM: {
    FEE_PERCENTAGE: 30,
    CURRENCY: 'USD',
  },
  ROLES: {
    ADMIN: 'admin',
    USTAADH: 'ustaadh',
    STUDENT: 'student',
  },
} as const;
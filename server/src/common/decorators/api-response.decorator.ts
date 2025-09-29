import { applyDecorators } from '@nestjs/common';

export interface ApiResponseOptions {
  description?: string;
  type?: any;
  isArray?: boolean;
}

export function ApiSuccessResponse(options: ApiResponseOptions = {}) {
  return applyDecorators(
    // In a real app, you would use @nestjs/swagger decorators here
    // For now, this is a placeholder for future API documentation
  );
}

export function ApiErrorResponse(options: ApiResponseOptions = {}) {
  return applyDecorators(
    // Placeholder for error response documentation
  );
}
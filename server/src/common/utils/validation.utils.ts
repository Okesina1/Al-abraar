import { BadRequestException } from '@nestjs/common';

export class ValidationUtils {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static validateAge(age: number): boolean {
    return age >= 16 && age <= 100;
  }

  static validateTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  static validateDateFormat(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }

  static validateFileType(mimetype: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimetype);
  }

  static validateFileSize(size: number, maxSize: number): boolean {
    return size <= maxSize;
  }

  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static validateRequired(value: any, fieldName: string): void {
    if (value === undefined || value === null || value === '') {
      throw new BadRequestException(`${fieldName} is required`);
    }
  }

  static validateStringLength(value: string, min: number, max: number, fieldName: string): void {
    if (value.length < min || value.length > max) {
      throw new BadRequestException(`${fieldName} must be between ${min} and ${max} characters`);
    }
  }

  static validateNumberRange(value: number, min: number, max: number, fieldName: string): void {
    if (value < min || value > max) {
      throw new BadRequestException(`${fieldName} must be between ${min} and ${max}`);
    }
  }

  static validateArrayLength(array: any[], min: number, max: number, fieldName: string): void {
    if (array.length < min || array.length > max) {
      throw new BadRequestException(`${fieldName} must have between ${min} and ${max} items`);
    }
  }
}
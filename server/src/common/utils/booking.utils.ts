import { APP_CONSTANTS } from '../constants/app.constants';
import { DateUtils } from './date.utils';

export class BookingUtils {
  static calculateTotalAmount(
    packageType: 'basic' | 'complete',
    hoursPerDay: number,
    daysPerWeek: number,
    subscriptionMonths: number
  ): number {
    const hourlyRates = {
      basic: 5,
      complete: 7,
    };

    const hourlyRate = hourlyRates[packageType];
    const weeksInMonth = 4;
    
    return hourlyRate * hoursPerDay * daysPerWeek * weeksInMonth * subscriptionMonths;
  }

  static calculatePlatformFee(totalAmount: number): number {
    return Math.round(totalAmount * (APP_CONSTANTS.PLATFORM.FEE_PERCENTAGE / 100) * 100) / 100;
  }

  static calculateUstaadhEarning(totalAmount: number): number {
    return totalAmount - this.calculatePlatformFee(totalAmount);
  }

  static validateBookingDates(startDate: string, endDate: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      errors.push('Start date cannot be in the past');
    }

    if (end <= start) {
      errors.push('End date must be after start date');
    }

    const maxAdvanceDate = DateUtils.addDays(now, APP_CONSTANTS.BOOKING.MAX_ADVANCE_DAYS);
    if (start > maxAdvanceDate) {
      errors.push(`Booking cannot be more than ${APP_CONSTANTS.BOOKING.MAX_ADVANCE_DAYS} days in advance`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static canCancelBooking(bookingDate: string): boolean {
    const booking = new Date(bookingDate);
    const now = new Date();
    const hoursUntilBooking = (booking.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilBooking >= APP_CONSTANTS.BOOKING.MIN_CANCELLATION_HOURS;
  }
}
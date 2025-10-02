export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "ustaadh" | "student";
  phoneNumber?: string;
  country?: string;
  city?: string;
  age?: number;
  isApproved?: boolean;
  createdAt: string;
  avatar?: string;
  bio?: string;
  experience?: string;
  specialties?: string[];
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  profileVisibility?: boolean;
}

export interface Booking {
  id: string;
  studentId: string;
  ustaadhId: string;
  packageType: "basic" | "complete";
  hoursPerDay: number;
  daysPerWeek: number;
  subscriptionMonths: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  startDate: string;
  endDate: string;
  schedule: ScheduleSlot[];
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
}

export type SalaryAdjustmentType = "bonus" | "deduction";

export interface SalaryAdjustment {
  id: string;
  type: SalaryAdjustmentType;
  label: string;
  amount: number;
  note?: string;
  createdAt: string;
}

export interface SalaryRecord {
  id: string;
  month: string; // YYYY-MM
  amount: number;
  status: "paid" | "scheduled" | "processing";
  scheduledPayoutDate: string;
  paidOn?: string;
  adjustments?: SalaryAdjustment[];
}

export interface CompensationPlan {
  ustaadhId: string;
  monthlySalary: number;
  currency: string;
  paymentDayOfMonth: number;
  effectiveFrom: string;
  nextReviewDate?: string;
  salaryHistory: SalaryRecord[];
}

export interface ScheduleSlot {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string;
  meetingLink?: string;
  status: "scheduled" | "completed" | "cancelled" | "missed";
  date: string;
}

export interface UstaadhAvailability {
  ustaadhId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Review {
  id: string;
  studentId: string;
  ustaadhId: string;
  rating: number;
  comment: string;
  createdAt: string;
  studentName: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  bookingId?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
}

export interface LessonMaterial {
  id: string;
  ustaadhId: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

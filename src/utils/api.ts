const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('al-abraar-token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }

    return response.json();
  }

  async patch(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }

    return response.json();
  }

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  APPROVE_USTAADH: (id: string) => `/auth/approve-ustaadh/${id}`,
  REJECT_USTAADH: (id: string) => `/auth/reject-ustaadh/${id}`,

  // Users
  USERS: '/users',
  PENDING_USTAADHSS: '/users/pending-ustaadhss',
  APPROVED_USTAADHSS: '/users/ustaadhss',
  USER_PROFILE: '/users/profile',
  USER_BY_ID: (id: string) => `/users/${id}`,

  // Bookings
  BOOKINGS: '/bookings',
  MY_BOOKINGS: '/bookings/my-bookings',
  UPCOMING_LESSONS: '/bookings/upcoming-lessons',
  BOOKING_BY_ID: (id: string) => `/bookings/${id}`,
  UPDATE_BOOKING_STATUS: (id: string) => `/bookings/${id}/status`,
  CANCEL_BOOKING: (id: string) => `/bookings/${id}/cancel`,

  // Payments
  CREATE_PAYMENT_INTENT: '/payments/create-intent',
  PAYMENT_WEBHOOK: '/payments/webhook',
  REFUND_PAYMENT: '/payments/refund',

  // Payroll
  UPSERT_PAYROLL_PLAN: '/payroll/plan',
  PAYROLL_PLAN_FOR: (ustaadhId: string) => `/payroll/plan/${ustaadhId}`,
  MY_PAYROLL_PLAN: '/payroll/my-plan',
  ADD_ADJUSTMENT: (ustaadhId: string) => `/payroll/plan/${ustaadhId}/adjustments`,
  MARK_PAID: (ustaadhId: string) => `/payroll/plan/${ustaadhId}/pay`,
  PAYROLL_OBLIGATIONS: (month?: string) => `/payroll/obligations${month ? `?month=${month}` : ''}`,

  // Messages
  MESSAGES: '/messages',
  CONVERSATIONS: '/messages/conversations',
  CONVERSATION: (partnerId: string) => `/messages/conversation/${partnerId}`,
  UNREAD_COUNT: '/messages/unread-count',
  MARK_READ: (id: string) => `/messages/${id}/read`,

  // Reviews
  REVIEWS: '/reviews',
  USTAADH_REVIEWS: (ustaadhId: string) => `/reviews/ustaadh/${ustaadhId}`,
  REVIEW_STATS: (ustaadhId: string) => `/reviews/ustaadh/${ustaadhId}/stats`,
  MY_REVIEWS: '/reviews/my-reviews',

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread-count',
  MARK_NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_NOTIFICATIONS_READ: '/notifications/mark-all-read',
};

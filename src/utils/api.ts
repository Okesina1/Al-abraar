const API_BASE_URL: string = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:3001/api';

// ApiResponse interface removed (not used) to avoid unused declaration warnings

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('al-abraar-token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // If user is suspended the server may return 403. Redirect to suspended page.
      if (response.status === 403) {
        try {
          // client-side redirect to a friendly suspended page
          if (typeof window !== 'undefined') {
            window.location.href = '/suspended';
          }
        } catch (e) {
          // ignore
        }
      }
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API Error: ${response.statusText}`);
    }
    return response.json();
  }

  async get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          ...this.getAuthHeaders(),
          ...(headers || {}),
        },
      });
      return this.handleResponse<T>(response);
    } catch (err: any) {
      throw new Error(err?.message || 'Network request failed');
    }
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse<T>(response);
    } catch (err: any) {
      throw new Error(err?.message || 'Network request failed');
    }
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse<T>(response);
    } catch (err: any) {
      throw new Error(err?.message || 'Network request failed');
    }
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse<T>(response);
    } catch (err: any) {
      throw new Error(err?.message || 'Network request failed');
    }
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse<T>(response);
    } catch (err: any) {
      throw new Error(err?.message || 'Network request failed');
    }
  }

  async uploadFile(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<any> {
    try {
      const token = localStorage.getItem('al-abraar-token');
      const formData = new FormData();
      formData.append('file', file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      return this.handleResponse(response);
    } catch (err: any) {
      throw new Error(err?.message || 'Network request failed');
    }
  }
}

export const apiClient = new ApiClient();

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  register: (userData: any) =>
    apiClient.post('/auth/register', userData),

  verifyEmail: (email: string, code: string) =>
    apiClient.post('/auth/verify-email', { email, code }),

  resendVerification: (email: string) =>
    apiClient.post('/auth/resend-verification', { email }),

  approveUstaadh: (id: string) =>
    apiClient.patch(`/auth/approve-ustaadh/${id}`),

  rejectUstaadh: (id: string, reason?: string) =>
    apiClient.patch(`/auth/reject-ustaadh/${id}`, { reason }),
};

export const usersApi = {
  getProfile: () =>
    apiClient.get('/users/profile'),

  updateProfile: (data: any) =>
    apiClient.patch('/users/profile', data),

  getUsers: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`/users${query}`);
  },

  getUserById: (id: string) =>
    apiClient.get(`/users/${id}`),

  updateUser: (id: string, data: any) =>
    apiClient.patch(`/users/${id}`, data),

  deleteUser: (id: string) =>
    apiClient.delete(`/users/${id}`),

  suspendUser: (id: string, data?: { reason?: string }) =>
    apiClient.patch(`/users/${id}/suspend`, data),

  activateUser: (id: string) =>
    apiClient.patch(`/users/${id}/activate`),

  getPendingUstaadhss: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`/users/pending-ustaadhss${query}`);
  },

  getApprovedUstaadhss: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`/users/ustaadhss${query}`);
  },
};

export const bookingsApi = {
  createBooking: (data: any) =>
    apiClient.post('/bookings', data),

  getMyBookings: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`/bookings/my-bookings${query}`);
  },

  getBookingById: (id: string) =>
    apiClient.get(`/bookings/${id}`),

  updateBooking: (id: string, data: any) =>
    apiClient.patch(`/bookings/${id}`, data),

  updateBookingStatus: (id: string, status: string) =>
    apiClient.patch(`/bookings/${id}/status`, { status }),

  cancelBooking: (id: string, reason: string) =>
    apiClient.patch(`/bookings/${id}/cancel`, { reason }),

  getUpcomingLessons: () =>
    apiClient.get('/bookings/upcoming-lessons'),

  getAllBookings: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`/bookings/all${query}`);
  },
};

export const availabilityApi = {
  getAvailability: (ustaadhId: string) => {
    const ts = Date.now().toString();
    console.debug('[API] availability.getAvailability called for id=', ustaadhId);
    return apiClient.get(`/availability/ustaadh/${ustaadhId}?_t=${ts}`, { 'x-cache-bust': ts, 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' });
  },

  getAvailableTimeSlots: (ustaadhId: string, date: string) => {
    const ts = Date.now().toString();
    console.debug('[API] availability.getAvailableTimeSlots called for id=', ustaadhId, 'date=', date);
    const query = `?date=${encodeURIComponent(date)}&_t=${ts}`;
    return apiClient.get(`/availability/ustaadh/${ustaadhId}/available${query}`, { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' });
  },

  setAvailability: (data: any[]) =>
    apiClient.post('/availability', data),

  checkSlotAvailability: (ustaadhId: string, date: string, startTime: string, endTime: string) =>
    apiClient.get(`/availability/check?ustaadhId=${ustaadhId}&date=${date}&startTime=${startTime}&endTime=${endTime}`),

  getReservations: (ustaadhId?: string, date?: string) => {
    const params: string[] = [];
    if (ustaadhId) params.push(`ustaadhId=${encodeURIComponent(ustaadhId)}`);
    if (date) params.push(`date=${encodeURIComponent(date)}`);
    const q = params.length ? `?${params.join('&')}` : '';
    return apiClient.get(`/availability/admin/reservations${q}`);
  },

  deleteReservation: (id: string) =>
    apiClient.delete(`/availability/admin/reservations/${id}`),
};

export const paymentsApi = {
  createPaymentIntent: (data: { bookingId: string; amount: number; currency: string }) =>
    apiClient.post('/payments/create-intent', data),

  confirmPayment: (paymentIntentId: string) =>
    apiClient.post('/payments/confirm', { paymentIntentId }),

  refundPayment: (data: { paymentIntentId: string; amount?: number; reason: string }) =>
    apiClient.post('/payments/refund', data),

  getPaymentHistory: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`/payments/history${query}`);
  },
};

export const payrollApi = {
  upsertCompensationPlan: (data: any) =>
    apiClient.post('/payroll/plan', data),

  getCompensationPlan: (ustaadhId: string) =>
    apiClient.get(`/payroll/plan/${ustaadhId}`),

  getMyCompensationPlan: () =>
    apiClient.get('/payroll/my-plan'),

  addAdjustment: (ustaadhId: string, data: any) =>
    apiClient.patch(`/payroll/plan/${ustaadhId}/adjustments`, data),

  // Server MarkPaidDto expects { month: string, paidOn?: string }
  markPaid: (ustaadhId: string, data: { month: string; paidOn?: string }) =>
    apiClient.patch(`/payroll/plan/${ustaadhId}/pay`, data),

  getPayrollObligations: (month?: string) => {
    const query = month ? `?month=${month}` : '';
    return apiClient.get(`/payroll/obligations${query}`);
  },
  getAllPlans: () => apiClient.get('/payroll/plans'),
};

export const messagesApi = {
  sendMessage: (data: { receiverId: string; content: string; bookingId?: string }) =>
    apiClient.post('/messages', data),

  getMessages: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`/messages${query}`);
  },

  getConversations: () =>
    apiClient.get('/messages/conversations'),

  getConversation: (partnerId: string, params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`/messages/conversation/${partnerId}${query}`);
  },

  markAsRead: (messageId: string) =>
    apiClient.patch(`/messages/${messageId}/read`, {}),

  getUnreadCount: () =>
    apiClient.get('/messages/unread-count'),
};

export const reviewsApi = {
  createReview: (data: { ustaadhId: string; rating: number; comment: string; bookingId?: string }) =>
    apiClient.post('/reviews', data),

  getUstaadhReviews: (ustaadhId: string, params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`/reviews/ustaadh/${ustaadhId}${query}`);
  },

  getReviewStats: (ustaadhId: string) =>
    apiClient.get(`/reviews/ustaadh/${ustaadhId}/stats`),

  getMyReviews: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`/reviews/my-reviews${query}`);
  },

  updateReview: (id: string, data: any) =>
    apiClient.patch(`/reviews/${id}`, data),

  deleteReview: (id: string) =>
    apiClient.delete(`/reviews/${id}`),
};

export const notificationsApi = {
  getNotifications: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`/notifications${query}`);
  },

  markAsRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`, {}),

  markAllAsRead: () =>
    apiClient.patch('/notifications/mark-all-read', {}),

  getUnreadCount: () =>
    apiClient.get('/notifications/unread-count'),

  deleteNotification: (id: string) =>
    apiClient.delete(`/notifications/${id}`),
};

export const analyticsApi = {
  getDashboardStats: () => apiClient.get('/analytics/dashboard'),
  getRevenueReport: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`/analytics/revenue${query}`);
  },
  getRevenueAnalytics: (period?: string) => {
    const q = period ? `?period=${encodeURIComponent(period)}` : '';
    return apiClient.get(`/analytics/revenue${q}`);
  },
  getUserGrowth: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`/analytics/growth${query}`);
  },
  getGrowthMetrics: () => apiClient.get('/analytics/growth'),
  getTopUstaadhs: (limit?: number) => {
    const q = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/analytics/top-ustaadhs${q}`);
  },
  getBookingTrends: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`/analytics/booking-trends${query}`);
  },
};

export const testimonialsApi = {
  listPublished: () => apiClient.get('/testimonials'),
  listAll: () => apiClient.get('/testimonials/admin'),
  create: (data: any) => apiClient.post('/testimonials', data),
  update: (id: string, data: any) => apiClient.patch(`/testimonials/${id}`, data),
  remove: (id: string) => apiClient.delete(`/testimonials/${id}`),
};

export const uploadsApi = {
  uploadFile: (file: File, folder?: string, resourceType?: string, tags?: string) => {
    const additionalData: Record<string, string> = {};
    if (folder) additionalData.folder = folder;
    if (resourceType) additionalData.resourceType = resourceType;
    if (tags) additionalData.tags = tags;

    return apiClient.uploadFile('/uploads', file, additionalData);
  },

  deleteFile: (publicId: string) =>
    apiClient.delete(`/uploads/${publicId}`),
};

export const settingsApi = {
  getSettings: () => apiClient.get('/settings'),
  getAllSettings: () => apiClient.get('/settings/admin'),
  updatePricing: (data: { basic: number; complete: number }) => apiClient.patch('/settings/pricing', data),
  updateRefundPolicy: (data: { enabled: boolean; windowDays: number }) => apiClient.patch('/settings/refund-policy', data),
  updateCourseAvailability: (data: Record<string, boolean>) => apiClient.patch('/settings/course-availability', data),
  updatePublicStats: (data: { activeStudents?: number; countries?: number; avgRating?: number }) => apiClient.patch('/settings/public-stats', data),
};

export const achievementsApi = {
  getMyAchievements: () =>
    apiClient.get('/achievements/my-achievements'),
};

export const referralsApi = {
  getMyReferrals: () =>
    apiClient.get('/referrals/my-referrals'),
};

export const healthApi = {
  getHealth: () =>
    apiClient.get('/health'),

  getDatabaseHealth: () =>
    apiClient.get('/health/detailed'),
};

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  APPROVE_USTAADH: (id: string) => `/auth/approve-ustaadh/${id}`,
  REJECT_USTAADH: (id: string) => `/auth/reject-ustaadh/${id}`,

  USERS: '/users',
  PENDING_USTAADHSS: '/users/pending-ustaadhss',
  APPROVED_USTAADHSS: '/users/ustaadhss',
  USER_PROFILE: '/users/profile',
  USER_BY_ID: (id: string) => `/users/${id}`,

  BOOKINGS: '/bookings',
  MY_BOOKINGS: '/bookings/my-bookings',
  UPCOMING_LESSONS: '/bookings/upcoming-lessons',
  BOOKING_BY_ID: (id: string) => `/bookings/${id}`,
  UPDATE_BOOKING_STATUS: (id: string) => `/bookings/${id}/status`,
  CANCEL_BOOKING: (id: string) => `/bookings/${id}/cancel`,

  PAYMENTS: '/payments',
  CREATE_PAYMENT_INTENT: '/payments/create-intent',
  PAYMENT_WEBHOOK: '/payments/webhook',
  REFUND_PAYMENT: '/payments/refund',

  PAYROLL: '/payroll',
  UPSERT_PAYROLL_PLAN: '/payroll/plan',
  PAYROLL_PLAN_FOR: (ustaadhId: string) => `/payroll/plan/${ustaadhId}`,
  MY_PAYROLL_PLAN: '/payroll/my-plan',
  ADD_ADJUSTMENT: (ustaadhId: string) => `/payroll/plan/${ustaadhId}/adjustments`,
  MARK_PAID: (ustaadhId: string) => `/payroll/plan/${ustaadhId}/pay`,
  PAYROLL_OBLIGATIONS: (month?: string) => `/payroll/obligations${month ? `?month=${month}` : ''}`,

  MESSAGES: '/messages',
  CONVERSATIONS: '/messages/conversations',
  CONVERSATION: (partnerId: string) => `/messages/conversation/${partnerId}`,
  UNREAD_COUNT: '/messages/unread-count',
  MARK_READ: (id: string) => `/messages/${id}/read`,

  REVIEWS: '/reviews',
  USTAADH_REVIEWS: (ustaadhId: string) => `/reviews/ustaadh/${ustaadhId}`,
  REVIEW_STATS: (ustaadhId: string) => `/reviews/ustaadh/${ustaadhId}/stats`,
  MY_REVIEWS: '/reviews/my-reviews',

  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread-count',
  MARK_NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_NOTIFICATIONS_READ: '/notifications/mark-all-read',
};

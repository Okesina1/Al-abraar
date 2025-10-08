import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationsContext";
import { NotificationCenter } from "../notifications/NotificationCenter";
import {
  LogOut,
  Bell,
  User,
  Settings,
  Menu,
  X,
  Home,
  Users,
  Calendar,
  CreditCard,
  MessageCircle,
  Search,
  TrendingUp,
  CheckCircle,
  DollarSign,
  ClipboardList,
  Star,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const LangToggle: React.FC = () => {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center border rounded-md overflow-hidden">
      <button
        onClick={() => setLang("en")}
        className={`px-2 py-1 text-sm ${lang === "en" ? "bg-gray-100 text-gray-800" : "text-gray-500"}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("ar")}
        className={`px-2 py-1 text-sm ${lang === "ar" ? "bg-gray-100 text-gray-800" : "text-gray-500"}`}
      >
        AR
      </button>
    </div>
  );
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { name: "Messages", href: "/messages", icon: MessageCircle },
      { name: "Profile", href: "/profile", icon: User },
    ];

    switch (user.role) {
      case "admin":
        return [
          { name: "Overview", href: "/admin", icon: Home },
          { name: "Approvals", href: "/admin/approvals", icon: CheckCircle },
          { name: "Users", href: "/admin/users", icon: Users },
          { name: "Bookings", href: "/admin/bookings", icon: Calendar },
          { name: "Payments", href: "/admin/payments", icon: DollarSign },
          { name: "Payroll", href: "/admin/payroll", icon: ClipboardList },
          { name: "Reports", href: "/admin/reports", icon: TrendingUp },
          { name: "Testimonials", href: "/admin/testimonials", icon: Star },
          { name: "Settings", href: "/admin/settings", icon: Settings },
          ...baseItems,
        ];
      case "ustaadh":
        return [
          { name: "Dashboard", href: "/ustaadh", icon: Home },
          { name: "Schedule", href: "/ustaadh/schedule", icon: Calendar },
          { name: "Students", href: "/ustaadh/students", icon: Users },
          { name: "Earnings", href: "/ustaadh/earnings", icon: DollarSign },
          ...baseItems,
        ];
      case "student":
        return [
          { name: "Dashboard", href: "/student", icon: Home },
          { name: "Browse Ustaadhs", href: "/student/browse", icon: Search },
          { name: "My Lessons", href: "/student/lessons", icon: Calendar },
          { name: "Payments", href: "/student/payments", icon: CreditCard },
          ...baseItems,
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-12 h-10 rounded-lg flex items-center justify-center">
              <img
                src="/images/al-abraar-bg.png"
                alt="Al-Abraar Logo"
                className="w-12 h-10 rounded-lg object-cover"
              />
            </div>
            <span className="text-xl font-bold text-gray-800">Al-Abraar</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive
                        ? "text-green-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-green-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-green-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setNotificationOpen(true)}
                className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] leading-4 rounded-full text-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 capitalize">
                {user?.role} Portal
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setNotificationOpen(true)}
                className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] leading-4 rounded-full text-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-green-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </div>
                <div className="hidden xl:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>

              <LangToggle />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </div>
  );
};

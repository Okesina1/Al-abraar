import { useEffect, useMemo, useState } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { BookingModal } from '../../components/booking/BookingModal';
import { MessageCenter } from '../../components/messaging/MessageCenter';
import { UstaadhCard } from '../../components/student/UstaadhCard';
import { ReviewSystem } from '../../components/reviews/ReviewSystem';
import { useToast } from '../../contexts/ToastContext';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { usersApi } from '../../utils/api';
import { User } from '../../types';

const PACKAGE_SPECIALTIES: Record<string, string[]> = {
  basic: ["Qur'an", 'Tajweed', 'Memorization'],
  complete: ['Arabic', 'Islamic Studies', 'Fiqh', 'Hadeeth'],
};

export const StudentBrowsePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedUstaadh, setSelectedUstaadh] = useState<User | null>(null);
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<{ id: string; name: string } | null>(null);
  const toast = useToast();
  const [showReviews, setShowReviews] = useState(false);
  const [selectedForReviews, setSelectedForReviews] = useState<User | null>(null);
  const [ustaadhs, setUstaadhs] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUstaadhs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await usersApi.getApprovedUstaadhss({ limit: '100' });
        const fetchedUstaadhs = Array.isArray(response?.ustaadhs)
          ? response.ustaadhs
          : Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

        if (isMounted) {
          setUstaadhs(
            fetchedUstaadhs.map((ustaadh) => ({
              ...ustaadh,
              id: ustaadh.id || ustaadh._id || ustaadh.userId,
            }))
          );
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to load Ustaadh list.';
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUstaadhs();

    return () => {
      isMounted = false;
    };
  }, []);

  const countries = useMemo(() => {
    const uniqueCountries = new Set<string>();
    ustaadhs.forEach((ustaadh) => {
      if (ustaadh.country) {
        uniqueCountries.add(ustaadh.country);
      }
    });
    return Array.from(uniqueCountries).sort();
  }, [ustaadhs]);

  const filteredUstaadhs = useMemo(() => {
    const packageSpecialties = selectedPackage ? PACKAGE_SPECIALTIES[selectedPackage] || [] : [];

    return ustaadhs
      .filter((ustaadh) => {
        const specialties = ustaadh.specialties || [];
        const matchesSearch = searchTerm
          ? ustaadh.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            specialties.some((specialty) => specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (ustaadh.bio ? ustaadh.bio.toLowerCase().includes(searchTerm.toLowerCase()) : false)
          : true;

        const matchesCountry = selectedCountry ? ustaadh.country === selectedCountry : true;

        const matchesPackage = selectedPackage
          ? specialties.some((specialty) =>
              packageSpecialties.some((packageSpecialty) =>
                specialty.toLowerCase().includes(packageSpecialty.toLowerCase())
              )
            )
          : true;

        return matchesSearch && matchesCountry && matchesPackage;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'reviews':
            return (b.reviewCount || 0) - (a.reviewCount || 0);
          case 'experience': {
            const parseYears = (value?: string) => {
              if (!value) return 0;
              const match = value.match(/\d+/);
              return match ? parseInt(match[0], 10) : 0;
            };
            return parseYears(b.experience) - parseYears(a.experience);
          }
          default:
            return 0;
        }
      });
  }, [ustaadhs, searchTerm, selectedCountry, selectedPackage, sortBy]);

  const handleBookUstaadh = (ustaadh: User) => {
    setSelectedUstaadh(ustaadh);
    setShowBookingModal(true);
  };

  const handleMessageUstaadh = (ustaadhId: string, ustaadhName: string) => {
    setMessageRecipient({ id: ustaadhId, name: ustaadhName });
    setShowMessageCenter(true);
  };

  const handleViewReviews = (ustaadh: User) => {
    setSelectedForReviews(ustaadh);
    setShowReviews(true);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow-md p-12 flex flex-col items-center justify-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-600">Loading Ustaadhs...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-xl shadow-md p-8">
          <p className="text-center text-sm text-red-600">{error}</p>
        </div>
      );
    }

    if (filteredUstaadhs.length === 0) {
      return (
        <EmptyState
          icon={Search}
          title="No Ustaadhs Found"
          description="No teachers match your current search criteria. Try adjusting your filters or search terms."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredUstaadhs.map((ustaadh) => (
          <UstaadhCard
            key={ustaadh.id}
            ustaadh={ustaadh}
            onBook={handleBookUstaadh}
            onMessage={handleMessageUstaadh}
            onViewReviews={handleViewReviews}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Browse Ustaadhs</h1>
        <div className="text-sm text-gray-600">
          {loading ? 'Loading...' : `${filteredUstaadhs.length} teacher${filteredUstaadhs.length !== 1 ? 's' : ''} available`}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          <select
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Packages</option>
            <option value="basic">Qur'an & Tajweed</option>
            <option value="complete">Complete Package</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="rating">Sort by Rating</option>
            <option value="reviews">Sort by Reviews</option>
            <option value="experience">Sort by Experience</option>
          </select>
        </div>
      </div>

      {renderContent()}

      {showBookingModal && selectedUstaadh && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedUstaadh(null);
          }}
          ustaadh={selectedUstaadh}
        />
      )}

      {showMessageCenter && (
        <MessageCenter
          isOpen={showMessageCenter}
          onClose={() => {
            setShowMessageCenter(false);
            setMessageRecipient(null);
          }}
          recipientId={messageRecipient?.id}
          recipientName={messageRecipient?.name}
        />
      )}

      {showReviews && selectedForReviews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-800">Reviews for {selectedForReviews.fullName}</h2>
              </div>
              <button onClick={() => setShowReviews(false)} className="p-1 hover:bg-gray-100 rounded-full">
                ×
              </button>
            </div>
            <div className="p-4">
              <ReviewSystem
                ustaadhId={selectedForReviews.id}
                canLeaveReview={true}
                onSubmitReview={() => toast.success('Review submitted!')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

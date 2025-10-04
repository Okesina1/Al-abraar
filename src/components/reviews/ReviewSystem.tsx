import React, { useEffect, useState } from "react";
import { reviewsApi } from "../../utils/api";
import { useToast } from "../../contexts/ToastContext";
import { Star, MessageSquare, ThumbsUp, User } from "lucide-react";

interface ReviewSystemProps {
  ustaadhId: string;
  canLeaveReview?: boolean;
  onSubmitReview?: (rating: number, comment: string) => void;
}

interface Review {
  id: string;
  studentId: string;
  ustaadhId: string;
  rating: number;
  comment: string;
  createdAt: string;
  studentName: string;
  studentAvatar?: string;
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({
  ustaadhId,
  canLeaveReview = false,
  onSubmitReview,
}) => {
  const toast = useToast();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await reviewsApi.getUstaadhReviews(ustaadhId);
        const raw = (res && (res.data ?? res)) || [];
        const data = (raw as unknown[]).map((ri) => {
          const r = ri as Record<string, unknown>;
          // server may populate studentId with the student's document
          const studentName =
            (r["studentName"] as string) ||
            (r["student"] &&
              ((r["student"] as Record<string, unknown>)[
                "fullName"
              ] as string)) ||
            (r["studentId"] &&
              ((r["studentId"] as Record<string, unknown>)[
                "fullName"
              ] as string)) ||
            (typeof r["studentId"] === "string"
              ? (r["studentId"] as string)
              : undefined) ||
            "Anonymous";
          return {
            id: (r.id as string) || (r._id as string) || String(Math.random()),
            studentId: (() => {
              const sid = r["studentId"];
              if (typeof sid === "string") return sid;
              if (sid && typeof sid === "object") {
                const sidObj = sid as Record<string, unknown>;
                return (sidObj["_id"] as string) || "";
              }
              const sObj = r["student"] as Record<string, unknown> | undefined;
              return (sObj && (sObj["_id"] as string)) || "";
            })(),
            ustaadhId: r.ustaadhId as string,
            rating: r.rating as number,
            comment: r.comment as string,
            createdAt: r.createdAt as string,
            studentName,
            studentAvatar: (() => {
              const student = r["student"] as
                | Record<string, unknown>
                | undefined;
              const studentId = r["studentId"] as
                | Record<string, unknown>
                | undefined;
              return (
                (student?.["avatar"] as string) ||
                (studentId?.["avatar"] as string) ||
                undefined
              );
            })(),
          };
        });
        if (mounted) setReviews(data as Review[]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (mounted) setError(message || "Failed to load reviews");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (ustaadhId) load();
    return () => {
      mounted = false;
    };
  }, [ustaadhId]);

  const ustaadhReviews = reviews.filter(
    (review) => review.ustaadhId === ustaadhId
  );
  const averageRating =
    ustaadhReviews.length > 0
      ? ustaadhReviews.reduce((sum, review) => sum + review.rating, 0) /
        ustaadhReviews.length
      : 0;

  const handleSubmitReview = async () => {
    if (rating === 0 || !comment.trim()) return;

    try {
      // Submit directly to API
      await reviewsApi.createReview({
        ustaadhId,
        rating,
        comment: comment.trim(),
      });

      // Optimistically add review to local list (studentName unknown - use 'You')
      const newReview: Review = {
        id: `${Date.now()}`,
        studentId: "me",
        ustaadhId,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        studentName: "You",
      };
      setReviews((prev) => [newReview, ...prev]);

      toast.success("Review submitted!");

      if (onSubmitReview) {
        try {
          await onSubmitReview(rating, comment.trim());
        } catch {
          // parent handler failed; ignore
        }
      }

      setShowReviewForm(false);
      setRating(0);
      setComment("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "Failed to submit review");
    }
  };

  const renderStars = (
    rating: number,
    interactive = false,
    size = "h-5 w-5"
  ) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} cursor-pointer transition-colors ${
              star <= (interactive ? hoveredRating || rating : rating)
                ? "text-yellow-500 fill-current"
                : "text-gray-300"
            }`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={
              interactive ? () => setHoveredRating(star) : undefined
            }
            onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Reviews & Ratings
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-lg font-semibold text-gray-800">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-600">
              ({ustaadhReviews.length} review
              {ustaadhReviews.length !== 1 ? "s" : ""})
            </span>
          </div>
        </div>

        {canLeaveReview && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Write Review</span>
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-800 mb-3">Leave a Review</h4>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            {renderStars(rating, true, "h-6 w-6")}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this Ustaadh..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSubmitReview}
              disabled={rating === 0 || !comment.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Review
            </button>
            <button
              onClick={() => {
                setShowReviewForm(false);
                setRating(0);
                setComment("");
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-600">
            Loading reviews...
          </div>
        ) : error ? (
          <div className="text-center py-6 text-sm text-red-600">{error}</div>
        ) : ustaadhReviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No reviews yet</p>
            <p className="text-gray-500 text-sm">
              Be the first to leave a review!
            </p>
          </div>
        ) : (
          ustaadhReviews.map((review) => (
            <div
              key={review.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                    {review.studentAvatar ? (
                      <img
                        src={review.studentAvatar}
                        alt={review.studentName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {review.studentName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              <p className="text-gray-700 leading-relaxed">{review.comment}</p>

              <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-100">
                <button className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">Helpful</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

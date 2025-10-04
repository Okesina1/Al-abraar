import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, BookOpen, Eye, Download } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { usersApi, authApi } from "../../utils/api";

interface PendingUstaadh {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;
  country?: string;
  city?: string;
  age?: number;
  phoneNumber?: string;
  experience?: string;
  specialties?: string[];
  submittedAt?: string;
  cvUrl?: string;
}

export const AdminApprovalsPage: React.FC = () => {
  const toast = useToast();
  const [pendingApprovals, setPendingApprovals] = useState<PendingUstaadh[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await usersApi.getPendingUstaadhss();
        const list: PendingUstaadh[] = Array.isArray(res?.ustaadhs)
          ? res.ustaadhs
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
              ? res
              : [];
        if (!mounted) return;
        setPendingApprovals(list.map((u) => ({ ...u, id: u.id || u._id })));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (mounted) setError(message || "Failed to load pending approvals");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const [selectedUstaadh, setSelectedUstaadh] = useState<PendingUstaadh | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [selectedForReject, setSelectedForReject] =
    useState<PendingUstaadh | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const handleApprove = async (ustaadhId?: string) => {
    if (!ustaadhId) {
      toast.error("Missing ustaadh id");
      return;
    }
    try {
      await authApi.approveUstaadh(ustaadhId);
      setPendingApprovals((prev) => prev.filter((u) => u.id !== ustaadhId));
      toast.success("Ustaadh approved successfully! Confirmation email sent.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "Failed to approve");
    }
  };

  const handleReject = async (ustaadhId?: string, reason?: string) => {
    if (!ustaadhId) {
      toast.error("Missing ustaadh id");
      return;
    }
    try {
      await authApi.rejectUstaadh(ustaadhId, reason || "Not a good fit");
      setPendingApprovals((prev) => prev.filter((u) => u.id !== ustaadhId));
      toast.info("Ustaadh application rejected. Notification email sent.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "Failed to reject");
    }
  };

  const openRejectModal = (u: PendingUstaadh) => {
    setSelectedForReject(u);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedForReject) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setRejecting(true);
    try {
      await handleReject(selectedForReject.id, rejectReason.trim());
      setShowRejectModal(false);
      setSelectedForReject(null);
      setRejectReason("");
    } finally {
      setRejecting(false);
    }
  };

  const UstaadhModal = () => {
    if (!selectedUstaadh) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Ustaadh Application
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedUstaadh.fullName}
                </h3>
                <p className="text-gray-600">{selectedUstaadh.email}</p>
                <p className="text-sm text-gray-500">
                  {selectedUstaadh.city}, {selectedUstaadh.country}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedUstaadh.phoneNumber}
                    </p>
                    <p>
                      <span className="font-medium">Age:</span>{" "}
                      {selectedUstaadh.age} years
                    </p>
                    <p>
                      <span className="font-medium">Location:</span>{" "}
                      {selectedUstaadh.city}, {selectedUstaadh.country}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Experience
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedUstaadh.experience}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Specialties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedUstaadh.specialties || []).map(
                      (specialty: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Application Date
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedUstaadh.submittedAt
                      ? new Date(selectedUstaadh.submittedAt).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <a
                href={selectedUstaadh.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download CV</span>
              </a>
              <button
                onClick={() => handleApprove(selectedUstaadh.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleReject(selectedUstaadh.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ustaadh Approvals</h1>
        <div className="text-sm text-gray-600">
          {pendingApprovals.length} pending application
          {pendingApprovals.length !== 1 ? "s" : ""}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-6 rounded bg-blue-50 text-blue-700 border border-blue-200">
          Loading pending approvals...
        </div>
      ) : pendingApprovals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">No pending approvals at this time</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingApprovals.map((ustaadh) => (
            <div
              key={ustaadh.id || ustaadh._id || ustaadh.email}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-800">
                      {ustaadh.fullName}
                    </h4>
                    <p className="text-gray-600">{ustaadh.email}</p>
                    <p className="text-sm text-gray-500">
                      {ustaadh.city}, {ustaadh.country}
                    </p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">
                          Experience:
                        </span>
                        <p className="text-gray-600">{ustaadh.experience}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Specialties:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(ustaadh.specialties || [])
                            .slice(0, 3)
                            .map((specialty, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              >
                                {specialty}
                              </span>
                            ))}
                          {(ustaadh.specialties || []).length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{(ustaadh.specialties || []).length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Submitted:{" "}
                      {ustaadh.submittedAt
                        ? new Date(ustaadh.submittedAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:ml-6">
                  <button
                    onClick={() => {
                      setSelectedUstaadh(ustaadh);
                      setShowModal(true);
                    }}
                    className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm flex items-center justify-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => handleApprove(ustaadh.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => openRejectModal(ustaadh)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center space-x-1"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <UstaadhModal />}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Reject Ustaadh Application
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejection. This will be sent to the
              applicant.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={5}
              className="w-full p-3 border rounded-lg mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedForReject(null);
                  setRejectReason("");
                }}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={rejecting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {rejecting ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

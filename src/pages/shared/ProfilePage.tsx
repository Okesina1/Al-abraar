import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Save,
  CreditCard as Edit,
  Camera,
  AlertCircle,
} from "lucide-react";
import { fetchCountries, fetchStates } from "../../utils/locations";
import type { User as AppUser } from "../../types";

// Form shape used on this page
type ProfileForm = {
  fullName: string;
  phoneNumber: string;
  country: string;
  city: string;
  age: string | number;
  bio: string;
  experience: string;
  specialties: string[];
  emailNotifications: boolean;
  smsNotifications: boolean;
  profileVisibility: boolean;
};

// cvUrl is now part of AppUser (see src/types)

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const SPECIALTIES_OPTIONS = ["Tajweed", "Arabic", "Quran", "Hadeeth"];
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadingCvProgress, setUploadingCvProgress] = useState(0);
  const [formData, setFormData] = useState<ProfileForm>({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    country: user?.country || "",
    city: user?.city || "",
    age: user?.age || "",
    bio: user?.bio || "",
    experience: (user as unknown as AppUser)?.experience || "",
    specialties: (user as unknown as AppUser)?.specialties || [],
    emailNotifications: user?.emailNotifications ?? true,
    smsNotifications: user?.smsNotifications ?? false,
    profileVisibility: user?.profileVisibility ?? true,
  });

  useEffect(() => {
    if (user) {
      const u = user as unknown as AppUser;
      setFormData({
        fullName: u.fullName || "",
        phoneNumber: u.phoneNumber || "",
        country: u.country || "",
        city: u.city || "",
        age: u.age || "",
        bio: u.bio || "",
        experience: u.experience || "",
        specialties: u.specialties || [],
        emailNotifications: u.emailNotifications ?? true,
        smsNotifications: u.smsNotifications ?? false,
        profileVisibility: u.profileVisibility ?? true,
      });
    }
  }, [user]);

  // DOB state for editing
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");

  // Location state
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [statesError, setStatesError] = useState("");

  // Load countries on component mount
  useEffect(() => {
    let mounted = true;
    setCountriesLoading(true);
    fetchCountries()
      .then((list) => {
        if (mounted) setCountries(list);
      })
      .catch((e) => console.warn("Failed to load countries", e))
      .finally(() => {
        if (mounted) setCountriesLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Load states when country changes
  useEffect(() => {
    let mounted = true;
    setStatesError("");
    if (formData.country) {
      setStatesLoading(true);
      fetchStates(formData.country)
        .then((list) => {
          if (mounted) setStates(list);
        })
        .catch(() => {
          if (mounted) {
            setStates([]);
            setStatesError("Failed to load states for selected country");
          }
        })
        .finally(() => {
          if (mounted) setStatesLoading(false);
        });
      // reset selected state when country changes
      setFormData((prev) => ({ ...prev, city: "" }));
    } else {
      setStates([]);
    }

    return () => {
      mounted = false;
    };
  }, [formData.country]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    // Special handling for multi-select specialties
    if (e.target.name === "specialties") {
      const select = e.target as HTMLSelectElement;
      const values = Array.from(select.selectedOptions).map((o) => o.value);
      setFormData({
        ...formData,
        specialties: values,
      });
      return;
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleToggleChange = async (field: string) => {
    const newValue = !formData[field as keyof typeof formData];

    setFormData({
      ...formData,
      [field]: newValue,
    });

    try {
      await updateUser({
        [field]: newValue,
      });
    } catch (err: unknown) {
      setFormData({
        ...formData,
        [field]: !newValue,
      });
      setError((err as Error).message || "Failed to update setting");
    }
  };

  const handleSave = async () => {
    setError("");

    let ageData: number | undefined = undefined;
    if (dobDay && dobMonth && dobYear) {
      // Calculate age from DOB
      const birthDate = new Date(
        parseInt(dobYear),
        parseInt(dobMonth) - 1,
        parseInt(dobDay)
      );
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      if (calculatedAge < 12 || calculatedAge > 100) {
        setError("You must be between 16 and 100 years old");
        return;
      }
      ageData = calculatedAge;
    } else if (formData.age) {
      const parsedAge =
        typeof formData.age === "string"
          ? parseInt(formData.age)
          : formData.age;
      if (!isNaN(parsedAge) && parsedAge >= 16 && parsedAge <= 100) {
        ageData = parsedAge;
      }
    }

    try {
      // Ensure specialties is an array and validate 1-4 selection
      const specialtiesArray = Array.isArray(formData.specialties)
        ? (formData.specialties as string[])
        : [];

      if (specialtiesArray.length < 1) {
        setError("Please select at least 1 specialty");
        return;
      }
      if (specialtiesArray.length > 4) {
        setError("You can select up to 4 specialties");
        return;
      }

      await updateUser({
        ...(formData as unknown as Partial<AppUser>),
        age: ageData,
        specialties: specialtiesArray,
      } as Partial<AppUser>);
      setIsEditing(false);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to update profile");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Define allowed image types
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 10MB - matching server config)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB");
      return;
    }

    try {
      setUploadingAvatar(true);
      setError("");

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars"); // Store in avatars folder
      formData.append("resourceType", "image");

      // Upload to server
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api"}/users/avatar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("al-abraar-token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();

      // Update user state with new avatar URL
      if (data.url) {
        await updateUser({ avatar: data.url });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Accept common document types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a PDF or Word document for your CV");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("CV size should be less than 10MB");
      return;
    }

    try {
      setUploadingCv(true);
      setUploadingCvProgress(0);
      setError("");

      // Use XMLHttpRequest to get upload progress and send multipart/form-data to /uploads
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api"}/uploads`;
        xhr.open("POST", url);
        const token = localStorage.getItem("al-abraar-token");
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            setUploadingCvProgress(pct);
          }
        };

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              const cvUrl = res?.url;
              if (!cvUrl) return reject(new Error("Upload returned no URL"));
              // Persist cvUrl: declare as Partial<AppUser> so no explicit any is needed
              await updateUser({ cvUrl } as Partial<AppUser>);
              resolve(undefined);
            } catch (err) {
              reject(err);
            }
          } else {
            // Try to parse error from server
            try {
              const err = JSON.parse(xhr.responseText);
              reject(
                new Error(
                  err?.message || `Upload failed with status ${xhr.status}`
                )
              );
            } catch (parseErr: unknown) {
              const parsedMessage =
                typeof parseErr === "object" &&
                parseErr !== null &&
                "message" in parseErr
                  ? (parseErr as { message?: string }).message
                  : undefined;
              reject(
                new Error(
                  parsedMessage || `Upload failed with status ${xhr.status}`
                )
              );
            }
          }
        };

        xhr.onerror = () =>
          reject(new Error("Network error during file upload"));

        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "cvs");
        fd.append("resourceType", "auto");

        xhr.send(fd);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload CV");
    } finally {
      setUploadingCv(false);
      setUploadingCvProgress(0);
    }
  };

  const handleCancel = () => {
    setError("");
    const u = user as unknown as AppUser;
    setFormData({
      fullName: u.fullName || "",
      phoneNumber: u.phoneNumber || "",
      country: u.country || "",
      city: u.city || "",
      age: u.age || "",
      bio: u.bio || "",
      experience: u.experience || "",
      specialties: u.specialties || [],
      emailNotifications: u.emailNotifications ?? true,
      smsNotifications: u.smsNotifications ?? false,
      profileVisibility: u.profileVisibility ?? true,
    });
    setDobDay("");
    setDobMonth("");
    setDobYear("");
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-green-600" />
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            {isEditing && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors"
                  disabled={uploadingAvatar}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          {user.role !== "student" && (
            <div className="ml-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CV
              </label>
              {(user as unknown as AppUser).cvUrl ? (
                <>
                  <div className="flex items-center space-x-3">
                    <a
                      href={(user as unknown as AppUser).cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-green-600 underline"
                    >
                      View uploaded CV
                    </a>
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleCvChange}
                          className="hidden"
                          id="cv-input"
                        />
                        <label
                          htmlFor="cv-input"
                          className="text-sm px-3 py-1 bg-green-600 text-white rounded cursor-pointer"
                        >
                          {uploadingCv ? "Uploading..." : "Replace CV"}
                        </label>
                      </>
                    )}
                  </div>
                  {uploadingCv && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${uploadingCvProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Uploading CV... {uploadingCvProgress}%
                      </p>
                    </div>
                  )}
                </>
              ) : isEditing ? (
                <>
                  <input
                    type="file"
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleCvChange}
                    className="hidden"
                    id="cv-input2"
                  />
                  <label
                    htmlFor="cv-input2"
                    className="text-sm px-3 py-1 bg-green-600 text-white rounded cursor-pointer"
                  >
                    {uploadingCv ? "Uploading..." : "Upload CV"}
                  </label>
                </>
              ) : (
                <p className="text-sm text-gray-600">No CV uploaded</p>
              )}
            </div>
          )}
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-800">
              {user.fullName}
            </h2>
            <p className="text-gray-600 capitalize">{user.role}</p>
            <div className="flex items-center justify-center sm:justify-start space-x-4 mt-2 text-sm text-gray-500">
              <span>Member since {new Date(user.createdAt).getFullYear()}</span>
              {user.isApproved && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <div className="relative">
                <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            ) : (
              <p className="text-gray-800 py-3">{user.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            {isEditing ? (
              <div className="relative">
                <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            ) : (
              <p className="text-gray-800 py-3">
                {user.phoneNumber || "Not provided"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            {isEditing ? (
              <div className="grid grid-cols-3 gap-2 items-center">
                <div className="relative">
                  <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <select
                    value={dobDay}
                    onChange={(e) => setDobDay(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <select
                  value={dobMonth}
                  onChange={(e) => setDobMonth(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={dobYear}
                  onChange={(e) => setDobYear(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Year</option>
                  {Array.from(
                    { length: 100 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-gray-800 py-3">
                {user.age ? `${user.age} years old` : "Not provided"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            {isEditing ? (
              <div className="relative">
                <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">
                    {countriesLoading
                      ? "Loading countries..."
                      : "Select a country"}
                  </option>
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-gray-800 py-3">
                {user.country || "Not provided"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State/Region
            </label>
            {isEditing ? (
              statesLoading ? (
                <select
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                >
                  <option>Loading states...</option>
                </select>
              ) : states.length > 0 ? (
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select a state/region</option>
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your state/region"
                  />
                  {statesError && (
                    <p className="text-sm text-gray-500 mt-1">{statesError}</p>
                  )}
                </div>
              )
            ) : (
              <p className="text-gray-800 py-3">
                {user.city || "Not provided"}
              </p>
            )}
          </div>
        </div>

        {user.role === "ustaadh" && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Tell students about yourself, your experience, and teaching style..."
              />
            ) : (
              <p className="text-gray-800 py-3">
                {user.bio || "No bio provided"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Role-specific Information */}
      {user.role === "ustaadh" && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Teaching Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe your teaching experience"
                />
              ) : (
                <p className="text-gray-800 py-3">
                  {user.experience || "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <p className="text-gray-800 py-3">
                {user.rating
                  ? `${user.rating}/5 (${user.reviewCount} reviews)`
                  : "No ratings yet"}
              </p>
            </div>
          </div>

          {user.specialties && user.specialties.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties
              </label>
              <div className="flex flex-wrap gap-2">
                {user.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
          {isEditing && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties (choose 1–4)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SPECIALTIES_OPTIONS.map((opt) => {
                  const checked = formData.specialties.includes(opt);
                  return (
                    <label
                      key={opt}
                      className="inline-flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        name="specialties"
                        value={opt}
                        checked={checked}
                        onChange={() => {
                          // toggle with enforcement: allow up to 4 selections
                          const current: string[] = Array.isArray(
                            formData.specialties
                          )
                            ? formData.specialties
                            : [];
                          if (checked) {
                            // remove
                            const next = current.filter((s) => s !== opt);
                            setFormData({ ...formData, specialties: next });
                          } else {
                            if (current.length >= 4) {
                              setError("You can select up to 4 specialties");
                              return;
                            }
                            const next = [...current, opt];
                            setFormData({ ...formData, specialties: next });
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-green-600"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formData.specialties.length} selected (1-4)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Account Settings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Account Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Email Notifications</h4>
              <p className="text-sm text-gray-600">
                Receive notifications about lessons and messages
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.emailNotifications}
                onChange={() => handleToggleChange("emailNotifications")}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">SMS Notifications</h4>
              <p className="text-sm text-gray-600">
                Receive SMS reminders for upcoming lessons
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.smsNotifications}
                onChange={() => handleToggleChange("smsNotifications")}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Profile Visibility</h4>
              <p className="text-sm text-gray-600">
                Allow others to find your profile
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.profileVisibility}
                onChange={() => handleToggleChange("profileVisibility")}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

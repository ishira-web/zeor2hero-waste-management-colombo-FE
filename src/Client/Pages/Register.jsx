import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Home,
  Hash,
  MapPin,
  ImagePlus,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

const API_BASE ="http://localhost:3000";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    addressLine1: "",
    houseNumber: "",
    city: "Colombo",
    aTaxNumber: "",
    postalCode: "",
  });

  const [errors, setErrors] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProfilePicture(null);
      setPreview("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      e.target.value = "";
      return;
    }
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image must be ≤ 3 MB");
      e.target.value = "";
      return;
    }
    setProfilePicture(file);
    setPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const validate = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Enter a valid email";
    if (!formData.phoneNumber.trim()) e.phoneNumber = "Phone is required";
    else if (!/^(\+94|0)\d{9}$/.test(formData.phoneNumber))
      e.phoneNumber = "Enter a valid Sri Lankan phone (e.g., 0771234567)";
    if (!formData.password) e.password = "Password is required";
    else if (formData.password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (!formData.addressLine1.trim())
      e.addressLine1 = "Address line 1 is required";
    if (!formData.houseNumber.trim())
      e.houseNumber = "House number is required";
    if (!formData.aTaxNumber.trim()) e.aTaxNumber = "Tax number is required";
    if (!formData.postalCode.trim()) e.postalCode = "Postal code is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      addressLine1: "",
      houseNumber: "",
      city: "Colombo",
      aTaxNumber: "",
      postalCode: "",
    });
    setProfilePicture(null);
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (profilePicture) data.append("profilePicture", profilePicture);

      // Let axios set the multipart boundary automatically (no manual headers)
      const res = await axios.post(`${API_BASE}/api/user/create`, data);

      toast.success(res.data?.message || "User registered successfully!");
      resetForm();
    } catch (error) {
      const msg = error?.response?.data?.message || "Something went wrong.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b bg-slate-50 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Create a Dweller Account
            </h2>
            <p className="text-sm text-slate-500">
              Fill in your details to get started.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Full Name */}
          <div className="col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <div
              className={`mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 ${
                errors.fullName ? "border-red-400" : "border-slate-300"
              } focus-within:ring-2 focus-within:ring-blue-600`}
            >
              <UserIcon className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g., Rajesh Perera"
                className="w-full outline-none"
                required
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="col-span-1">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <div
              className={`mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 ${
                errors.email ? "border-red-400" : "border-slate-300"
              } focus-within:ring-2 focus-within:ring-blue-600`}
            >
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full outline-none"
                required
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="col-span-1">
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <div
              className={`mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 ${
                errors.phoneNumber ? "border-red-400" : "border-slate-300"
              } focus-within:ring-2 focus-within:ring-blue-600`}
            >
              <Phone className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="0771234567"
                className="w-full outline-none"
                required
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-xs text-red-600 mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Password */}
          <div className="col-span-1">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <div
              className={`mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 ${
                errors.password ? "border-red-400" : "border-slate-300"
              } focus-within:ring-2 focus-within:ring-blue-600`}
            >
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className="w-full outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Address Line 1 */}
          <div className="col-span-1">
            <label className="text-sm font-medium text-slate-700">Address Line 1</label>
            <div
              className={`mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 ${
                errors.addressLine1 ? "border-red-400" : "border-slate-300"
              } focus-within:ring-2 focus-within:ring-blue-600`}
            >
              <Home className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="Street / Lane"
                className="w-full outline-none"
                required
              />
            </div>
            {errors.addressLine1 && (
              <p className="text-xs text-red-600 mt-1">{errors.addressLine1}</p>
            )}
          </div>

          {/* House Number */}
          <div className="col-span-1">
            <label className="text-sm font-medium text-slate-700">House Number</label>
            <div
              className={`mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 ${
                errors.houseNumber ? "border-red-400" : "border-slate-300"
              } focus-within:ring-2 focus-within:ring-blue-600`}
            >
              <Hash className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="houseNumber"
                value={formData.houseNumber}
                onChange={handleChange}
                placeholder="e.g., 123/A"
                className="w-full outline-none"
                required
              />
            </div>
            {errors.houseNumber && (
              <p className="text-xs text-red-600 mt-1">{errors.houseNumber}</p>
            )}
          </div>

          {/* City */}
          <div className="col-span-1">
            <label className="text-sm font-medium text-slate-700">City</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-600">
              <MapPin className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* Tax Number */}
          <div className="col-span-1">
            <label className="text-sm font-medium text-slate-700">Tax Number</label>
            <div
              className={`mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 ${
                errors.aTaxNumber ? "border-red-400" : "border-slate-300"
              } focus-within:ring-2 focus-within:ring-blue-600`}
            >
              <Hash className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="aTaxNumber"
                value={formData.aTaxNumber}
                onChange={handleChange}
                placeholder="Your tax/assessment no."
                className="w-full outline-none"
                required
              />
            </div>
            {errors.aTaxNumber && (
              <p className="text-xs text-red-600 mt-1">{errors.aTaxNumber}</p>
            )}
          </div>

          {/* Postal Code */}
          <div className="col-span-1">
            <label className="text-sm font-medium text-slate-700">Postal Code</label>
            <div
              className={`mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 ${
                errors.postalCode ? "border-red-400" : "border-slate-300"
              } focus-within:ring-2 focus-within:ring-blue-600`}
            >
              <Hash className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="e.g., 00300"
                className="w-full outline-none"
                required
              />
            </div>
            {errors.postalCode && (
              <p className="text-xs text-red-600 mt-1">{errors.postalCode}</p>
            )}
          </div>

          {/* Profile Picture */}
          <div className="col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <ImagePlus className="h-4 w-4 text-slate-400" />
              Profile Picture (optional)
            </label>
            <div className="mt-1 flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                name="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="h-14 w-14 rounded-lg object-cover border"
                />
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">JPG/PNG/WebP, up to 3 MB.</p>
          </div>

          {/* Submit */}
          <div className="col-span-1 md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;

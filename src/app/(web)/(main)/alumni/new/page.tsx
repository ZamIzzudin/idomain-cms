"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, GraduationCap, Eye, EyeOff } from "lucide-react";
import Notification from "@/components/Notification";
import { useCreateAlumni } from "../hook";

interface FormData {
  name: string;
  email: string;
  contactNumber: string;
  password: string;
  graduationYear: string;
  degree: string;
  specialization: string;
  institution: string;
  photo: string;
  photoFile: File | null;
  removePhoto: boolean;
}

const emptyForm: FormData = {
  name: "",
  email: "",
  contactNumber: "",
  password: "",
  graduationYear: "",
  degree: "",
  specialization: "",
  institution: "",
  photo: "",
  photoFile: null,
  removePhoto: false,
};

export default function NewAlumniPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createAlumni, isPending } = useCreateAlumni();

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return Notification("error", "File size must be under 5MB");
    if (!file.type.startsWith("image/"))
      return Notification("error", "Only images are allowed");
    setForm((prev) => ({
      ...prev,
      photoFile: file,
      removePhoto: false,
      photo: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.graduationYear) {
      return Notification("error", "Name and graduation year are required");
    }

    createAlumni(
      {
        name: form.name,
        email: form.email || null,
        contactNumber: form.contactNumber || null,
        password: form.password || null,
        graduationYear: parseInt(form.graduationYear),
        degree: form.degree || null,
        specialization: form.specialization || null,
        institution: form.institution || null,
        photo: form.photoFile,
      },
      {
        onSuccess: () => {
          Notification("success", "Alumni added successfully");
          router.push("/alumni");
        },
        onError: (error: any) => {
          Notification("error", error.message || "Failed to add alumni");
        },
      },
    );
  };

  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/alumni")}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary-600" />
            Add Alumni
          </h1>
          <p className="text-slate-500 text-sm">Add a new alumni record</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Dr. John Doe"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="john@example.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nomor Kontak
            </label>
            <input
              type="text"
              value={form.contactNumber}
              onChange={(e) => updateField("contactNumber", e.target.value)}
              placeholder="+62 812-3456-7890"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="Min. 6 karakter (opsional)"
              className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Kosongkan jika tidak ingin membuat password untuk login alumni
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Graduation Year *
            </label>
            <input
              type="number"
              value={form.graduationYear}
              onChange={(e) => updateField("graduationYear", e.target.value)}
              placeholder="2020"
              min={1900}
              max={2100}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Degree
            </label>
            <input
              type="text"
              value={form.degree}
              onChange={(e) => updateField("degree", e.target.value)}
              placeholder="S1, Sp.PD, etc."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Specialization
          </label>
          <input
            type="text"
            value={form.specialization}
            onChange={(e) => updateField("specialization", e.target.value)}
            placeholder="Cardiology, Neurology, etc."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Institution
          </label>
          <input
            type="text"
            value={form.institution}
            onChange={(e) => updateField("institution", e.target.value)}
            placeholder="RSUD, hospital, clinic name"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Photo
          </label>
          {form.photo ? (
            <div className="relative inline-block">
              <img
                src={form.photo}
                alt="Preview"
                className="w-24 h-24 rounded-xl object-cover border border-slate-200"
              />
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    photo: "",
                    photoFile: null,
                    removePhoto: true,
                  }))
                }
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-slate-400" />
                <span className="text-xs text-slate-500">
                  Click to upload image
                </span>
                <span className="text-xs text-slate-400">
                  Max 5MB (JPG, PNG, WebP)
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => router.push("/alumni")}
          className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Add Alumni"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, GraduationCap, Eye, EyeOff } from "lucide-react";
import Notification from "@/components/Notification";
import { useCreateAlumni } from "../hook";

import degreeData from "@/data/degree.json";
import specializationData from "@/data/specialization.json";
import locationData from "@/data/location.json";

const degreePrefixes = degreeData.filter((d) => d.type === "prefix");
const degreeSuffixes = degreeData.filter((d) => d.type === "suffix");
const provinces = locationData.data.map((l: any) => l.provinsi);
const getProvinceCities = (prov: string) =>
  (locationData.data as any[]).find((l: any) => l.provinsi === prov)?.kota ||
  [];

interface FormData {
  name: string;
  email: string;
  contactNumber: string;
  password: string;
  graduationYear: string;
  batch: string;
  degreePrefix: string;
  degreePrefixCustom: string;
  degreeSuffix: string;
  degreeSuffixCustom: string;
  specialization: string;
  specializationCustom: string;
  province: string;
  provinceCustom: string;
  city: string;
  cityCustom: string;
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
  batch: "",
  degreePrefix: "",
  degreePrefixCustom: "",
  degreeSuffix: "",
  degreeSuffixCustom: "",
  specialization: "",
  specializationCustom: "",
  province: "",
  provinceCustom: "",
  city: "",
  cityCustom: "",
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

  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (form.province && form.province !== "Lainnya") {
      setCities(getProvinceCities(form.province));
    } else {
      setCities([]);
    }
  }, [form.province]);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return Notification(
        "error",
        "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.",
      );
    }
    if (file.size > 10 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return Notification(
        "error",
        `Ukuran file (${sizeMB} MB) melebihi batas maksimal 10 MB.`,
      );
    }
    setForm((prev) => ({
      ...prev,
      photoFile: file,
      removePhoto: false,
      photo: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.batch || !form.graduationYear) {
      return Notification("error", "Name and graduation year are required");
    }

    const finalDegreePrefix =
      form.degreePrefix === "Lainnya"
        ? form.degreePrefixCustom
        : form.degreePrefix;
    const finalDegreeSuffix =
      form.degreeSuffix === "Lainnya"
        ? form.degreeSuffixCustom
        : form.degreeSuffix;
    const finalSpecialization =
      form.specialization === "Lainnya"
        ? form.specializationCustom
        : form.specialization;
    const finalProvince =
      form.province === "Lainnya" ? form.provinceCustom : form.province;
    const finalCity = form.city === "Lainnya" ? form.cityCustom : form.city;

    createAlumni(
      {
        name: form.name,
        email: form.email || null,
        contactNumber: form.contactNumber || null,
        password: form.password || null,
        graduationYear: parseInt(form.graduationYear),
        batch: form.batch ? parseInt(form.batch) : null,
        degreePrefix: finalDegreePrefix || null,
        degreeSuffix: finalDegreeSuffix || null,
        specialization: finalSpecialization || null,
        province: finalProvince || null,
        city: finalCity || null,
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
            Gelar Depan
          </label>
          <div className="flex gap-2 items-end">
            <div className="w-48 shrink-0">
              <select
                value={form.degreePrefix}
                onChange={(e) => updateField("degreePrefix", e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- Pilih --</option>
                {degreePrefixes.map((d: any) => (
                  <option key={d.label} value={d.label}>
                    {d.label}
                  </option>
                ))}
                <option value="Lainnya">Lainnya</option>
              </select>
              {form.degreePrefix === "Lainnya" && (
                <input
                  type="text"
                  value={form.degreePrefixCustom}
                  onChange={(e) =>
                    updateField("degreePrefixCustom", e.target.value)
                  }
                  placeholder="Gelar depan"
                  className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Nama lengkap"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="w-48 shrink-0">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gelar Belakang
              </label>
              <select
                value={form.degreeSuffix}
                onChange={(e) => updateField("degreeSuffix", e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- Pilih --</option>
                {degreeSuffixes.map((d: any) => (
                  <option key={d.label} value={d.label}>
                    {d.label}
                  </option>
                ))}
                <option value="Lainnya">Lainnya</option>
              </select>
              {form.degreeSuffix === "Lainnya" && (
                <input
                  type="text"
                  value={form.degreeSuffixCustom}
                  onChange={(e) =>
                    updateField("degreeSuffixCustom", e.target.value)
                  }
                  placeholder="Gelar belakang"
                  className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              )}
            </div>
          </div>
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
              maxLength={14}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tahun Kelulusan *
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
              Tahun Masuk *
            </label>
            <input
              type="number"
              value={form.batch}
              onChange={(e) => updateField("batch", e.target.value)}
              placeholder="2017"
              min={1900}
              max={2100}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Spesialisasi
            </label>
            <select
              value={form.specialization}
              onChange={(e) => updateField("specialization", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- Pilih Spesialisasi --</option>
              {specializationData.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="Lainnya">Lainnya (input manual)</option>
            </select>
            {form.specialization === "Lainnya" && (
              <input
                type="text"
                value={form.specializationCustom}
                onChange={(e) =>
                  updateField("specializationCustom", e.target.value)
                }
                placeholder="Masukkan spesialisasi"
                className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Provinsi
            </label>
            <select
              value={form.province}
              onChange={(e) => {
                updateField("province", e.target.value);
                updateField("city", "");
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- Pilih Provinsi --</option>
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="Lainnya">Lainnya (input manual)</option>
            </select>
            {form.province === "Lainnya" && (
              <input
                type="text"
                value={form.provinceCustom}
                onChange={(e) => updateField("provinceCustom", e.target.value)}
                placeholder="Masukkan provinsi"
                className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Kota / Kabupaten
            </label>
            {form.province &&
            form.province !== "Lainnya" &&
            cities.length > 0 ? (
              <>
                <select
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Pilih Kota/Kab --</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Lainnya">Lainnya (input manual)</option>
                </select>
                {form.city === "Lainnya" && (
                  <input
                    type="text"
                    value={form.cityCustom}
                    onChange={(e) => updateField("cityCustom", e.target.value)}
                    placeholder="Masukkan kota/kabupaten"
                    className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                )}
              </>
            ) : (
              <input
                type="text"
                value={form.cityCustom}
                onChange={(e) => updateField("cityCustom", e.target.value)}
                placeholder="Masukkan kota/kabupaten"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            )}
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

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Foto
          </label>
          <p className="text-xs text-slate-400 mb-2">
            Format: JPG, PNG, WebP, GIF. Maks: 10 MB.
          </p>
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
                  Klik untuk upload foto
                </span>
                <span className="text-xs text-slate-400">
                  JPG, PNG, WebP, GIF (Maks 10 MB)
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

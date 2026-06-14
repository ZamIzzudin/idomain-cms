"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, Upload, X } from "lucide-react";
import Notification from "@/components/Notification";
import ListInput from "@/components/ListInput";
import { useCreateCareer, useCategoryList } from "../hook";
import locationData from "@/data/location.json";

const jobTypes = ["Penuh Waktu", "Paruh Waktu", "Kontrak", "Magang", "Lepas"];

const provinces = (locationData as any).data.map((l: any) => l.provinsi);
const getProvinceCities = (prov: string) =>
  (locationData as any).data.find((l: any) => l.provinsi === prov)?.kota || [];

export default function NewCareerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [position, setPosition] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [jobType, setJobType] = useState("Penuh Waktu");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [deadline, setDeadline] = useState("");
  const [recruitmentEmail, setRecruitmentEmail] = useState("");
  const [recruitmentUrl, setRecruitmentUrl] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");

  const { mutate: createCareer, isPending } = useCreateCareer();
  const { data: categories } = useCategoryList();

  useEffect(() => {
    if (province) {
      setCities(getProvinceCities(province));
      setCity("");
    } else {
      setCities([]);
    }
  }, [province]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return Notification("error", "Format file tidak didukung.");
    }
    if (file.size > 1 * 1024 * 1024) {
      return Notification("error", "Ukuran file melebihi batas maksimal 1 MB.");
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (!position) return Notification("error", "Posisi wajib diisi");
    if (!institutionName)
      return Notification("error", "Nama institusi wajib diisi");
    if (!categoryId) return Notification("error", "Kategori wajib diisi");

    const formData = new FormData();
    formData.append("title", position);
    formData.append("position", position);
    formData.append("institutionName", institutionName);
    if (province) formData.append("province", province);
    if (city) formData.append("city", city);
    formData.append("jobType", jobType);
    formData.append("categoryId", categoryId);
    if (description.length > 0) formData.append("description", description.filter(Boolean).join("\n"));
    if (requirements.length > 0) formData.append("requirements", requirements.filter(Boolean).join("\n"));
    if (deadline) formData.append("deadline", deadline);
    if (recruitmentEmail) formData.append("recruitmentEmail", recruitmentEmail);
    if (recruitmentUrl) formData.append("recruitmentUrl", recruitmentUrl);
    if (contactPerson) formData.append("contactPerson", contactPerson);
    if (contactPhone) formData.append("contactPhone", contactPhone);
    formData.append("status", status);
    if (logoFile) formData.append("logo", logoFile);

    createCareer(formData, {
      onSuccess: () => {
        Notification("success", "Lowongan berhasil dibuat");
        router.push("/careers");
      },
      onError: (error: any) => {
        Notification("error", error.message || "Failed to create career");
      },
    });
  };

  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/careers")}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary-600" />
            New Career
          </h1>
          <p className="text-slate-500 text-sm">Post a new job opportunity</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        {/* Position + Institution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Posisi *
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Dokter Umum"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama Institusi *
            </label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="RSUP Dr. Cipto"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Province + City + Job Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Provinsi
            </label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Pilih provinsi...</option>
              {provinces.map((p: string) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Kota/Kabupaten
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!province}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Pilih kota...</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Jenis Pekerjaan
            </label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {jobTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category + Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Kategori *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Pilih kategori...</option>
              <optgroup label="Klinis">
                {categories
                  ?.filter((c) => c.type === "KLINIS")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Non-Klinis">
                {categories
                  ?.filter((c) => c.type === "NON_KLINIS")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CLOSED">Closed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Logo Institusi
          </label>
          {logoPreview ? (
            <div className="relative inline-block">
              <img
                src={logoPreview}
                alt="Preview"
                className="w-24 h-24 rounded-xl object-cover border border-slate-200"
              />
              <button
                type="button"
                onClick={() => {
                  setLogoFile(null);
                  setLogoPreview("");
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-32 h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col items-center gap-1">
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-xs text-slate-500">Upload</span>
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

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Batas Waktu Lamaran
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Deskripsi Pekerjaan
          </label>
          <ListInput
            items={description}
            onChange={setDescription}
            placeholder="Deskripsi pekerjaan..."
            addLabel="Tambah Deskripsi"
            emptyLabel="Belum ada deskripsi. Klik tambah untuk menambahkan."
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Persyaratan
          </label>
          <ListInput
            items={requirements}
            onChange={setRequirements}
            placeholder="Persyaratan..."
            addLabel="Tambah Persyaratan"
            emptyLabel="Belum ada persyaratan. Klik tambah untuk menambahkan."
          />
        </div>

        {/* Recruitment info */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Informasi Rekrutmen
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Email Rekrutmen
              </label>
              <input
                type="email"
                value={recruitmentEmail}
                onChange={(e) => setRecruitmentEmail(e.target.value)}
                placeholder="hr@institusi.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Link Pendaftaran / Website
              </label>
              <input
                type="url"
                value={recruitmentUrl}
                onChange={(e) => setRecruitmentUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="Nama kontak (opsional)"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nomor Telepon Kontak
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={contactPhone}
              onChange={(e) =>
                setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 14))
              }
              placeholder="08xxxxxxxxxxx (opsional)"
              maxLength={14}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => router.push("/careers")}
          className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Create Career"}
        </button>
      </div>
    </div>
  );
}

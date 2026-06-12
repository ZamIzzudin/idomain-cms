"use client";

import { useState, useEffect, useRef } from "react";
import {
  Settings,
  Globe,
  Phone,
  Image,
  FileText,
  Share2,
  Save,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Upload,
} from "lucide-react";
import Notification from "@/components/Notification";
import AxiosClient from "@/lib/axios";
import { useSiteSettings, useUpdateSiteSettings } from "./hook";
import type { SiteSettingItem } from "./service";

interface SettingField {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "image";
  placeholder?: string;
}

interface SettingGroup {
  category: string;
  title: string;
  icon: any;
  fields: SettingField[];
}

const settingGroups: SettingGroup[] = [
  {
    category: "general",
    title: "Umum",
    icon: Globe,
    fields: [
      {
        key: "site_name",
        label: "Nama Website",
        type: "text",
        placeholder: "IDOMAIN",
      },
      {
        key: "site_description",
        label: "Deskripsi Website",
        type: "textarea",
        placeholder: "Deskripsi singkat tentang website...",
      },
      {
        key: "site_logo",
        label: "Logo",
        type: "image",
        placeholder: "Upload logo website...",
      },
      {
        key: "site_favicon",
        label: "Favicon",
        type: "image",
        placeholder: "Upload favicon...",
      },
    ],
  },
  {
    category: "home_about",
    title: "Tentang Kami (Beranda)",
    icon: FileText,
    fields: [
      {
        key: "home_about_title",
        label: "Judul",
        type: "text",
        placeholder: "Tentang IDOMAIN",
      },
      {
        key: "home_about_description",
        label: "Deskripsi",
        type: "textarea",
        placeholder: "Deskripsi singkat untuk section tentang di beranda...",
      },
      {
        key: "home_about_image",
        label: "Gambar",
        type: "image",
        placeholder: "Upload gambar untuk beranda...",
      },
    ],
  },
  {
    category: "about",
    title: "Tentang Kami (Halaman About)",
    icon: FileText,
    fields: [
      {
        key: "about_title",
        label: "Judul",
        type: "text",
        placeholder: "Tentang IDOMAIN",
      },
      {
        key: "about_description",
        label: "Deskripsi",
        type: "textarea",
        placeholder: "Deskripsi tentang organisasi...",
      },
      {
        key: "about_visi",
        label: "Visi",
        type: "textarea",
        placeholder: "Visi organisasi...",
      },
      {
        key: "about_image",
        label: "Gambar",
        type: "image",
        placeholder: "Upload gambar about...",
      },
    ],
  },
  {
    category: "contact",
    title: "Kontak",
    icon: Phone,
    fields: [
      {
        key: "contact_email",
        label: "Email",
        type: "text",
        placeholder: "info@idomain.org",
      },
      {
        key: "contact_phone",
        label: "Telepon",
        type: "text",
        placeholder: "+62 811-9843-210",
      },
      {
        key: "contact_address",
        label: "Alamat",
        type: "textarea",
        placeholder: "Jakarta, Indonesia",
      },
    ],
  },
  {
    category: "social",
    title: "Media Sosial",
    icon: Share2,
    fields: [
      {
        key: "social_facebook",
        label: "Facebook URL",
        type: "url",
        placeholder: "https://facebook.com/...",
      },
      {
        key: "social_instagram",
        label: "Instagram URL",
        type: "url",
        placeholder: "https://instagram.com/...",
      },
      {
        key: "social_youtube",
        label: "YouTube URL",
        type: "url",
        placeholder: "https://youtube.com/...",
      },
      {
        key: "social_linkedin",
        label: "LinkedIn URL",
        type: "url",
        placeholder: "https://linkedin.com/...",
      },
      {
        key: "social_twitter",
        label: "Twitter/X URL",
        type: "url",
        placeholder: "https://twitter.com/...",
      },
    ],
  },
];

function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const { data } = await AxiosClient.post("/upload/image", {
          image: base64,
        });
        resolve(data.data.url);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageUpload({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/x-icon", "image/vnd.microsoft.icon"];
    if (!allowedTypes.includes(file.type)) {
      Notification("error", "Format file tidak didukung. Gunakan JPG, PNG, WebP, GIF, atau ICO.");
      return;
    }
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    if (file.size > 1 * 1024 * 1024) {
      Notification("error", `Ukuran file (${sizeMB} MB) melebihi batas maksimal 1 MB.`);
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch {
      Notification("error", "Gagal upload gambar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Preview"
            className="w-16 h-16 rounded-lg object-cover border border-slate-200"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition-colors"
        >
          <Upload className="w-4 h-4 text-slate-300" />
        </div>
      )}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : value ? "Ganti" : "Pilih File"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/x-icon,image/svg+xml"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}

function BannerManager({
  banners,
  onChange,
  label = "banner",
}: {
  banners: string[];
  onChange: (banners: string[]) => void;
  label?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newBanners = [...banners];
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      for (const file of Array.from(files)) {
        if (!allowedTypes.includes(file.type)) {
          Notification("error", `${file.name}: format tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.`);
          continue;
        }
        if (file.size > 1 * 1024 * 1024) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
          Notification("error", `${file.name} (${sizeMB} MB) melebihi batas maksimal 1 MB.`);
          continue;
        }
        const url = await uploadImage(file);
        newBanners.push(url);
      }
      onChange(newBanners);
    } catch {
      Notification("error", "Gagal upload gambar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const updated = banners.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...banners];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === banners.length - 1) return;
    const updated = [...banners];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {banners.length} {label} terupload
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs font-medium disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          {uploading
            ? "Mengupload..."
            : `Tambah ${label.charAt(0).toUpperCase() + label.slice(1)}`}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleAdd}
          className="hidden"
        />
      </div>

      {banners.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
          <Image className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">
            Belum ada {label}. Klik &ldquo;Tambah{" "}
            {label.charAt(0).toUpperCase() + label.slice(1)}&rdquo; untuk
            upload.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {banners.map((url, index) => (
            <div
              key={index}
              className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
            >
              <img
                src={url}
                alt={`Banner ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
              <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                {index + 1}
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="w-6 h-6 bg-white/90 rounded flex items-center justify-center hover:bg-white disabled:opacity-30"
                  title="Geser ke atas"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-slate-700" />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === banners.length - 1}
                  className="w-6 h-6 bg-white/90 rounded flex items-center justify-center hover:bg-white disabled:opacity-30"
                  title="Geser ke bawah"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-slate-700" />
                </button>
                <button
                  onClick={() => handleRemove(index)}
                  className="w-6 h-6 bg-red-500 rounded flex items-center justify-center hover:bg-red-600"
                  title="Hapus"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface MisiItem {
  title: string;
  subtitle: string;
}

function MisiManager({
  items,
  onChange,
}: {
  items: MisiItem[];
  onChange: (items: MisiItem[]) => void;
}) {
  const handleAdd = () => {
    onChange([...items, { title: "", subtitle: "" }]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: "title" | "subtitle", value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...items];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const updated = [...items];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {items.length} misi
        </p>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Misi
        </button>
      </div>

      {items.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">
            Belum ada misi. Klik &ldquo;Tambah Misi&rdquo; untuk menambahkan.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-2 bg-slate-50 rounded-lg p-3 border border-slate-100 group"
            >
              <div className="flex flex-col gap-0.5 shrink-0 pt-1">
                <span className="text-xs font-medium text-slate-400 text-center w-5">
                  {index + 1}
                </span>
                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="w-5 h-4 bg-white rounded flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 border border-slate-200"
                    title="Geser ke atas"
                  >
                    <ChevronUp className="w-3 h-3 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === items.length - 1}
                    className="w-5 h-4 bg-white rounded flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 border border-slate-200"
                    title="Geser ke bawah"
                  >
                    <ChevronDown className="w-3 h-3 text-slate-600" />
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleUpdate(index, "title", e.target.value)}
                  placeholder="Judul misi (contoh: Memperkuat Jejaring)"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={item.subtitle}
                  onChange={(e) => handleUpdate(index, "subtitle", e.target.value)}
                  placeholder="Deskripsi singkat misi..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={() => handleRemove(index)}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors mt-1"
                title="Hapus"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { data: settings, isLoading } = useSiteSettings();
  const { mutate: saveSettings, isPending } = useUpdateSiteSettings();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["general", "home_about", "about"]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [banners, setBanners] = useState<string[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [misiItems, setMisiItems] = useState<MisiItem[]>([]);
  const [heroExpanded, setHeroExpanded] = useState(true);
  const [galleryExpanded, setGalleryExpanded] = useState(true);

  useEffect(() => {
    if (!settings) return;
    const map: Record<string, string> = {};
    settings.forEach((s: SiteSettingItem) => {
      map[s.key] = s.value || "";
    });
    setFormData(map);

    const heroBanners = settings.find(
      (s: SiteSettingItem) => s.key === "hero_banners",
    );
    if (heroBanners?.value) {
      try {
        const parsed = JSON.parse(heroBanners.value);
        if (Array.isArray(parsed)) {
          setBanners(parsed);
        }
      } catch {
        setBanners([]);
      }
    }

    const aboutGallery = settings.find(
      (s: SiteSettingItem) => s.key === "about_gallery",
    );
    if (aboutGallery?.value) {
      try {
        const parsed = JSON.parse(aboutGallery.value);
        if (Array.isArray(parsed)) {
          setGallery(parsed);
        }
      } catch {
        setGallery([]);
      }
    }

    const aboutMisi = settings.find(
      (s: SiteSettingItem) => s.key === "about_misi",
    );
    if (aboutMisi?.value) {
      try {
        const parsed = JSON.parse(aboutMisi.value);
        if (Array.isArray(parsed)) {
          setMisiItems(parsed);
        }
      } catch {
        // Legacy format: plain text with newlines, parse with " — " separator
        const lines = aboutMisi.value.split("\n").filter(Boolean);
        const parsed = lines.map((line: string) => {
          const parts = line.split(" — ");
          return {
            title: parts[0]?.trim() || "",
            subtitle: parts[1]?.trim() || line.trim(),
          };
        });
        setMisiItems(parsed);
      }
    }
  }, [settings]);

  const toggleGroup = (category: string) => {
    setExpandedGroups((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const payload: { key: string; value: string | null; category: string }[] =
      settingGroups.flatMap((group) =>
        group.fields.map((field) => ({
          key: field.key,
          value: formData[field.key] ?? null,
          category: group.category,
        })),
      );

    payload.push({
      key: "hero_banners",
      value: banners.length > 0 ? JSON.stringify(banners) : null,
      category: "hero",
    });

    payload.push({
      key: "about_gallery",
      value: gallery.length > 0 ? JSON.stringify(gallery) : null,
      category: "about",
    });

    payload.push({
      key: "about_misi",
      value: misiItems.length > 0 ? JSON.stringify(misiItems) : null,
      category: "about",
    });

    saveSettings(payload, {
      onSuccess: () => {
        Notification("success", "Settings saved successfully");
      },
      onError: (error: any) => {
        Notification("error", error.message || "Failed to save settings");
      },
    });
  };

  return (
    <div className="flex flex-col gap-5 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary-600" />
            Pengaturan Website
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola konten dan pengaturan website compro
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isPending ? "Menyimpan..." : "Simpan Semua"}
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {settingGroups.map((group, idx) => {
            const Icon = group.icon;
            const isExpanded = expandedGroups.includes(group.category);

            return (
              <div key={group.category} className="space-y-3">
              <div
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.category)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-600/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="font-semibold text-slate-800 text-sm">
                      {group.title}
                    </span>
                    <span className="text-xs text-slate-400">
                      {group.fields.length} field
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Group Fields */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4">
                    {group.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {field.label}
                        </label>
                        {field.type === "image" ? (
                          <ImageUpload
                            value={formData[field.key] || ""}
                            onChange={(url) => updateField(field.key, url)}
                            placeholder={field.placeholder}
                          />
                        ) : field.type === "textarea" ? (
                          <textarea
                            value={formData[field.key] || ""}
                            onChange={(e) =>
                              updateField(field.key, e.target.value)
                            }
                            placeholder={field.placeholder}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={formData[field.key] || ""}
                            onChange={(e) =>
                              updateField(field.key, e.target.value)
                            }
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        )}
                      </div>
                    ))}

                    {group.category === "about" && (
                      <div className="pt-2 border-t border-slate-100">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Misi
                        </label>
                        <MisiManager items={misiItems} onChange={setMisiItems} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {group.category === "general" && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setHeroExpanded(!heroExpanded)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-600/10 rounded-lg flex items-center justify-center">
                        <Image className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="font-semibold text-slate-800 text-sm">
                        Hero / Banner
                      </span>
                      <span className="text-xs text-slate-400">Slideshow Banner</span>
                    </div>
                    {heroExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {heroExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                      <BannerManager
                        banners={banners}
                        onChange={setBanners}
                        label="banner"
                      />
                    </div>
                  )}
                </div>
              )}

              {group.category === "about" && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setGalleryExpanded(!galleryExpanded)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-600/10 rounded-lg flex items-center justify-center">
                        <Image className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="font-semibold text-slate-800 text-sm">
                        Galeri
                      </span>
                      <span className="text-xs text-slate-400">
                        Galeri di halaman About
                      </span>
                    </div>
                    {galleryExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {galleryExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                      <BannerManager
                        banners={gallery}
                        onChange={setGallery}
                        label="galeri"
                      />
                    </div>
                  )}
                </div>
              )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

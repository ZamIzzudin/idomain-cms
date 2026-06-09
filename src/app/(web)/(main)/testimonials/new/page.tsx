"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Quote, Upload, X } from "lucide-react";
import Notification from "@/components/Notification";
import { useCreateTestimonial } from "../hook";

export default function NewTestimonialPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createTestimonial, isPending } = useCreateTestimonial();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return Notification("error", "File size must be under 5MB");
    if (!file.type.startsWith("image/"))
      return Notification("error", "Only images are allowed");
    setPhotoFile(file);
    setPhoto(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (!name || !testimonial)
      return Notification("error", "Name and testimonial are required");
    createTestimonial(
      {
        name,
        institution: institution || undefined,
        testimonial,
        photo: photoFile,
      },
      {
        onSuccess: () => {
          Notification("success", "Testimonial created successfully");
          router.push("/testimonials");
        },
        onError: (error: any) =>
          Notification(
            "error",
            error.message || "Failed to create testimonial",
          ),
      },
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/testimonials")}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Quote className="w-3 h-3 text-primary-600" /> Add Testimonial
          </h1>
          <p className="text-slate-500 text-sm">Add a new alumni testimonial</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="grid grid-cols-[auto_1fr] gap-5">
          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 text-center">
              Photo
            </label>
            {photo ? (
              <div className="relative">
                <img
                  src={photo}
                  alt="Preview"
                  className="w-28 h-28 rounded-xl object-cover border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto("");
                    setPhotoFile(null);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition-colors">
                <Upload className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] text-slate-400 mt-1">Upload</span>
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

          {/* Name & Institution */}
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. John Doe"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Institution
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="RSUD, hospital, clinic name"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Testimonial *
          </label>
          <textarea
            value={testimonial}
            onChange={(e) => setTestimonial(e.target.value)}
            placeholder="Write the alumni testimonial here..."
            rows={5}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button
          onClick={() => router.push("/testimonials")}
          className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Add Testimonial"}
        </button>
      </div>
    </div>
  );
}

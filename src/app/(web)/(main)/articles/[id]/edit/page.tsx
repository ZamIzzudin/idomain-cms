"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, FileText, Upload, X } from "lucide-react";
import Notification from "@/components/Notification";
import QuillEditor from "@/components/QuillEditor";
import { useArticleDetail, useUpdateArticle } from "../../hook";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const { data: article, isLoading } = useArticleDetail(id);
  const { mutate: updateArticle, isPending } = useUpdateArticle();

  useEffect(() => {
    if (!article) return;
    setTitle(article.title || "");
    setContent(article.content || "");
    setExcerpt(article.excerpt || "");
    setAuthor(article.author || "");
    setTags(article.tags?.join(", ") || "");
    setStatus(article.status || "DRAFT");
    setMetaTitle(article.metaTitle || "");
    setMetaDescription(article.metaDescription || "");
    setMetaKeywords(article.metaKeywords?.join(", ") || "");
    setFeaturedImage(article.featuredImage || "");
  }, [article]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return Notification("error", "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.");
    }
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    if (file.size > 10 * 1024 * 1024) {
      return Notification("error", `Ukuran file (${sizeMB} MB) melebihi batas maksimal 10 MB.`);
    }
    setFeaturedImageFile(file);
    setRemoveImage(false);
    setFeaturedImage(URL.createObjectURL(file));
  };

  const parseTags = (str: string) =>
    str
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const handleSubmit = () => {
    if (!title) return Notification("error", "Title is required");

    updateArticle(
      {
        id,
        title,
        content,
        excerpt: excerpt || undefined,
        author: author || undefined,
        tags: tags ? parseTags(tags) : undefined,
        status,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        metaKeywords: metaKeywords ? parseTags(metaKeywords) : undefined,
        featuredImage: featuredImageFile,
        removeImage,
      },
      {
        onSuccess: () => {
          Notification("success", "Article updated successfully");
          router.push("/articles");
        },
        onError: (error: any) => {
          Notification("error", error.message || "Failed to update article");
        },
      },
    );
  };

  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/articles")}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-600" />
            Edit Article
          </h1>
          <p className="text-slate-500 text-sm">Update article content</p>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="h-10 bg-slate-100 rounded-lg" />
          <div className="h-32 bg-slate-100 rounded-lg" />
          <div className="h-10 bg-slate-100 rounded-lg" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article title"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Featured Image
              </label>
              {featuredImage ? (
                <div className="relative">
                  <img
                    src={featuredImage}
                    alt="Preview"
                    className="w-full h-40 rounded-xl object-cover border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImage("");
                      setFeaturedImageFile(null);
                      setRemoveImage(true);
                    }}
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
                      Klik untuk upload gambar
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short description..."
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Content
              </label>
              <QuillEditor
                content={content}
                onChange={setContent}
                placeholder="Write article content..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
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
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tags{" "}
                <span className="text-xs text-slate-400">
                  (comma-separated)
                </span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {/* SEO Section */}
            {/* <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-700 mb-3">
                SEO Settings
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="SEO title"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="SEO description..."
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Meta Keywords{" "}
                    <span className="text-xs text-slate-400">
                      (comma-separated)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="keyword1, keyword2"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div> */}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => router.push("/articles")}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || isLoading}
              className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

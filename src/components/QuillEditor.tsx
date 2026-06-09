/** @format */
"use client";

import React, { useMemo, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import AxiosClient from "@/lib/axios";
import Notification from "@/components/Notification";
import "quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-slate-50 rounded-lg flex items-center justify-center">
      <p className="text-slate-400 text-sm">Loading editor...</p>
    </div>
  ),
});

interface QuillEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function QuillEditor({ content, onChange, placeholder }: QuillEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const uploadBase64Image = async (base64: string): Promise<string | null> => {
    try {
      const { data } = await AxiosClient.post("/upload/image", { image: base64 });
      return data.data.url;
    } catch (error: any) {
      console.error("Image upload error:", error);
      Notification("error", "Failed to upload image");
      return null;
    }
  };

  const imageHandler = useCallback(function (this: any) {
    const quill = this.quill;
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        Notification("error", "Image size must be under 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const range = quill.getSelection(true);
        const index = range ? range.index : 0;

        const cdnUrl = await uploadBase64Image(base64);
        if (cdnUrl) {
          quill.insertEmbed(index, "image", cdnUrl);
          quill.setSelection(index + 1);
        }
      };
      reader.readAsDataURL(file);
    };
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      const base64Regex = /src="(data:image\/[^;]+;base64,[^"]+)"/g;
      let match;
      const promises: Promise<void>[] = [];
      let val = value;

      while ((match = base64Regex.exec(value)) !== null) {
        const base64 = match[1];
        const promise = uploadBase64Image(base64).then((cdnUrl) => {
          if (cdnUrl) {
            val = val.replace(base64, cdnUrl);
          }
        });
        promises.push(promise);
      }

      if (promises.length > 0) {
        Promise.all(promises).then(() => {
          onChange(val);
        });
      } else {
        onChange(value);
      }
    },
    [onChange]
  );

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ color: [] }, { background: [] }],
          ["link", "image", "code-block"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: true,
      },
    }),
    [imageHandler]
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
    "code-block",
    "color",
    "background",
  ];

  if (!mounted) {
    return (
      <div className="h-[300px] bg-slate-50 rounded-lg flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="quill-editor-wrapper">
      <ReactQuill
        theme="snow"
        value={content}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Start writing content..."}
      />
    </div>
  );
}

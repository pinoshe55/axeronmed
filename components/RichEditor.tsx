"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import "react-quill/dist/quill.snow.css";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
}

async function uploadToServer(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await fetch("/api/upload-image", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Yükleme hatası"); return null; }
    return data.url as string;
  } catch {
    alert("Resim yüklenemedi");
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getQuillFromWrapper(wrapper: HTMLElement | null): any | null {
  if (!wrapper) return null;
  const container = wrapper.querySelector(".ql-container");
  if (!container) return null;
  // Quill stores itself on the container element
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (container as any).__quill ?? null;
}

export default function RichEditor({ value, onChange, placeholder, height = 220, className = "" }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ReactQuill, setReactQuill] = useState<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("react-quill").then((mod) => setReactQuill(() => mod.default));
  }, []);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml");
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await uploadToServer(file);
      if (!url) return;

      const quill = getQuillFromWrapper(wrapperRef.current);
      if (quill) {
        const range = quill.getSelection(true) ?? { index: quill.getLength(), length: 0 };
        quill.insertEmbed(range.index, "image", url);
        quill.setSelection(range.index + 1, 0);
      }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: { image: imageHandler },
    },
  }), [imageHandler]);

  return (
    <div ref={wrapperRef} className={`rich-editor-wrap border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-400 transition-colors bg-white ${className}`}>
      {ReactQuill ? (
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          style={{ height }}
        />
      ) : (
        <div style={{ height: height + 42 }} className="bg-gray-50" />
      )}
    </div>
  );
}

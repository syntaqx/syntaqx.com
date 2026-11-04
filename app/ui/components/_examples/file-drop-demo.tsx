"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { FileDrop, FileDropArea } from "@/registry/syntaqx/ui/file-drop";

export default function FileDropDemo() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <FileDrop accept="image/*" onFiles={([f]) => setFile(f)} className="w-full max-w-md">
      <FileDropArea>
        <Upload />
        <span className="text-foreground">Drop an image or click to choose one</span>
        <span className="text-xs">
          {file ? `${file.name}, ${file.size.toLocaleString()} bytes` : "PNG, JPG, SVG, WebP"}
        </span>
      </FileDropArea>
    </FileDrop>
  );
}

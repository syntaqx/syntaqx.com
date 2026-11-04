"use client";

import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Field, FieldLabel } from "@/registry/syntaqx/ui/field";
import { FileDrop, FileDropTrigger } from "@/registry/syntaqx/ui/file-drop";
import { InputGroup, InputGroupAddon, InputGroupTextarea } from "@/registry/syntaqx/ui/input-group";

export default function FileDropPanel() {
  const [text, setText] = useState("");
  const [name, setName] = useState<string | null>(null);

  return (
    <FileDrop
      accept=".txt,.md,text/plain"
      onFiles={async ([file]) => {
        setName(file.name);
        setText(await file.text());
      }}
      className="w-full max-w-md"
    >
      <Field>
        <InputGroup className="group-data-dragging/file-drop:border-dashed group-data-dragging/file-drop:border-primary">
          <InputGroupAddon align="block-start" className="justify-between border-b">
            <FieldLabel className="gap-1.5">
              Notes
              {name && (
                <span className="inline-flex items-center gap-1 font-normal text-primary">
                  <FileText className="size-3.5" />
                  {name}
                </span>
              )}
            </FieldLabel>
            <FileDropTrigger size="xs">
              <Upload />
              File
            </FileDropTrigger>
          </InputGroupAddon>
          <InputGroupTextarea
            value={text}
            onChange={(e) => {
              setName(null);
              setText(e.target.value);
            }}
            placeholder="Type, or drop a text file anywhere on this box"
            rows={5}
          />
        </InputGroup>
      </Field>
    </FileDrop>
  );
}

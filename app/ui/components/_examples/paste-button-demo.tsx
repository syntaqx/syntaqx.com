"use client";

import { useState } from "react";
import { Field, FieldLabel } from "@/registry/syntaqx/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/registry/syntaqx/ui/input-group";
import { PasteButton } from "@/registry/syntaqx/ui/paste-button";

export default function PasteButtonDemo() {
  const [token, setToken] = useState("");

  return (
    <Field className="max-w-md">
      <FieldLabel>Access token</FieldLabel>
      <InputGroup>
        <InputGroupInput
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste it from your password manager"
          spellCheck={false}
          className="font-mono"
        />
        <InputGroupAddon align="inline-end">
          <PasteButton onPaste={(text) => setToken(text.trim())} size="icon-xs" />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}

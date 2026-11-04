"use client";

import { useState } from "react";
import { Button } from "@/registry/syntaqx/ui/button";

export default function ButtonLoading() {
  const [saving, setSaving] = useState(false);

  return (
    <Button
      loading={saving}
      onClick={() => {
        setSaving(true);
        setTimeout(() => setSaving(false), 1500);
      }}
    >
      Save changes
    </Button>
  );
}

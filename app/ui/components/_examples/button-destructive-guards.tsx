"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/registry/syntaqx/ui/button";
import { Field, FieldLabel } from "@/registry/syntaqx/ui/field";
import { Input } from "@/registry/syntaqx/ui/input";

// One click, then a second to confirm. It disarms itself after 4s.
function SoftConfirm() {
  const [armed, setArmed] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (done) {
    return (
      <Button variant="outline" size="sm" onClick={() => setDone(false)}>
        Reset
      </Button>
    );
  }

  if (armed) {
    return (
      <div className="inline-flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (timer.current) clearTimeout(timer.current);
            setArmed(false);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setArmed(false);
            setDone(true);
          }}
        >
          <Trash2 data-icon="inline-start" /> Really delete
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        setArmed(true);
        timer.current = setTimeout(() => setArmed(false), 4000);
      }}
      className="hover:border-destructive/40 hover:text-destructive"
    >
      <Trash2 data-icon="inline-start" /> Delete
    </Button>
  );
}

// The reader proves they know what they're naming.
function TypeToConfirm({ target }: { target: string }) {
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setDone(false);
          setInput("");
        }}
      >
        Reset
      </Button>
    );
  }

  return (
    <Field className="w-auto">
      <FieldLabel>
        Type <code className="font-mono">{target}</code> to confirm
      </FieldLabel>
      <div className="flex items-center gap-2">
        <Input
          size="sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={target}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="w-44 font-mono"
        />
        <Button
          variant="destructive"
          size="sm"
          disabled={input !== target}
          onClick={() => setDone(true)}
        >
          <Trash2 data-icon="inline-start" /> Delete
        </Button>
      </div>
    </Field>
  );
}

function Guard({ level, desc, children }: { level: string; desc: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="mb-1 text-sm font-medium">{level}</p>
        <p className="text-sm/relaxed text-muted-foreground">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function ButtonDestructiveGuards() {
  return (
    <div className="w-full max-w-2xl divide-y">
      <Guard level="No guard" desc="Reversible, low blast radius: dismiss a notification.">
        <Button variant="outline" size="sm">
          <X /> Dismiss
        </Button>
      </Guard>
      <Guard level="Soft confirm" desc="Reversible within a window: delete a draft.">
        <SoftConfirm />
      </Guard>
      <Guard
        level="Type to confirm"
        desc="Irreversible, high blast radius: drop a database, delete an org."
      >
        <TypeToConfirm target="production-db" />
      </Guard>
    </div>
  );
}

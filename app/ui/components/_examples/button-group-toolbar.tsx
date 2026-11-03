"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Bold, Code, Italic, Link2, Underline } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/syntaqx/ui/button";
import { ButtonGroup } from "@/registry/syntaqx/ui/button-group";
import { Field, FieldLabel } from "@/registry/syntaqx/ui/field";
import { Input } from "@/registry/syntaqx/ui/input";
import { Textarea } from "@/registry/syntaqx/ui/textarea";

const TOOLS = [
  { label: "Bold", icon: Bold },
  { label: "Italic", icon: Italic },
  { label: "Underline", icon: Underline },
  { label: "Link", icon: Link2 },
  { label: "Code", icon: Code },
];

export default function ButtonGroupToolbar() {
  // Only the current button is in the tab order (tabIndex 0); the rest are
  // -1. Tab leaves the toolbar, and coming back lands where you left off.
  const [active, setActive] = useState(0);
  const [pressed, setPressed] = useState<string[]>([]);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (to: number) => {
    const i = (to + TOOLS.length) % TOOLS.length;
    setActive(i);
    refs.current[i]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => move(active + 1),
      ArrowLeft: () => move(active - 1),
      Home: () => move(0),
      End: () => move(TOOLS.length - 1),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <Field>
        <FieldLabel>Title</FieldLabel>
        <Input />
      </Field>
      <ButtonGroup role="toolbar" aria-label="Formatting" onKeyDown={onKeyDown}>
        {TOOLS.map(({ label, icon: Icon }, i) => {
          const on = pressed.includes(label);
          return (
            <Button
              key={label}
              ref={(el) => {
                refs.current[i] = el;
              }}
              variant="outline"
              size="icon"
              tabIndex={i === active ? 0 : -1}
              aria-label={label}
              aria-pressed={on}
              onFocus={() => setActive(i)}
              onClick={() => setPressed((p) => (on ? p.filter((x) => x !== label) : [...p, label]))}
              className={cn(
                on
                  ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                  : "text-muted-foreground",
              )}
            >
              <Icon />
            </Button>
          );
        })}
      </ButtonGroup>
      <Field>
        <FieldLabel>Body</FieldLabel>
        <Textarea rows={2} />
      </Field>
    </div>
  );
}

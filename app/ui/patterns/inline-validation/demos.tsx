"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { Check, Circle, RotateCcw } from "lucide-react";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const btn =
  "inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim transition-colors hover:text-foreground hover:border-border-hover cursor-pointer";
const primary =
  "inline-flex items-center gap-1.5 rounded border border-accent/40 bg-accent/10 px-2.5 py-1.5 text-xs text-accent transition-colors hover:bg-accent/20 cursor-pointer";

const inputClass = (state: "idle" | "error" | "ok") =>
  `w-full rounded border bg-transparent px-2.5 py-1.5 text-xs text-foreground outline-none transition-colors focus:border-accent/60 ${
    state === "error"
      ? "border-red-500/50"
      : state === "ok"
        ? "border-accent/40"
        : "border-border"
  }`;

function Frame({ children, note }: { children: ReactNode; note: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      {children}
      <div className="border-t border-border px-4 py-2.5 text-[10px] text-dim">
        {note}
      </div>
    </div>
  );
}

function Message({ id, error, ok }: { id: string; error?: string; ok?: string }) {
  return (
    <p id={id} className="mt-1.5 min-h-4 text-[11px]" aria-live="polite">
      {error ? (
        <span className="text-red-400">{error}</span>
      ) : ok ? (
        <span className="inline-flex items-center gap-1 text-accent">
          <Check size={11} /> {ok}
        </span>
      ) : null}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Reward early, punish late
// ---------------------------------------------------------------------------
// The same email field twice. The left one validates on every keystroke, so
// it calls you wrong before you've finished typing. The right one waits for
// blur before showing an error, but confirms success the moment the value is
// valid, and once a field is in error it re-checks on every keystroke so the
// error clears as soon as it's fixed.

function EagerField() {
  const id = useId();
  const [value, setValue] = useState("");
  const error = value && !EMAIL.test(value) ? "Enter a valid email address" : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[10px] font-medium text-dim">
        Every keystroke
      </label>
      <input
        id={id}
        type="email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-msg`}
        placeholder="you@example.com"
        className={inputClass(error ? "error" : "idle")}
      />
      <Message id={`${id}-msg`} error={error} />
    </div>
  );
}

function RewardingField() {
  const id = useId();
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const valid = EMAIL.test(value);
  const error = touched && value && !valid ? "Enter a valid email address" : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[10px] font-medium text-dim">
        Reward early, punish late
      </label>
      <input
        id={id}
        type="email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-msg`}
        placeholder="you@example.com"
        className={inputClass(error ? "error" : valid ? "ok" : "idle")}
      />
      <Message id={`${id}-msg`} error={error} ok={valid ? "Looks good" : undefined} />
    </div>
  );
}

function TimingDemo() {
  return (
    <Frame
      note={
        <>
          Type an address slowly into each. The left field flags
          &ldquo;y&rdquo; as an error; the right one waits until you leave the
          field, then clears its error the moment you fix it.
        </>
      }
    >
      <div className="grid gap-5 p-4 sm:grid-cols-2">
        <EagerField />
        <RewardingField />
      </div>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Error summary on submit
// ---------------------------------------------------------------------------
// On a failed submit, inline errors alone aren't enough: on a long form
// they're off screen, and a screen reader hears nothing. A summary at the
// top takes focus, says how many problems there are, and links each one to
// its field.

type Fields = { name: string; email: string; seats: string };
const EMPTY: Fields = { name: "", email: "", seats: "" };

function validate(f: Fields): Partial<Record<keyof Fields, string>> {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (!f.name.trim()) errors.name = "Enter your name";
  if (!EMAIL.test(f.email)) errors.email = "Enter an email address like you@example.com";
  const seats = Number(f.seats);
  if (!f.seats || !Number.isInteger(seats) || seats < 1)
    errors.seats = "Enter a whole number of seats, 1 or more";
  return errors;
}

const LABELS: Record<keyof Fields, string> = {
  name: "Name",
  email: "Email",
  seats: "Seats",
};

function SummaryDemo() {
  const id = useId();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<ReturnType<typeof validate> | null>(null);
  const [sent, setSent] = useState(false);
  const summary = useRef<HTMLDivElement>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate(fields);
    if (Object.keys(next).length === 0) {
      setErrors(null);
      setSent(true);
      return;
    }
    setErrors(next);
    // after the summary renders
    requestAnimationFrame(() => summary.current?.focus());
  };

  // Once submitted, errors track the fields live so fixes clear them.
  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...fields, [key]: e.target.value };
    setFields(next);
    if (errors) setErrors(validate(next));
  };

  const errorKeys = errors ? (Object.keys(errors) as (keyof Fields)[]) : [];

  if (sent) {
    return (
      <Frame note="Valid on submit: no summary, no detour.">
        <div className="flex items-center justify-between gap-3 p-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-accent">
            <Check size={12} /> Submitted
          </span>
          <button
            type="button"
            className={btn}
            onClick={() => {
              setFields(EMPTY);
              setSent(false);
            }}
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </Frame>
    );
  }

  return (
    <Frame
      note={
        <>
          Submit it empty. Focus jumps to the summary, each link moves focus to
          its field, and the summary shrinks as you fix things.
        </>
      }
    >
      <form noValidate onSubmit={onSubmit} className="space-y-4 p-4">
        {errorKeys.length > 0 && (
          <div
            ref={summary}
            tabIndex={-1}
            className="rounded border border-red-500/50 bg-red-500/5 p-3 outline-none focus:ring-1 focus:ring-red-500/60"
          >
            <p className="mb-2 text-xs font-medium text-red-400">
              {errorKeys.length === 1 ? "There's 1 problem" : `There are ${errorKeys.length} problems`}
            </p>
            <ul className="space-y-1">
              {errorKeys.map((key) => (
                <li key={key}>
                  <a
                    href={`#${id}-${key}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(`${id}-${key}`)?.focus();
                    }}
                    className="text-[11px] text-red-400 underline underline-offset-2 hover:text-red-300"
                  >
                    {errors?.[key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          {(Object.keys(LABELS) as (keyof Fields)[]).map((key) => (
            <div key={key}>
              <label htmlFor={`${id}-${key}`} className="mb-1.5 block text-[10px] font-medium text-dim">
                {LABELS[key]}
              </label>
              <input
                id={`${id}-${key}`}
                type={key === "email" ? "email" : key === "seats" ? "number" : "text"}
                value={fields[key]}
                onChange={set(key)}
                aria-invalid={Boolean(errors?.[key])}
                aria-describedby={`${id}-${key}-msg`}
                className={inputClass(errors?.[key] ? "error" : "idle")}
              />
              <Message id={`${id}-${key}-msg`} error={errors?.[key]} />
            </div>
          ))}
        </div>
        <button type="submit" className={primary}>
          Start trial
        </button>
      </form>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Rules before errors
// ---------------------------------------------------------------------------
// When a field has rules, show them before the first keystroke and tick them
// off as they're met. The reader never has to fail to find out what passes.

const RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: "At least 12 characters", test: (v) => v.length >= 12 },
  { label: "A number", test: (v) => /\d/.test(v) },
  { label: "A lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "Not the same as your username", test: (v) => v.length > 0 && v !== "syntaqx" },
];

function RulesDemo() {
  const id = useId();
  const [value, setValue] = useState("");
  const met = RULES.filter((r) => r.test(value)).length;

  return (
    <Frame
      note={
        <>
          The rules are visible before you type, and each ticks off as
          it&apos;s met. The screen reader hears the list once, through
          aria-describedby, not after every keystroke.
        </>
      }
    >
      <div className="grid gap-5 p-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[10px] font-medium text-dim">Username</p>
          <p className="mb-4 font-mono text-xs text-foreground">syntaqx</p>
          <label htmlFor={id} className="mb-1.5 block text-[10px] font-medium text-dim">
            New password
          </label>
          <input
            id={id}
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-describedby={`${id}-rules`}
            className={inputClass(met === RULES.length ? "ok" : "idle")}
          />
        </div>
        <ul id={`${id}-rules`} className="space-y-1.5 self-end">
          {RULES.map((r) => {
            const ok = r.test(value);
            return (
              <li
                key={r.label}
                className={`flex items-center gap-2 text-[11px] transition-colors ${ok ? "text-accent" : "text-dim"}`}
              >
                {ok ? <Check size={11} /> : <Circle size={9} className="mx-px" />}
                {r.label}
              </li>
            );
          })}
        </ul>
      </div>
    </Frame>
  );
}

export { TimingDemo, SummaryDemo, RulesDemo };

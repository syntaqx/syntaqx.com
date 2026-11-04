"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/syntaqx/ui/button";

// A region that takes files two ways: dropped anywhere on it, or chosen
// through the file picker from a FileDropTrigger (a Button) or a
// FileDropArea (a large dashed target). While files are dragged over it the
// region carries `data-dragging`, so it can restyle itself. Only drags that
// carry files count, so dragging text into a textarea inside still works.
// `accept` and `multiple` go to the picker; `onFiles` gets whatever was
// dropped or picked and decides what it takes.

interface FileDropState {
  open: () => void;
  dragging: boolean;
  disabled: boolean;
}

const FileDropContext = React.createContext<FileDropState | null>(null);

/** The surrounding FileDrop: `open()` shows the file picker. */
function useFileDrop() {
  const context = React.useContext(FileDropContext);
  if (!context) throw new Error("useFileDrop must be used within a FileDrop");
  return context;
}

const hasFiles = (e: React.DragEvent) => e.dataTransfer.types.includes("Files");

function FileDrop({
  className,
  onFiles,
  accept,
  multiple = false,
  disabled = false,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "onDrop"> & {
  onFiles: (files: File[]) => void;
  /** Passed to the file picker, as on `<input type="file">`. */
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  // dragenter and dragleave fire for every child crossed; count them so the
  // region stays highlighted until the drag really leaves it.
  const depth = React.useRef(0);
  const [dragging, setDragging] = React.useState(false);

  const open = React.useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const state = React.useMemo(() => ({ open, dragging, disabled }), [open, dragging, disabled]);

  return (
    <FileDropContext.Provider value={state}>
      <div
        data-slot="file-drop"
        data-dragging={dragging || undefined}
        data-disabled={disabled || undefined}
        className={cn("group/file-drop", className)}
        onDragEnter={(e) => {
          if (disabled || !hasFiles(e)) return;
          e.preventDefault();
          depth.current += 1;
          setDragging(true);
        }}
        onDragOver={(e) => {
          if (disabled || !hasFiles(e)) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={(e) => {
          if (disabled || !hasFiles(e)) return;
          depth.current = Math.max(0, depth.current - 1);
          if (depth.current === 0) setDragging(false);
        }}
        onDrop={(e) => {
          if (disabled || !hasFiles(e)) return;
          e.preventDefault();
          depth.current = 0;
          setDragging(false);
          const files = Array.from(e.dataTransfer.files);
          if (files.length) onFiles(multiple ? files : files.slice(0, 1));
        }}
        {...props}
      >
        {children}
        <input
          ref={inputRef}
          type="file"
          hidden
          tabIndex={-1}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            // Clear it, so choosing the same file again still fires.
            e.target.value = "";
            if (files.length) onFiles(files);
          }}
        />
      </div>
    </FileDropContext.Provider>
  );
}

/** A Button that opens the file picker. */
function FileDropTrigger({
  variant = "outline",
  size = "sm",
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { open, disabled } = useFileDrop();
  return (
    <Button
      type="button"
      data-slot="file-drop-trigger"
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) open();
      }}
      {...props}
    />
  );
}

/** A large dashed target that opens the file picker, for a drop-first layout. */
function FileDropArea({ className, onClick, ...props }: React.ComponentProps<"button">) {
  const { open, disabled } = useFileDrop();
  return (
    <button
      type="button"
      data-slot="file-drop-area"
      disabled={disabled}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input p-8 text-center text-sm text-muted-foreground transition-colors outline-none",
        "hover:border-primary/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "group-data-dragging/file-drop:border-primary group-data-dragging/file-drop:bg-primary/5",
        "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-6",
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) open();
      }}
      {...props}
    />
  );
}

export { FileDrop, FileDropTrigger, FileDropArea, useFileDrop };

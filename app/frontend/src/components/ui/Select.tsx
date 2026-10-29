import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import clsx from "clsx";

export interface SelectOption {
  value: string;
  label: string;
  hint?: string; // small muted text next to the label, e.g. the district
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel: string;
  size?: "md" | "sm";
  className?: string;
}

// A themed replacement for <select>. The browser's own dropdown can't be styled, so this draws the list itself
// and keeps the keyboard behaviour: arrows, Home/End, Enter/Space to choose, Escape to close, type a letter to jump.
export default function Select({ value, onChange, options, ariaLabel, size = "md", className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  // keep the highlighted option visible when moving with the keyboard
  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function show() {
    setActive(selectedIndex);
    setOpen(true);
  }

  function pick(index: number) {
    onChange(options[index].value);
    setOpen(false);
    button.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        show();
      }
      return;
    }
    const last = options.length - 1;
    if (e.key === "ArrowDown") setActive((i) => Math.min(last, i + 1));
    else if (e.key === "ArrowUp") setActive((i) => Math.max(0, i - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(last);
    else if (e.key === "Enter" || e.key === " ") pick(active);
    else if (e.key === "Escape") setOpen(false);
    else if (e.key === "Tab") {
      setOpen(false);
      return;
    } else if (e.key.length === 1) {
      // type a letter to jump to the next option starting with it
      const letter = e.key.toLowerCase();
      const next = [...options.keys()].map((n) => (active + 1 + n) % options.length).find((i) => options[i].label.toLowerCase().startsWith(letter));
      if (next !== undefined) setActive(next);
      return;
    } else return;
    e.preventDefault();
  }

  return (
    <div ref={root} className={clsx("relative", className)}>
      <button
        ref={button}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        className={clsx(
          "flex w-full items-center justify-between gap-2 rounded-2xl border bg-parchment-50 px-3 text-left text-ink-900 outline-none transition-colors duration-200 ease-smooth",
          size === "md" ? "py-2.5" : "py-2 text-sm",
          open ? "border-forest-500" : "border-ink-900/15 hover:border-forest-500/50 focus-visible:border-forest-500"
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown size={16} className={clsx("shrink-0 text-ink-700/60 transition-transform duration-200 ease-smooth", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={list}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 z-30 mt-2 max-h-72 origin-top overflow-y-auto rounded-2xl border border-ink-900/10 bg-parchment-50 p-1.5 shadow-elevate [scrollbar-color:rgb(63_106_69/0.35)_transparent] [scrollbar-width:thin]"
          >
            {options.map((o, i) => (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={o.value === value}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()} // keep focus on the button
                onClick={() => pick(i)}
                className={clsx(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-150",
                  i === active ? "bg-forest-600/10 text-forest-700" : "text-ink-900",
                  o.value === value && "font-medium"
                )}
              >
                <span className="min-w-0">
                  {o.label}
                  {o.hint && <span className="ml-2 text-xs font-normal text-ink-700/50">{o.hint}</span>}
                </span>
                {o.value === value && <Check size={15} className="shrink-0 text-forest-600" />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type LicenseOption = {
  id: string;
  label: string;
  serialNumber?: string | null;
};

type LicenseComboboxProps = {
  options: LicenseOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
};

export function LicenseCombobox({
  options,
  value,
  onChange,
  placeholder = "Pilih lisensi...",
  emptyText = "Tidak ada data",
}: LicenseComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = options.find((o) => o.id === value);

  const filtered =
    search.trim() === ""
      ? options
      : options.filter((o) => {
          const q = search.toLowerCase();
          return (
            o.label.toLowerCase().includes(q) ||
            (o.serialNumber ?? "").toLowerCase().includes(q)
          );
        });

  const handleSelect = (id: string) => {
    onChange(id === value ? "none" : id);
    setOpen(false);
    setSearch("");
  };

  const triggerLabel = selected ? (
    <span className="flex flex-col items-start text-left leading-tight">
      <span className="text-sm">{selected.label}</span>
      {selected.serialNumber && (
        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
          <Key className="h-2.5 w-2.5" />
          {selected.serialNumber}
        </span>
      )}
    </span>
  ) : (
    <span className="text-muted-foreground">{placeholder}</span>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-9 px-3 py-2"
        >
          {triggerLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        style={{ width: "var(--radix-popover-trigger-width)" }}
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Cari nama atau serial number..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="none"
                onSelect={() => handleSelect("none")}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value || value === "none" ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="text-muted-foreground">Tidak Ada</span>
              </CommandItem>
              {filtered.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.id}
                  onSelect={() => handleSelect(option.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === option.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex flex-col">
                    <span>{option.label}</span>
                    {option.serialNumber && (
                      <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                        <Key className="h-2.5 w-2.5" />
                        {option.serialNumber}
                      </span>
                    )}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

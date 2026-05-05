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
  usedByDeviceId?: string | null;
};

type LicenseComboboxProps = {
  options: LicenseOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  currentDeviceId?: string;
};

export function LicenseCombobox({
  options,
  value,
  onChange,
  placeholder = "Pilih lisensi...",
  emptyText = "Tidak ada data",
  currentDeviceId,
}: LicenseComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const isInUse = (opt: LicenseOption) =>
    !!opt.usedByDeviceId && opt.usedByDeviceId !== currentDeviceId;

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

  const handleSelect = (id: string, inUse: boolean) => {
    if (inUse) return;
    onChange(id === value ? "none" : id);
    setOpen(false);
    setSearch("");
  };

  const triggerLabel = selected ? (
    <span className="flex items-center gap-1.5 text-sm min-w-0 truncate">
      <span className="truncate">{selected.label}</span>
      {selected.serialNumber && (
        <>
          <span className="text-muted-foreground shrink-0">—</span>
          <Key className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className="font-mono text-muted-foreground truncate">{selected.serialNumber}</span>
        </>
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
          className="w-full justify-between h-9 px-3"
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
                onSelect={() => handleSelect("none", false)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value || value === "none" ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="text-muted-foreground">Tidak Ada</span>
              </CommandItem>
              {filtered.map((option) => {
                const used = isInUse(option);
                return (
                  <CommandItem
                    key={option.id}
                    value={option.id}
                    onSelect={() => handleSelect(option.id, used)}
                    className={cn(used && "opacity-50 cursor-not-allowed")}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === option.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="truncate">{option.label}</span>
                      {option.serialNumber && (
                        <>
                          <span className="text-muted-foreground shrink-0">—</span>
                          <Key className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="text-xs font-mono text-muted-foreground truncate">{option.serialNumber}</span>
                        </>
                      )}
                    </span>
                    {used && (
                      <span className="ml-2 shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                        Terpakai
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

type NoticeOptions = {
  title: string;
  description?: string;
};

type GlobalModalContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  success: (options: NoticeOptions) => void;
  error: (options: NoticeOptions) => void;
};

const GlobalModalContext = createContext<GlobalModalContextValue | null>(null);

export function GlobalModalProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<
    (ConfirmOptions & { open: boolean }) | null
  >(null);
  const [noticeState, setNoticeState] = useState<
    (NoticeOptions & { open: boolean; variant: "success" | "error" }) | null
  >(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null,
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmState({ ...options, open: true });
    return new Promise<boolean>((resolve) => setResolver(() => resolve));
  }, []);

  const success = useCallback((options: NoticeOptions) => {
    setNoticeState({ ...options, open: true, variant: "success" });
  }, []);

  const error = useCallback((options: NoticeOptions) => {
    setNoticeState({ ...options, open: true, variant: "error" });
  }, []);

  const value = useMemo(
    () => ({ confirm, success, error }),
    [confirm, success, error],
  );

  return (
    <GlobalModalContext.Provider value={value}>
      {children}

      <AlertDialog
        open={!!confirmState?.open}
        onOpenChange={(open) => {
          if (!open && resolver) {
            resolver(false);
            setResolver(null);
          }
          if (!open) setConfirmState(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmState?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmState?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                resolver?.(false);
                setResolver(null);
                setConfirmState(null);
              }}
            >
              {confirmState?.cancelText ?? "Batal"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resolver?.(true);
                setResolver(null);
                setConfirmState(null);
              }}
            >
              {confirmState?.confirmText ?? "Lanjutkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!noticeState?.open}
        onOpenChange={(open) => {
          if (!open) setNoticeState(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {noticeState?.variant === "success"
                ? "Berhasil"
                : "Terjadi Error"}
            </DialogTitle>
            <DialogDescription>
              <span className="font-medium">{noticeState?.title}</span>
              {noticeState?.description ? ` - ${noticeState.description}` : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setNoticeState(null)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </GlobalModalContext.Provider>
  );
}

export function useGlobalModal() {
  const ctx = useContext(GlobalModalContext);
  if (!ctx) {
    throw new Error("useGlobalModal must be used inside GlobalModalProvider");
  }
  return ctx;
}

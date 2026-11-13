"use client";

import { useEffect, useRef } from "react";

/*
 * Ngăn xếp modal đang mở dùng chung toàn app. Chỉ modal trên cùng (mở sau cùng)
 * phản hồi Escape, tránh việc modal lồng nhau cùng đóng khi bấm Escape một lần.
 */
type EscapeEntry = {
  id: symbol;
  onClose: () => void;
};

const escapeStack: EscapeEntry[] = [];
let escapeBound = false;

function handleEscape(event: KeyboardEvent): void {
  if (event.key !== "Escape") return;
  /* Phần tử con (vd. dropdown Select) đã xử lý Escape thì bỏ qua. */
  if (event.defaultPrevented) return;
  const top = escapeStack[escapeStack.length - 1];
  top?.onClose();
}

function bindEscape(): void {
  if (escapeBound) return;
  window.addEventListener("keydown", handleEscape);
  escapeBound = true;
}

function unbindEscape(): void {
  if (!escapeBound) return;
  window.removeEventListener("keydown", handleEscape);
  escapeBound = false;
}

export function useEscapeClose(active: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) return;
    const entry: EscapeEntry = {
      id: Symbol("modal"),
      onClose: () => onCloseRef.current(),
    };
    escapeStack.push(entry);
    bindEscape();
    return () => {
      const index = escapeStack.indexOf(entry);
      if (index >= 0) escapeStack.splice(index, 1);
      if (escapeStack.length === 0) unbindEscape();
    };
  }, [active]);
}

/*
 * Đếm số modal đang mở để khóa scroll đúng: chỉ khóa khi modal đầu tiên mở và
 * chỉ khôi phục khi modal cuối cùng đóng — không phụ thuộc thứ tự đóng.
 */
let scrollLockCount = 0;
let previousOverflow = "";

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    scrollLockCount += 1;
    if (scrollLockCount === 1) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    return () => {
      scrollLockCount = Math.max(scrollLockCount - 1, 0);
      if (scrollLockCount === 0) {
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [active]);
}

export function useModalBehavior(active: boolean, onClose: () => void) {
  useEscapeClose(active, onClose);
  useBodyScrollLock(active);
}

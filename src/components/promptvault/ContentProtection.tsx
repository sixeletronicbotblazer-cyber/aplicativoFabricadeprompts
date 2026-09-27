"use client";

import { useEffect } from "react";

/**
 * ContentProtection — client-side content protection layer.
 *
 * Blocks:
 *  - Right-click (context menu) on protected areas
 *  - Image dragging
 *  - Keyboard shortcuts for save/view-source/print/devtools
 *  - Manual copy on protected content (keeps "Copiar Prompt" button working)
 *
 * Does NOT break:
 *  - Login, search, filter interactions
 *  - The official "Copiar Prompt" button (data-copy-prompt attribute)
 *  - Input/textarea typing and selection
 */
export function ContentProtection() {
  useEffect(() => {
    // ─── 1. Block right-click on protected areas ───
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Allow context menu on inputs/textareas
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.closest("[data-allow-context]")
      ) {
        return;
      }
      e.preventDefault();
    };

    // ─── 2. Block drag start on images ───
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target instanceof HTMLImageElement || target.closest("img, video, [data-protected]")) {
        e.preventDefault();
      }
    };

    // ─── 3. Block copy on protected content (but allow official copy button) ───
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      // Allow copy from the official copy button or input/textarea
      if (
        target?.closest("[data-copy-prompt]") ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      // Check if selection is within the prompt text pre block (allowed)
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer as HTMLElement;
        if (
          container?.closest?.("[data-prompt-text]") ||
          (container instanceof Text && container.parentElement?.closest("[data-prompt-text]"))
        ) {
          return; // Allow copying from prompt text area
        }
      }
      e.preventDefault();
    };

    // ─── 4. Block keyboard shortcuts ───
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform?.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + S (Save)
      if (mod && e.key === "s") {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd + U (View source)
      if (mod && e.key === "u") {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd + P (Print)
      if (mod && e.key === "p") {
        e.preventDefault();
        return;
      }
      // F12 (DevTools)
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd + Shift + I (DevTools)
      if (mod && e.shiftKey && (e.key === "I" || e.key === "i")) {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd + Shift + C (Inspect element)
      if (mod && e.shiftKey && (e.key === "C" || e.key === "c")) {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd + Shift + J (Console)
      if (mod && e.shiftKey && (e.key === "J" || e.key === "j")) {
        e.preventDefault();
        return;
      }
    };

    // ─── 5. Block selectstart on protected areas ───
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      // Allow selection on inputs, textareas, and prompt text
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.closest("[data-prompt-text], [data-allow-select], input, textarea")
      ) {
        return;
      }
      // Block selection on cards, images, badges, etc.
      if (target.closest("[data-protected], .glass, article, [data-no-select]")) {
        e.preventDefault();
      }
    };

    // Attach all listeners
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("dragstart", handleDragStart, true);
    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("selectstart", handleSelectStart, true);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("dragstart", handleDragStart, true);
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("selectstart", handleSelectStart, true);
    };
  }, []);

  return null;
}

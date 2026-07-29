"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { GripVertical, GripHorizontal } from "lucide-react";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";

interface ResizableEditorLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftPercent?: number;
  minLeftPercent?: number;
  maxLeftPercent?: number;
}

export default function ResizableEditorLayout({
  left,
  right,
  defaultLeftPercent = 65,
  minLeftPercent = 30,
  maxLeftPercent = 80,
}: ResizableEditorLayoutProps) {
  const [leftPercent, setLeftPercent] = useState(defaultLeftPercent);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLayoutResize = useCallback(() => {
    // Trigger Monaco editor relayout so lines & viewport resize smoothly
    const editor = useCodeEditorStore.getState().editor;
    if (editor) {
      editor.layout();
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleTouchStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 1024;

      if (isMobile) {
        // Vertical split on mobile
        const newTop = ((e.clientY - rect.top) / rect.height) * 100;
        const clampedTop = Math.min(Math.max(newTop, 25), 85);
        setLeftPercent(clampedTop);
      } else {
        // Horizontal split on desktop
        const newLeft = ((e.clientX - rect.left) / rect.width) * 100;
        const clampedLeft = Math.min(
          Math.max(newLeft, minLeftPercent),
          maxLeftPercent
        );
        setLeftPercent(clampedLeft);
      }

      handleLayoutResize();
    },
    [isDragging, minLeftPercent, maxLeftPercent, handleLayoutResize]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !containerRef.current || !e.touches[0]) return;
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const isMobile = window.innerWidth < 1024;

      if (isMobile) {
        const newTop = ((touch.clientY - rect.top) / rect.height) * 100;
        const clampedTop = Math.min(Math.max(newTop, 25), 85);
        setLeftPercent(clampedTop);
      } else {
        const newLeft = ((touch.clientX - rect.left) / rect.width) * 100;
        const clampedLeft = Math.min(
          Math.max(newLeft, minLeftPercent),
          maxLeftPercent
        );
        setLeftPercent(clampedLeft);
      }

      handleLayoutResize();
    },
    [isDragging, minLeftPercent, maxLeftPercent, handleLayoutResize]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      handleLayoutResize();
    }
  }, [isDragging, handleLayoutResize]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col lg:flex-row min-h-0 relative overflow-hidden select-none"
    >
      {/* Code Editor Panel */}
      <div
        className="min-h-0 min-w-0 flex flex-col transition-none"
        style={{
          flexBasis: `${leftPercent}%`,
          flexGrow: 0,
          flexShrink: 0,
        }}
      >
        {left}
      </div>

      {/* Resizable Divider Handle Bar */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`relative z-20 flex items-center justify-center shrink-0 transition-colors
          lg:w-2 lg:h-full lg:cursor-col-resize w-full h-2 cursor-row-resize
          bg-hairline/60 hover:bg-link/50 active:bg-link group ${
            isDragging ? "bg-link" : ""
          }`}
        title="Drag to resize Editor / Console"
      >
        {/* Visual Grip Handle */}
        <div className="hidden lg:flex items-center justify-center w-4 h-8 rounded bg-surface/90 border border-hairline shadow-sm text-mute group-hover:text-link group-hover:border-link/50 transition-colors">
          <GripVertical className="w-3 h-3" />
        </div>
        <div className="flex lg:hidden items-center justify-center w-8 h-4 rounded bg-surface/90 border border-hairline shadow-sm text-mute group-hover:text-link group-hover:border-link/50 transition-colors">
          <GripHorizontal className="w-3 h-3" />
        </div>
      </div>

      {/* Output Console Panel */}
      <div
        className="min-h-0 flex-1 flex flex-col transition-none"
        style={{
          flexBasis: `${100 - leftPercent}%`,
        }}
      >
        {right}
      </div>
    </div>
  );
}

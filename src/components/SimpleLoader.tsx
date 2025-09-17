"use client";

import { useEffect } from "react";

export function SimpleLoader() {
  useEffect(() => {
    // Hide the initial CSS loader when React is ready
    const initialLoader = document.getElementById("initial-loader");

    const hideLoader = () => {
      if (initialLoader) {
        initialLoader.classList.add("hidden");
      }
    };

    // Hide after a short delay to ensure content is ready
    const timer = setTimeout(hideLoader, 1000);

    // Also hide when the page is fully loaded
    if (document.readyState === "complete") {
      hideLoader();
    } else {
      window.addEventListener("load", hideLoader);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", hideLoader);
    };
  }, []);

  // This component doesn't render anything visible
  // It just manages hiding the CSS loader
  return null;
}

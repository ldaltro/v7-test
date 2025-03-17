import { useState, useEffect, useCallback } from "react";

export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openCommandPalette = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handle keyboard shortcut (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Cmd+K is pressed
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return {
    isOpen,
    openCommandPalette,
    closeCommandPalette,
  };
};

export default useCommandPalette;

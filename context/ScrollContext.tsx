import React, { createContext, useContext } from "react";

interface ScrollContextType {
  scrollTo: (target: string) => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const scrollTo = (targetId: string) => {
    const lenis = (window as any).lenis;
    // If target is just '#' or empty, scroll to top
    if (targetId === "#" || !targetId) {
      if (lenis) {
        lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    const element = document.querySelector(targetId);
    if (element) {
      // Manually calculate position to ensure offset is correct and behavior is forced
      const headerOffset = 60; // Further adjusted navbar height + padding
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      if (lenis) {
        lenis.scrollTo(offsetPosition);
      } else {
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    } else {
      // Fallback for when navigating from another page where the element doesn't exist yet.
      // The page navigation logic handles the page switch, but we might want to ensure top scroll.
      console.warn(`Element with id ${targetId} not found in current DOM.`);
    }
  };

  return (
    <ScrollContext.Provider value={{ scrollTo }}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScroll must be used within a ScrollProvider");
  }
  return context;
};

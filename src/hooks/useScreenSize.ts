import { useEffect, useState } from "react";

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: 500,
    height: 500,
  });

  useEffect(() => {
    const updateSize = () => {
      const gridElement = document.querySelector(".MuiGrid-root");
      setScreenSize({
        width: gridElement?.clientWidth ?? 500,
        height: window.innerHeight - 120,
      });
    };

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return screenSize;
};

import { useEffect, useState, RefObject, useCallback } from "react";

const TOTAL_FRAMES = 33;

function getFramePath(index: number): string {
  const num = String(index + 1).padStart(4, "0");
  return `/hero-frames/frame_${num}.webp`;
}

export function useScrollFrames(
  containerRef: RefObject<HTMLElement | null>
) {
  const [currentFrame, setCurrentFrame] = useState(0);

  // Preload all frames
  useEffect(() => {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
    }
  }, []);

  const updateFrame = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scrollableDistance = container.offsetHeight - window.innerHeight;

    if (scrollableDistance <= 0) return;

    const progress = Math.min(Math.max(0, -rect.top / scrollableDistance), 1);
    const frameIndex = Math.min(
      Math.floor(progress * TOTAL_FRAMES),
      TOTAL_FRAMES - 1
    );

    setCurrentFrame(frameIndex);
  }, [containerRef]);

  useEffect(() => {
    let ticking = false;
    let frameId = 0;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      frameId = requestAnimationFrame(() => {
        updateFrame();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Initial call
    updateFrame();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frameId);
    };
  }, [updateFrame]);

  return getFramePath(currentFrame);
}

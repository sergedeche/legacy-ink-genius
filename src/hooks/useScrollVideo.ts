import { useEffect, RefObject } from "react";

export function useScrollVideo(
  videoRef: RefObject<HTMLVideoElement | null>,
  containerRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = container.getBoundingClientRect();
          const scrollableDistance = container.offsetHeight - window.innerHeight;
          
          if (scrollableDistance <= 0) {
            ticking = false;
            return;
          }

          // progress 0→1 as container scrolls through
          const progress = Math.min(
            Math.max(0, -rect.top / scrollableDistance),
            1
          );

          if (video.duration && isFinite(video.duration)) {
            video.currentTime = progress * video.duration;
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial position

    return () => window.removeEventListener("scroll", onScroll);
  }, [videoRef, containerRef]);
}

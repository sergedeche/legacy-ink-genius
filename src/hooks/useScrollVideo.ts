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
    let frameId = 0;

    const updateFrame = () => {
      const rect = container.getBoundingClientRect();
      const scrollableDistance = container.offsetHeight - window.innerHeight;

      if (scrollableDistance > 0 && video.readyState >= 1 && isFinite(video.duration)) {
        const progress = Math.min(
          Math.max(0, -rect.top / scrollableDistance),
          1
        );
        const targetTime = progress * video.duration;

        if (Math.abs(video.currentTime - targetTime) > 0.016) {
          video.currentTime = targetTime;
        }
      }

      ticking = false;
    };

    const requestFrameUpdate = () => {
      if (ticking) return;
      ticking = true;
      frameId = requestAnimationFrame(updateFrame);
    };

    video.pause();

    window.addEventListener("scroll", requestFrameUpdate, { passive: true });
    window.addEventListener("resize", requestFrameUpdate);
    video.addEventListener("loadedmetadata", requestFrameUpdate);
    video.addEventListener("loadeddata", requestFrameUpdate);
    requestFrameUpdate();

    return () => {
      window.removeEventListener("scroll", requestFrameUpdate);
      window.removeEventListener("resize", requestFrameUpdate);
      video.removeEventListener("loadedmetadata", requestFrameUpdate);
      video.removeEventListener("loadeddata", requestFrameUpdate);
      cancelAnimationFrame(frameId);
    };
  }, [videoRef, containerRef]);
}

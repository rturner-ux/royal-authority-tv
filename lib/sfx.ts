// Small investigative sound design touches. Every source clip is Mixkit's
// free-license sound effects (commercial use allowed, no attribution
// required). Kept as short, subtle one-shots -- never looping ambience or
// anything that would be jarring on a serious true-crime site.
const CATALOG = {
  zoom: "/sfx/zoom-whoosh.mp3",
  shutter: "/sfx/camera-shutter.mp3",
  pin: "/sfx/pin-place.mp3",
  connect: "/sfx/connect-click.mp3",
  paper: "/sfx/paper-rustle.mp3",
} as const;

export type SfxName = keyof typeof CATALOG;

export function playSfx(name: SfxName, volume = 0.5) {
  if (typeof window === "undefined") return;
  const audio = new Audio(CATALOG[name]);
  audio.volume = volume;
  audio.play().catch(() => {
    // Autoplay can still be blocked in some browsers/contexts -- a missed
    // sound effect isn't worth surfacing an error over.
  });
}

import S from './data/script.json';

// "format": "short" in script.json switches every scene to vertical 1080x1920.
// Shorts keep captions inside x 60-880 and above y ~1440: YouTube draws its buttons in the right ~200 px
// and the title, channel and related-video link over the bottom ~400-480 px.
export const IS_SHORT = (S as {format?: string}).format === 'short';
export const W = IS_SHORT ? 1080 : 1920;
export const H = IS_SHORT ? 1920 : 1080;
export const VIS = IS_SHORT ? {top: 200, bottom: 1130, left: 40, right: 40} : {top: 120, bottom: 820, left: 80, right: 80};
export const CONTENT_W = W - VIS.left - VIS.right;
export const CAP = IS_SHORT
  ? {top: 1190, height: 300, size: 54, maxW: 800, left: 60, right: 200}
  : {top: 850, height: 200, size: 46, maxW: 1640, left: 0, right: 0};
export const MEME = IS_SHORT ? {left: 40, right: 40, top: 190, height: 950} : {left: 150, right: 150, top: 105, height: 715};
/** Sticker coordinates are written for 16:9; Shorts map them into the vertical visual area. */
export const stickerXY = (x: number, y: number) =>
  IS_SHORT ? {x: Math.min(40 + x * 0.5, 760), y: VIS.top + ((y - 120) / 700) * (VIS.bottom - VIS.top - 80)} : {x, y};
/** Width for a panel: its 16:9 size, capped to what fits. */
export const fit = (w: number) => Math.min(w, CONTENT_W);

// Darkest first; PALETTE[0] must match --color-bg so dithered art fades into the page.
export const PALETTE: ReadonlyArray<readonly [number, number, number]> = [
  [2, 8, 38],
  [4, 20, 98],
  [12, 46, 184],
  [31, 79, 255],
  [90, 130, 255],
  [178, 198, 255],
];

const BAYER_8 = [
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);

const isLittleEndian = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;

const PACKED = new Uint32Array(
  PALETTE.map(([r, g, b]) =>
    isLittleEndian
      ? ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0
      : ((r << 24) | (g << 16) | (b << 8) | 255) >>> 0,
  ),
);

const MAX_LEVEL = PALETTE.length - 1;

/** Maps a 0–1 intensity to a packed RGBA palette color using ordered dithering. */
export function ditherPixel(value: number, x: number, y: number): number {
  const scaled = Math.min(Math.max(value, 0), 1) * MAX_LEVEL;
  let level = Math.floor(scaled);
  if (scaled - level > BAYER_8[((y & 7) << 3) | (x & 7)]) level += 1;
  return PACKED[Math.min(level, MAX_LEVEL)];
}

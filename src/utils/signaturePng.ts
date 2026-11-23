type Point = { x: number; y: number };
export type Strokes = readonly (readonly Point[])[];

type PngOptions = { scale?: number; strokeWidth?: number; padding?: number };

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const MAX_STORED_BLOCK = 0xffff;
const STAMP_STEP = 0.5;
const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const adler32 = (bytes: Uint8Array) => {
  let a = 1;
  let b = 0;
  for (const byte of bytes) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
};

const uint32 = (value: number) => [
  (value >>> 24) & 0xff,
  (value >>> 16) & 0xff,
  (value >>> 8) & 0xff,
  value & 0xff,
];

function chunk(type: string, data: Uint8Array | number[]): number[] {
  const body = new Uint8Array(4 + data.length);
  for (let i = 0; i < 4; i++) body[i] = type.charCodeAt(i);
  body.set(data, 4);
  return [...uint32(data.length), ...body, ...uint32(crc32(body))];
}

function zlibStored(raw: Uint8Array): Uint8Array {
  const blocks = Math.max(1, Math.ceil(raw.length / MAX_STORED_BLOCK));
  const out = new Uint8Array(2 + raw.length + blocks * 5 + 4);
  out[0] = 0x78;
  out[1] = 0x01;
  let offset = 2;
  for (let i = 0; i < blocks; i++) {
    const start = i * MAX_STORED_BLOCK;
    const length = Math.min(MAX_STORED_BLOCK, raw.length - start);
    out[offset++] = i === blocks - 1 ? 1 : 0;
    out[offset++] = length & 0xff;
    out[offset++] = (length >>> 8) & 0xff;
    out[offset++] = ~length & 0xff;
    out[offset++] = (~length >>> 8) & 0xff;
    out.set(raw.subarray(start, start + length), offset);
    offset += length;
  }
  out.set(uint32(adler32(raw)), offset);
  return out;
}

function toBase64(bytes: Uint8Array) {
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const [a, b = 0, c = 0] = [bytes[i], bytes[i + 1], bytes[i + 2]];
    const triple = (a << 16) | (b << 8) | c;
    result += BASE64[(triple >> 18) & 63] + BASE64[(triple >> 12) & 63];
    result += i + 1 < bytes.length ? BASE64[(triple >> 6) & 63] : '=';
    result += i + 2 < bytes.length ? BASE64[triple & 63] : '=';
  }
  return result;
}

export function strokesToPngDataUrl(
  strokes: Strokes,
  { scale = 2, strokeWidth = 2.5, padding = 8 }: PngOptions = {}
): string | null {
  const points = strokes.flat();
  if (points.length === 0) return null;

  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));
  const width = Math.ceil((maxX - minX + padding * 2) * scale);
  const height = Math.ceil((maxY - minY + padding * 2) * scale);
  const rowBytes = Math.ceil(width / 8);
  const radius = (strokeWidth * scale) / 2;
  const raw = new Uint8Array(height * (rowBytes + 1));
  for (let y = 0; y < height; y++) raw.fill(0xff, y * (rowBytes + 1) + 1, (y + 1) * (rowBytes + 1));
  for (let y = 0; y < height; y++) raw[y * (rowBytes + 1)] = 0;

  const stamp = (cx: number, cy: number) => {
    for (
      let y = Math.max(0, Math.floor(cy - radius));
      y <= Math.min(height - 1, cy + radius);
      y++
    ) {
      for (
        let x = Math.max(0, Math.floor(cx - radius));
        x <= Math.min(width - 1, cx + radius);
        x++
      ) {
        if ((x - cx) ** 2 + (y - cy) ** 2 > radius ** 2) continue;
        raw[y * (rowBytes + 1) + 1 + (x >> 3)] &= ~(0x80 >> (x & 7));
      }
    }
  };
  const toCanvas = (point: Point) => ({
    x: (point.x - minX + padding) * scale,
    y: (point.y - minY + padding) * scale,
  });

  for (const stroke of strokes) {
    const mapped = stroke.map(toCanvas);
    if (mapped.length === 1) stamp(mapped[0].x, mapped[0].y);
    for (let i = 1; i < mapped.length; i++) {
      const from = mapped[i - 1];
      const to = mapped[i];
      const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / STAMP_STEP));
      for (let step = 0; step <= steps; step++) {
        const t = step / steps;
        stamp(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
      }
    }
  }

  const header = [...uint32(width), ...uint32(height), 1, 0, 0, 0, 0];
  const png = Uint8Array.from([
    ...PNG_SIGNATURE,
    ...chunk('IHDR', header),
    ...chunk('tRNS', [0, 1]),
    ...chunk('IDAT', zlibStored(raw)),
    ...chunk('IEND', []),
  ]);
  return `data:image/png;base64,${toBase64(png)}`;
}

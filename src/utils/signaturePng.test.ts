import { strokesToPngDataUrl } from '@/utils/signaturePng';

const { inflateSync } = jest.requireActual<{ inflateSync: (data: Uint8Array) => Uint8Array }>(
  'zlib'
);

const decode = (dataUrl: string) =>
  Uint8Array.from(atob(dataUrl.split(',')[1]), (char) => char.charCodeAt(0));

const readUint32 = (bytes: Uint8Array, at: number) =>
  new DataView(bytes.buffer, bytes.byteOffset).getUint32(at);

const indexOfText = (bytes: Uint8Array, text: string) =>
  bytes.findIndex((_, i) => [...text].every((char, k) => bytes[i + k] === char.charCodeAt(0)));

describe('strokesToPngDataUrl', () => {
  it('returns nothing for an empty signature', () => {
    expect(strokesToPngDataUrl([])).toBeNull();
  });

  it('encodes a valid 1-bit PNG with the strokes inked', () => {
    const url = strokesToPngDataUrl(
      [
        [
          { x: 10, y: 10 },
          { x: 60, y: 30 },
        ],
        [{ x: 30, y: 40 }],
      ],
      { scale: 1, padding: 4 }
    );
    expect(url?.startsWith('data:image/png;base64,')).toBe(true);
    const png = decode(url as string);
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const width = readUint32(png, 16);
    const height = readUint32(png, 20);
    expect([width, height]).toEqual([58, 38]);

    const idatAt = indexOfText(png, 'IDAT');
    const idat = png.subarray(idatAt + 4, idatAt + 4 + readUint32(png, idatAt - 4));
    const raw = inflateSync(idat);
    const rowBytes = Math.ceil(width / 8);
    expect(raw.length).toBe(height * (rowBytes + 1));
    const inked = (x: number, y: number) =>
      (raw[y * (rowBytes + 1) + 1 + (x >> 3)] & (0x80 >> (x & 7))) === 0;
    expect(inked(4, 4)).toBe(true);
    expect(inked(24, 34)).toBe(true);
    expect(inked(54, 4)).toBe(false);
  });
});

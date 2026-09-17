/**
 * Client-Side EXIF Metadata Engine & Camera Profile Spoofer
 * Generates and injects standard TIFF/JPEG APP1 EXIF binary segments into JPEG images.
 * Provides realistic camera hardware profiles to prevent "Empty Metadata = AI Generated" flagging.
 */

export type CameraProfileKey = "none" | "sony-a7iv" | "canon-r5" | "fujifilm-xt5" | "iphone-15pro";

export interface CameraProfile {
  id: CameraProfileKey;
  name: string;
  badge: string;
  make: string;
  model: string;
  software: string;
  lensModel: string;
  focalLength: [number, number]; // [numerator, denominator] e.g. [50, 1] -> 50mm
  fNumber: [number, number];     // e.g. [28, 10] -> f/2.8
  exposureTime: [number, number];// e.g. [1, 250] -> 1/250s
  iso: number;
}

export const CAMERA_PROFILES: Record<CameraProfileKey, CameraProfile> = {
  "none": {
    id: "none",
    name: "Xóa sạch hoàn toàn (Không EXIF)",
    badge: "Raw Canvas",
    make: "",
    model: "",
    software: "",
    lensModel: "",
    focalLength: [50, 1],
    fNumber: [28, 10],
    exposureTime: [1, 250],
    iso: 100,
  },
  "sony-a7iv": {
    id: "sony-a7iv",
    name: "Sony A7 IV (Chuyên nghiệp)",
    badge: "Sony Alpha",
    make: "SONY",
    model: "ILCE-7M4",
    software: "ILCE-7M4 v2.01",
    lensModel: "FE 24-70mm F2.8 GM II",
    focalLength: [35, 1],
    fNumber: [28, 10], // f/2.8
    exposureTime: [1, 250], // 1/250s
    iso: 100,
  },
  "canon-r5": {
    id: "canon-r5",
    name: "Canon EOS R5 (Chân dung/Studio)",
    badge: "Canon EOS",
    make: "Canon",
    model: "Canon EOS R5",
    software: "Firmware Version 1.9.0",
    lensModel: "RF50mm F1.2 L USM",
    focalLength: [50, 1],
    fNumber: [14, 10], // f/1.4
    exposureTime: [1, 400], // 1/400s
    iso: 100,
  },
  "fujifilm-xt5": {
    id: "fujifilm-xt5",
    name: "Fujifilm X-T5 (Màu phim nghệ thuật)",
    badge: "Fujifilm",
    make: "FUJIFILM",
    model: "X-T5",
    software: "Digital Camera X-T5 Ver.2.10",
    lensModel: "XF35mmF1.4 R",
    focalLength: [35, 1],
    fNumber: [20, 10], // f/2.0
    exposureTime: [1, 500], // 1/500s
    iso: 160,
  },
  "iphone-15pro": {
    id: "iphone-15pro",
    name: "iPhone 15 Pro Max (Đời thường)",
    badge: "Apple iOS",
    make: "Apple",
    model: "iPhone 15 Pro Max",
    software: "17.5.1",
    lensModel: "iPhone 15 Pro Max back camera 6.78mm f/1.78",
    focalLength: [24, 1],
    fNumber: [178, 100], // f/1.78
    exposureTime: [1, 320], // 1/320s
    iso: 64,
  },
};

/**
 * Formats a Date object into standard EXIF date format: "YYYY:MM:DD HH:MM:SS"
 */
function formatExifDate(d: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const date = pad(d.getDate());
  const hours = pad(d.getHours());
  const mins = pad(d.getMinutes());
  const secs = pad(d.getSeconds());
  return `${year}:${month}:${date} ${hours}:${mins}:${secs}`;
}

/**
 * Generates a realistic recent capture timestamp (e.g. within the last 1-14 days)
 */
function getRealisticCaptureDate(): string {
  const now = Date.now();
  // Random offset between 6 hours and 10 days in the past
  const offsetMs = Math.floor(Math.random() * (10 * 86400 * 1000 - 6 * 3600 * 1000)) + 6 * 3600 * 1000;
  return formatExifDate(new Date(now - offsetMs));
}

/**
 * Builds a valid JPEG APP1 EXIF segment Uint8Array with Little-Endian (II) byte order
 */
export function buildExifBinary(profile: CameraProfile, width: number = 1920, height: number = 1080): Uint8Array {
  const captureDate = getRealisticCaptureDate();

  // Helper buffer writer
  const buffer = new ArrayBuffer(4096);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  let offset = 0;

  // 1. JPEG APP1 Marker (0xFFE1) & Length placeholder
  view.setUint8(offset++, 0xFF);
  view.setUint8(offset++, 0xE1);
  const lengthOffset = offset;
  offset += 2; // will fill length later

  // 2. "Exif\0\0" Header (6 bytes)
  const exifHeader = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00];
  for (let i = 0; i < exifHeader.length; i++) {
    view.setUint8(offset++, exifHeader[i]);
  }

  // 3. TIFF Header
  const tiffStart = offset;
  // Byte order: "II" (Little Endian)
  view.setUint8(offset++, 0x49);
  view.setUint8(offset++, 0x49);
  // Fixed 42 (0x002A)
  view.setUint16(offset, 0x002A, true);
  offset += 2;
  // Offset to IFD0 (8 bytes from tiffStart)
  view.setUint32(offset, 8, true);
  offset += 4;

  // We will place Extra Data (Strings & Rationals) after the IFD entries
  // To compute proper offsets, we pre-calculate tags
  const stringToAsciiNull = (str: string): number[] => {
    const arr: number[] = [];
    for (let i = 0; i < str.length; i++) arr.push(str.charCodeAt(i));
    arr.push(0x00);
    return arr;
  };

  const makeBytes = stringToAsciiNull(profile.make);
  const modelBytes = stringToAsciiNull(profile.model);
  const softwareBytes = stringToAsciiNull(profile.software);
  const dateBytes = stringToAsciiNull(captureDate);
  const lensBytes = stringToAsciiNull(profile.lensModel);

  // IFD0 Entries count: 8 entries
  const ifd0EntryCount = 8;
  view.setUint16(offset, ifd0EntryCount, true);
  offset += 2;

  const ifd0EntriesStart = offset;
  // Each entry is 12 bytes
  offset += ifd0EntryCount * 12;

  // Offset to next IFD (0 means no IFD1)
  view.setUint32(offset, 0, true);
  offset += 4;

  // ExifSubIFD Start
  const subIfdStart = offset;
  // SubIFD Entries count: 9 entries
  const subIfdEntryCount = 9;
  view.setUint16(offset, subIfdEntryCount, true);
  offset += 2;

  const subIfdEntriesStart = offset;
  offset += subIfdEntryCount * 12;
  view.setUint32(offset, 0, true);
  offset += 4;

  // Extra data pool start (All offsets in IFDs are relative to tiffStart)
  let dataPoolOffset = offset;

  const writeData = (data: number[]): number => {
    const tiffRelativeOffset = dataPoolOffset - tiffStart;
    for (let i = 0; i < data.length; i++) {
      view.setUint8(dataPoolOffset++, data[i]);
    }
    return tiffRelativeOffset;
  };

  const writeRational = (num: number, den: number): number => {
    const tiffRelativeOffset = dataPoolOffset - tiffStart;
    view.setUint32(dataPoolOffset, num, true);
    dataPoolOffset += 4;
    view.setUint32(dataPoolOffset, den, true);
    dataPoolOffset += 4;
    return tiffRelativeOffset;
  };

  // Write Strings to Data Pool
  const makeOffset = writeData(makeBytes);
  const modelOffset = writeData(modelBytes);
  const softwareOffset = writeData(softwareBytes);
  const dateOffset = writeData(dateBytes);
  const lensOffset = writeData(lensBytes);

  // Write Rationals to Data Pool
  const xResOffset = writeRational(350, 1);
  const yResOffset = writeRational(350, 1);
  const expTimeOffset = writeRational(profile.exposureTime[0], profile.exposureTime[1]);
  const fNumOffset = writeRational(profile.fNumber[0], profile.fNumber[1]);
  const focalOffset = writeRational(profile.focalLength[0], profile.focalLength[1]);

  // Now populate IFD0 Entries (12 bytes each)
  let entryPtr = ifd0EntriesStart;
  const writeEntry = (tag: number, type: number, count: number, valueOrOffset: number) => {
    view.setUint16(entryPtr, tag, true);
    view.setUint16(entryPtr + 2, type, true);
    view.setUint32(entryPtr + 4, count, true);
    view.setUint32(entryPtr + 8, valueOrOffset, true);
    entryPtr += 12;
  };

  // IFD0 Tags (Sorted by Tag ID as per TIFF spec):
  // 0x010F: Make (ASCII)
  writeEntry(0x010F, 2, makeBytes.length, makeOffset);
  // 0x0110: Model (ASCII)
  writeEntry(0x0110, 2, modelBytes.length, modelOffset);
  // 0x0112: Orientation (SHORT) = 1 (Normal)
  writeEntry(0x0112, 3, 1, 1);
  // 0x011A: XResolution (RATIONAL) = 350
  writeEntry(0x011A, 5, 1, xResOffset);
  // 0x011B: YResolution (RATIONAL) = 350
  writeEntry(0x011B, 5, 1, yResOffset);
  // 0x0128: ResolutionUnit (SHORT) = 2 (Inches)
  writeEntry(0x0128, 3, 1, 2);
  // 0x0131: Software (ASCII)
  writeEntry(0x0131, 2, softwareBytes.length, softwareOffset);
  // 0x8769: ExifIFDPointer (LONG)
  writeEntry(0x8769, 4, 1, subIfdStart - tiffStart);

  // SubIFD Entries (Sorted by Tag ID):
  entryPtr = subIfdEntriesStart;
  // 0x829A: ExposureTime (RATIONAL)
  writeEntry(0x829A, 5, 1, expTimeOffset);
  // 0x829D: FNumber (RATIONAL)
  writeEntry(0x829D, 5, 1, fNumOffset);
  // 0x8827: PhotographicSensitivity / ISO (SHORT)
  writeEntry(0x8827, 3, 1, profile.iso);
  // 0x9003: DateTimeOriginal (ASCII)
  writeEntry(0x9003, 2, dateBytes.length, dateOffset);
  // 0x9004: DateTimeDigitized (ASCII)
  writeEntry(0x9004, 2, dateBytes.length, dateOffset);
  // 0x920A: FocalLength (RATIONAL)
  writeEntry(0x920A, 5, 1, focalOffset);
  // 0xA001: ColorSpace (SHORT) = 1 (sRGB)
  writeEntry(0xA001, 3, 1, 1);
  // 0xA002: PixelXDimension (LONG)
  writeEntry(0xA002, 4, 1, width);
  // 0xA003: PixelYDimension (LONG)
  writeEntry(0xA003, 4, 1, height);

  // Set total APP1 length (total bytes from lengthOffset, excluding marker 0xFFE1 itself)
  const app1Length = dataPoolOffset - lengthOffset;
  view.setUint16(lengthOffset, app1Length, false); // JPEG markers use Big-Endian length

  return bytes.slice(0, dataPoolOffset);
}

/**
 * Injects a generated APP1 EXIF segment into a JPEG Blob.
 * If the JPEG already has an APP0/JFIF or existing metadata, this cleanly places APP1 right after SOI.
 */
export async function injectExifToJpegBlob(
  jpegBlob: Blob,
  profileKey: CameraProfileKey,
  width?: number,
  height?: number
): Promise<Blob> {
  if (profileKey === "none" || !CAMERA_PROFILES[profileKey]) {
    return jpegBlob;
  }

  const profile = CAMERA_PROFILES[profileKey];
  const arrayBuffer = await jpegBlob.arrayBuffer();
  const inputBytes = new Uint8Array(arrayBuffer);

  // Verify JPEG SOI marker (0xFF 0xD8)
  if (inputBytes[0] !== 0xFF || inputBytes[1] !== 0xD8) {
    return jpegBlob; // Not a valid JPEG, return as is
  }

  const exifBytes = buildExifBinary(profile, width || 1920, height || 1080);

  // Scan for existing APP0/APP1 markers to replace or insert cleanly after SOI
  let insertPos = 2;

  // Create combined buffer: SOI (2 bytes) + Exif APP1 + Rest of JPEG
  const totalLength = inputBytes.length + exifBytes.length;
  const outputBytes = new Uint8Array(totalLength);

  // 1. Write SOI (0xFF 0xD8)
  outputBytes[0] = 0xFF;
  outputBytes[1] = 0xD8;

  // 2. Write APP1 EXIF segment
  outputBytes.set(exifBytes, 2);

  // 3. Write remaining original JPEG stream
  outputBytes.set(inputBytes.subarray(insertPos), 2 + exifBytes.length);

  return new Blob([outputBytes], { type: "image/jpeg" });
}

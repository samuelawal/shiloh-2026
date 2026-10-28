"use client";

import { QRCodeSVG } from "qrcode.react";

export function PassQrCode({ value }: { value: string }) {
  return <QRCodeSVG value={value} size={148} level="M" marginSize={0} fgColor="#07122e" />;
}

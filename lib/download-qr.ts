/** Generate and download a PNG QR code for a URL (client-side). */
export async function downloadQrPng(url: string, filename: string) {
  const QRCode = (await import("qrcode")).default;
  const dataUrl = await QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

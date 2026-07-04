"use client";
import { Copy, Share2, QrCode } from "lucide-react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export function ShareBar({ url, titulo }: { url: string; titulo: string }) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const copiar = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const wpp = `https://wa.me/?text=${encodeURIComponent(`${titulo}\n${url}`)}`;

  return (
    <div className="card-p flex flex-wrap items-center gap-2">
      <a
        href={wpp}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-2 bg-brand-green hover:bg-brand-green-dark transition text-black font-semibold text-sm px-4 py-2 rounded-lg"
      >
        <Share2 className="w-4 h-4" /> WhatsApp
      </a>
      <button
        onClick={copiar}
        className="inline-flex items-center gap-2 bg-bg-soft hover:bg-bg-border transition text-sm px-4 py-2 rounded-lg"
      >
        <Copy className="w-4 h-4" /> {copied ? "Copiado!" : "Copiar link"}
      </button>
      <button
        onClick={() => setShowQR((v) => !v)}
        className="inline-flex items-center gap-2 bg-bg-soft hover:bg-bg-border transition text-sm px-4 py-2 rounded-lg"
      >
        <QrCode className="w-4 h-4" /> QR Code
      </button>
      {showQR && (
        <div className="w-full mt-3 flex justify-center">
          <div className="bg-white p-3 rounded-xl">
            <QRCodeSVG value={url} size={180} />
          </div>
        </div>
      )}
    </div>
  );
}

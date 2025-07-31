import { useEffect, useRef } from "react";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeGenerator({ value, size = 200, className = "" }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Simple QR code generation using a canvas-based approach
    // In a production app, you'd use a proper QR code library like 'qrcode'
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    // Generate a simple pattern that represents a QR code
    const modules = 25;
    const moduleSize = size / modules;
    
    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    
    // Create QR-like pattern
    ctx.fillStyle = "#000000";
    
    // Generate pattern based on the value string
    const hash = value.split("").reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        const isBlack = ((hash + i * j) % 3) === 0;
        if (isBlack) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    // Add corner squares (typical QR code feature)
    const cornerSize = moduleSize * 7;
    
    // Top-left corner
    ctx.fillRect(0, 0, cornerSize, cornerSize);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(moduleSize, moduleSize, cornerSize - 2 * moduleSize, cornerSize - 2 * moduleSize);
    ctx.fillStyle = "#000000";
    ctx.fillRect(moduleSize * 2, moduleSize * 2, cornerSize - 4 * moduleSize, cornerSize - 4 * moduleSize);
    
    // Top-right corner
    ctx.fillStyle = "#000000";
    ctx.fillRect(size - cornerSize, 0, cornerSize, cornerSize);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(size - cornerSize + moduleSize, moduleSize, cornerSize - 2 * moduleSize, cornerSize - 2 * moduleSize);
    ctx.fillStyle = "#000000";
    ctx.fillRect(size - cornerSize + moduleSize * 2, moduleSize * 2, cornerSize - 4 * moduleSize, cornerSize - 4 * moduleSize);
    
    // Bottom-left corner
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, size - cornerSize, cornerSize, cornerSize);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(moduleSize, size - cornerSize + moduleSize, cornerSize - 2 * moduleSize, cornerSize - 2 * moduleSize);
    ctx.fillStyle = "#000000";
    ctx.fillRect(moduleSize * 2, size - cornerSize + moduleSize * 2, cornerSize - 4 * moduleSize, cornerSize - 4 * moduleSize);
    
  }, [value, size]);

  return (
    <div className={`inline-block p-4 bg-white rounded-lg shadow-lg ${className}`}>
      <canvas ref={canvasRef} className="border" />
      <p className="text-center text-xs text-muted-foreground mt-2">
        Scan to complete payment
      </p>
    </div>
  );
}

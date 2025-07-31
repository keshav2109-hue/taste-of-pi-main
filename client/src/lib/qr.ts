export interface QRCodeOptions {
  size?: number;
  errorCorrectionLevel?: 'low' | 'medium' | 'quartile' | 'high';
  type?: 'image/png' | 'image/jpeg' | 'image/svg+xml';
  quality?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generate a QR code data URL for a given value
 * This is a simplified implementation. In production, use a proper QR code library like 'qrcode'
 */
export const generateQRCode = (
  value: string, 
  options: QRCodeOptions = {}
): Promise<string> => {
  return new Promise((resolve) => {
    const {
      size = 200,
      color = { dark: '#000000', light: '#ffffff' }
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      resolve('');
      return;
    }

    canvas.width = size;
    canvas.height = size;

    // Generate a simple pattern that represents a QR code
    const modules = 25;
    const moduleSize = size / modules;
    
    // Clear canvas with light color
    ctx.fillStyle = color.light!;
    ctx.fillRect(0, 0, size, size);
    
    // Create QR-like pattern based on the value string
    ctx.fillStyle = color.dark!;
    
    // Generate pattern based on hash of the value
    const hash = value.split("").reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Generate modules
    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        const isBlack = ((hash + i * j + i + j) % 3) === 0;
        if (isBlack) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    // Add corner squares (typical QR code feature)
    const cornerSize = moduleSize * 7;
    
    // Top-left corner
    ctx.fillRect(0, 0, cornerSize, cornerSize);
    ctx.fillStyle = color.light!;
    ctx.fillRect(moduleSize, moduleSize, cornerSize - 2 * moduleSize, cornerSize - 2 * moduleSize);
    ctx.fillStyle = color.dark!;
    ctx.fillRect(moduleSize * 2, moduleSize * 2, cornerSize - 4 * moduleSize, cornerSize - 4 * moduleSize);
    
    // Top-right corner
    ctx.fillRect(size - cornerSize, 0, cornerSize, cornerSize);
    ctx.fillStyle = color.light!;
    ctx.fillRect(size - cornerSize + moduleSize, moduleSize, cornerSize - 2 * moduleSize, cornerSize - 2 * moduleSize);
    ctx.fillStyle = color.dark!;
    ctx.fillRect(size - cornerSize + moduleSize * 2, moduleSize * 2, cornerSize - 4 * moduleSize, cornerSize - 4 * moduleSize);
    
    // Bottom-left corner
    ctx.fillRect(0, size - cornerSize, cornerSize, cornerSize);
    ctx.fillStyle = color.light!;
    ctx.fillRect(moduleSize, size - cornerSize + moduleSize, cornerSize - 2 * moduleSize, cornerSize - 2 * moduleSize);
    ctx.fillStyle = color.dark!;
    ctx.fillRect(moduleSize * 2, size - cornerSize + moduleSize * 2, cornerSize - 4 * moduleSize, cornerSize - 4 * moduleSize);
    
    // Convert to data URL
    resolve(canvas.toDataURL('image/png'));
  });
};

/**
 * Generate UPI payment QR code data
 */
export const generateUPIQRData = (params: {
  pa: string; // Payment address
  pn: string; // Payee name
  am: string; // Amount
  cu?: string; // Currency (default: INR)
  tn?: string; // Transaction note
}): string => {
  const { pa, pn, am, cu = 'INR', tn } = params;
  
  const upiUrl = new URL('upi://pay');
  upiUrl.searchParams.set('pa', pa);
  upiUrl.searchParams.set('pn', pn);
  upiUrl.searchParams.set('am', am);
  upiUrl.searchParams.set('cu', cu);
  
  if (tn) {
    upiUrl.searchParams.set('tn', tn);
  }
  
  return upiUrl.toString();
};

/**
 * Validate QR code data
 */
export const validateQRData = (data: string): boolean => {
  try {
    // Check if it's a valid URL or UPI string
    if (data.startsWith('upi://')) {
      return true;
    }
    
    new URL(data);
    return true;
  } catch {
    // Not a URL, check if it's valid text
    return data.length > 0 && data.length <= 2953; // QR code text limit
  }
};

/**
 * Get QR code size based on data length
 */
export const getOptimalQRSize = (data: string): number => {
  const length = data.length;
  
  if (length <= 25) return 150;
  if (length <= 50) return 200;
  if (length <= 100) return 250;
  if (length <= 200) return 300;
  
  return 350;
};

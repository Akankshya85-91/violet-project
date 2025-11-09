import Tesseract from 'tesseract.js';

// Preprocess image for better OCR accuracy
async function preprocessImage(imageFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Increase contrast and convert to grayscale
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        
        // Increase contrast
        const contrast = 1.5;
        let adjusted = ((avg - 128) * contrast) + 128;
        
        // Clamp values
        adjusted = Math.max(0, Math.min(255, adjusted));
        
        data[i] = adjusted;     // Red
        data[i + 1] = adjusted; // Green
        data[i + 2] = adjusted; // Blue
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(imageFile);
  });
}

export async function extractTextFromImage(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // Preprocess image for better OCR
    const preprocessedImage = await preprocessImage(imageFile);
    
    const result = await Tesseract.recognize(
      preprocessedImage,
      'eng+hin+mar+ara+spa+fra+deu+ita+por+rus+jpn+kor+chi_sim',
      {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(Math.round(m.progress * 100));
          }
        },
      }
    );
    
    // Clean up and return text with better formatting
    let text = result.data.text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
    
    if (!text) {
      throw new Error('No text detected in image');
    }
    
    return text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Failed to extract text from image. Please try a clearer image with better lighting.');
  }
}

export async function detectImageLanguage(imageFile: File): Promise<string> {
  try {
    const result = await Tesseract.detect(imageFile);
    return result.data.best?.lang || 'eng';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'eng';
  }
}

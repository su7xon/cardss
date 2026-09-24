const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dsl047raw';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
const UPLOAD_TIMEOUT = 30000; // 30 seconds
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PDF_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const createTimeoutPromise = (ms: number): Promise<never> => 
  new Promise((_, reject) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      reject(new Error(`Upload timeout after ${ms}ms`));
    }, ms);
  });

export const uploadImage = async (file: File): Promise<string> => {
  console.log(`[Cloudinary] Starting image upload: ${file.name}`);
  
  // Validate file before upload
  if (!file) {
    const err = 'No file selected';
    console.error(`[Cloudinary] ${err}`);
    throw new Error(err);
  }

  if (file.size > MAX_FILE_SIZE) {
    const err = `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds 5MB limit`;
    console.error(`[Cloudinary] ${err}`);
    throw new Error(err);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    const err = `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF`;
    console.error(`[Cloudinary] ${err}`);
    throw new Error(err);
  }

  if (!CLOUDINARY_CLOUD_NAME) {
    const err = 'Cloudinary cloud name missing';
    console.error(`[Cloudinary] ${err}`);
    throw new Error(err);
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    const err = 'Cloudinary upload preset missing (VITE_CLOUDINARY_UPLOAD_PRESET)';
    console.error(`[Cloudinary] ${err}`);
    throw new Error(err);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    console.log(`[Cloudinary] File validated: ${(file.size / 1024).toFixed(2)}KB`);
    console.log(`[Cloudinary] Uploading to cloud: ${CLOUDINARY_CLOUD_NAME}`);
    
    const response = await Promise.race([
      fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      }),
      createTimeoutPromise(UPLOAD_TIMEOUT)
    ]);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
      console.error(`[Cloudinary] Upload error: ${response.status}`, errorData);

      if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('upload preset not found')) {
        throw new Error(`Upload preset not found: "${CLOUDINARY_UPLOAD_PRESET}". Create an unsigned preset in Cloudinary and set the same name in .env`);
      }

      throw new Error(`Upload failed: ${errorMsg}`);
    }

    const data = await response.json();
    const imageUrl = data.secure_url || data.url;
    
    if (!imageUrl) {
      console.error(`[Cloudinary] No URL in response:`, data);
      throw new Error('No image URL returned from Cloudinary');
    }

    console.log(`[Cloudinary] ✅ Upload successful:`, imageUrl);
    return imageUrl;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Cloudinary] ❌ Upload error:`, errorMsg);
    
    if (errorMsg.includes('timeout')) {
      throw new Error('Upload took too long. Please try again.');
    }
    throw new Error(`Image upload failed: ${errorMsg}`);
  }
};

export const uploadPdf = async (file: File): Promise<string> => {
  if (!file) throw new Error('No PDF selected');
  if (file.size > MAX_PDF_FILE_SIZE) {
    throw new Error(`PDF size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds 50MB limit`);
  }
  if (file.type !== 'application/pdf') {
    throw new Error('Invalid file type. Please upload a PDF file.');
  }
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary cloud name missing');
  }
  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary upload preset missing (VITE_CLOUDINARY_UPLOAD_PRESET)');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await Promise.race([
    fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`, {
      method: 'POST',
      body: formData
    }),
    createTimeoutPromise(UPLOAD_TIMEOUT)
  ]);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
    throw new Error(`PDF upload failed: ${errorMsg}`);
  }

  const data = await response.json();
  const pdfUrl = data.secure_url || data.url;
  if (!pdfUrl) throw new Error('No PDF URL returned from Cloudinary');
  return pdfUrl;
};

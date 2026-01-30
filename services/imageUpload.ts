// Free image upload using ImgBB API
// Get your free API key from: https://api.imgbb.com/

const IMGBB_API_KEY = 'cfbd883aa25ac914efa79a2395b76175';

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('ImgBB Upload Error:', errorBody);
    throw new Error(`Failed to upload image: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'ImgBB upload failed');
  }
  return data.data.url;
};

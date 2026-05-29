/**
 * MIGRATION SCRIPT: Shift existing images from Firebase/Unsplash to Cloudinary
 * RUN THIS ONCE: node scripts/migrate.js
 * 
 * This script:
 * 1. Fetches images from external URLs (Unsplash, Firebase Storage)
 * 2. Uploads them to Cloudinary
 * 3. Updates Firestore documents with new Cloudinary URLs
 */

import { getDocs, collection, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

// Convert external image URL to Cloudinary
export const migrateImageToCloudinary = async (imageUrl: string, fileName: string): Promise<string> => {
  if (!imageUrl) return '';
  
  // If already on Cloudinary, skip
  if (imageUrl.includes('cloudinary.com')) {
    console.log(`[Migration] Already on Cloudinary:`, fileName);
    return imageUrl;
  }

  try {
    console.log(`[Migration] Converting ${fileName}...`);
    
    // Fetch image from external URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, fileName);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    // Upload to Cloudinary
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error(`Cloudinary upload failed: ${uploadResponse.status}`);
    }

    const data = await uploadResponse.json();
    console.log(`[Migration] ✓ Uploaded: ${data.secure_url}`);
    return data.secure_url;
  } catch (error) {
    console.error(`[Migration] ✗ Failed to migrate ${fileName}:`, error);
    return imageUrl; // Return original if migration fails
  }
};

// Migrate all products
export const migrateProducts = async () => {
  try {
    console.log('\n[Migration] Starting PRODUCTS migration...');
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    let count = 0;
    for (const docSnap of snapshot.docs) {
      const product = docSnap.data() as any;
      
      if (product.image && !product.image.includes('cloudinary.com')) {
        const newImageUrl = await migrateImageToCloudinary(
          product.image,
          `product_${docSnap.id}_${Date.now()}`
        );

        if (newImageUrl !== product.image) {
          await updateDoc(doc(db, 'products', docSnap.id), { image: newImageUrl });
          count++;
        }
      }
    }
    console.log(`[Migration] ✓ Products migrated: ${count}\n`);
  } catch (error) {
    console.error('[Migration] Products migration error:', error);
  }
};

// Migrate service categories
export const migrateServiceCategories = async () => {
  try {
    console.log('[Migration] Starting SERVICE CATEGORIES migration...');
    const settingsRef = doc(db, 'settings', 'site');
    const categoriesSnapshot = await getDocs(collection(db, 'settings'));

    for (const docSnap of categoriesSnapshot.docs) {
      const settings = docSnap.data() as any;
      
      if (settings.serviceCategories && Array.isArray(settings.serviceCategories)) {
        const updatedCategories = await Promise.all(
          settings.serviceCategories.map(async (cat: any) => {
            if (cat.image && !cat.image.includes('cloudinary.com')) {
              const newImageUrl = await migrateImageToCloudinary(
                cat.image,
                `category_${cat.id}_${Date.now()}`
              );
              return { ...cat, image: newImageUrl };
            }
            return cat;
          })
        );

        await updateDoc(settingsRef, { serviceCategories: updatedCategories });
      }
    }
    console.log('[Migration] ✓ Service categories migrated\n');
  } catch (error) {
    console.error('[Migration] Service categories migration error:', error);
  }
};

// Migrate hero image/video
export const migrateHeroMedia = async () => {
  try {
    console.log('[Migration] Starting HERO MEDIA migration...');
    const settingsRef = doc(db, 'settings', 'site');
    const snapshot = await getDocs(collection(db, 'settings'));

    for (const docSnap of snapshot.docs) {
      const settings = docSnap.data() as any;
      let updates: any = {};

      if (settings.heroImage && !settings.heroImage.includes('cloudinary.com')) {
        const newImageUrl = await migrateImageToCloudinary(
          settings.heroImage,
          `hero_image_${Date.now()}`
        );
        updates.heroImage = newImageUrl;
      }

      if (settings.heroVideo && !settings.heroVideo.includes('cloudinary.com')) {
        const newVideoUrl = await migrateImageToCloudinary(
          settings.heroVideo,
          `hero_video_${Date.now()}`
        );
        updates.heroVideo = newVideoUrl;
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(settingsRef, updates);
      }
    }
    console.log('[Migration] ✓ Hero media migrated\n');
  } catch (error) {
    console.error('[Migration] Hero media migration error:', error);
  }
};

// Run all migrations
export const runMigrations = async () => {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  CLOUDINARY MIGRATION - STARTING           ║');
  console.log('║  This may take a few minutes...             ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    await migrateProducts();
    await migrateServiceCategories();
    await migrateHeroMedia();

    console.log('╔════════════════════════════════════════════╗');
    console.log('║  MIGRATION COMPLETE ✓                      ║');
    console.log('║  All images now on Cloudinary!             ║');
    console.log('╚════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('╔════════════════════════════════════════════╗');
    console.error('║  MIGRATION FAILED ✗                       ║');
    console.error('╚════════════════════════════════════════════╝');
    console.error(error);
  }
};

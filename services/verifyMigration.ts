/**
 * Verification Script - Check if images are in Cloudinary
 * Run this in browser console or call via admin dashboard
 */

import { getDocs, collection, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export const verifyCloudinaryMigration = async () => {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  CLOUDINARY MIGRATION VERIFICATION        ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Check Products
    console.log('📦 PRODUCTS:');
    const productsRef = collection(db, 'products');
    const productsSnap = await getDocs(productsRef);
    
    let cloudinaryProducts = 0;
    let unsplashProducts = 0;
    let firebaseProducts = 0;

    productsSnap.forEach(doc => {
      const product = doc.data() as any;
      if (product.image) {
        if (product.image.includes('cloudinary.com')) {
          cloudinaryProducts++;
          console.log(`  ✅ ${product.name}: Cloudinary`);
        } else if (product.image.includes('unsplash')) {
          unsplashProducts++;
          console.log(`  ❌ ${product.name}: Still on Unsplash`);
        } else if (product.image.includes('firebasestorage')) {
          firebaseProducts++;
          console.log(`  ❌ ${product.name}: Still on Firebase`);
        } else {
          console.log(`  ⚠️ ${product.name}: Unknown source`);
        }
      }
    });

    console.log(`\n  Total Products: ${productsSnap.size}`);
    console.log(`    ✅ On Cloudinary: ${cloudinaryProducts}`);
    console.log(`    ❌ Still on Unsplash: ${unsplashProducts}`);
    console.log(`    ❌ Still on Firebase: ${firebaseProducts}`);

    // Check Service Categories
    console.log('\n🏷️  SERVICE CATEGORIES:');
    const settingsRef = doc(db, 'settings', 'site');
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      const settings = settingsSnap.data() as any;
      
      if (settings.serviceCategories && Array.isArray(settings.serviceCategories)) {
        let cloudinaryCats = 0;
        let otherCats = 0;
        
        settings.serviceCategories.forEach((cat: any) => {
          if (cat.image) {
            if (cat.image.includes('cloudinary.com')) {
              cloudinaryCats++;
              console.log(`  ✅ ${cat.name}: Cloudinary`);
            } else {
              otherCats++;
              console.log(`  ❌ ${cat.name}: Not migrated - ${new URL(cat.image).hostname}`);
            }
          } else {
            console.log(`  ⚠️ ${cat.name}: No image`);
          }
        });
        console.log(`\n  Total Categories: ${settings.serviceCategories.length}`);
        console.log(`    ✅ On Cloudinary: ${cloudinaryCats}`);
        console.log(`    ❌ Not migrated: ${otherCats}`);
      }

      // Check Hero Media
      console.log('\n🎬 HERO MEDIA:');
      if (settings.heroImage) {
        if (settings.heroImage.includes('cloudinary.com')) {
          console.log(`  ✅ Hero Image: Cloudinary`);
        } else {
          console.log(`  ❌ Hero Image: ${new URL(settings.heroImage).hostname}`);
        }
      }
      if (settings.heroVideo) {
        if (settings.heroVideo.includes('cloudinary.com')) {
          console.log(`  ✅ Hero Video: Cloudinary`);
        } else {
          console.log(`  ❌ Hero Video: ${new URL(settings.heroVideo).hostname}`);
        }
      }
    }

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║  SUMMARY                                   ║');
    console.log('╠════════════════════════════════════════════╣');
    const totalImages = cloudinaryProducts + (productsSnap.size > 0 ? productsSnap.size : 0);
    console.log(`║  Images migrated: ${cloudinaryProducts + Math.max(0, (settingsSnap.data() as any)?.serviceCategories?.filter((c: any) => c.image?.includes('cloudinary.com')).length || 0)}`);
    console.log('║  Status: ' + (unsplashProducts === 0 && firebaseProducts === 0 ? '✅ ALL MIGRATED' : '⚠️ INCOMPLETE'));
    console.log('╚════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('Verification error:', error);
  }
};

/**
 * Migration Helper for Admin Panel
 * Exposes migration functions for direct invocation
 */

import { runMigrations } from './migrateToCloudinary';

export const startImageMigration = async (onProgress?: (message: string) => void) => {
  try {
    const log = (msg: string) => {
      console.log(msg);
      onProgress?.(msg);
    };

    log('🔄 Starting image migration to Cloudinary...');
    log('This process will:');
    log('  1. Fetch existing images from Firebase/external URLs');
    log('  2. Upload them to Cloudinary');
    log('  3. Update database with new URLs');
    log('');

    await runMigrations();
    
    log('✅ Migration complete! All images are now on Cloudinary.');
    return { success: true, message: 'Migration completed successfully' };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log(`❌ Migration failed: ${errorMsg}`);
    return { success: false, message: errorMsg };
  }
};

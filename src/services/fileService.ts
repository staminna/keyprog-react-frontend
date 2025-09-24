import { directus } from '@/lib/directus';
import { UploadService } from './uploadService';

export interface FileServiceData {
  name: string;
  email: string;
  message: string;
  file: File;
}

export class FileService {
  static async submitRequest(data: FileServiceData): Promise<void> {
    try {
      // 1. Upload the file to Directus
      const uploadedFile = await UploadService.uploadFile(
        data.file,
        'c98ee980-6f68-4db1-b734-f57ff3abe4b1' // Specific folder for file service uploads
      );

      // 2. Trigger a Directus Flow to send an email
      await directus.request(
        ('flows/trigger/your_flow_id_here' as any), {
          method: 'POST',
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            message: data.message,
            fileId: uploadedFile.id,
          }),
        }
      );

    } catch (error) {
      console.error('File service request failed:', error);
      throw error;
    }
  }
}

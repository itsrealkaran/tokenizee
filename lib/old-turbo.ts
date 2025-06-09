import { ArweaveSigner, TurboFactory } from '@ardrive/turbo-sdk';
import fs from 'fs';
import path from 'path';

interface UploadProgress {
  totalBytes: number;
  processedBytes: number;
  step?: string;
}

interface UploadEvents {
  onProgress?: (progress: UploadProgress) => void;
  onError?: (error: Error) => void;
  onSigningProgress?: (progress: { totalBytes: number; processedBytes: number }) => void;
  onSigningError?: (error: Error) => void;
  onSigningSuccess?: () => void;
  onUploadProgress?: (progress: { totalBytes: number; processedBytes: number }) => void;
  onUploadError?: (error: Error) => void;
  onUploadSuccess?: () => void;
}

export class TurboUploader {
  private signer: ArweaveSigner;
  private turbo: ReturnType<typeof TurboFactory.authenticated>;

  constructor() {
    try {
      const jwkString = process.env.ARWEAVE_JWK;
      if (!jwkString) {
        throw new Error('ARWEAVE_JWK environment variable is not set');
      }
      const jwk = JSON.parse(jwkString);
      this.signer = new ArweaveSigner(jwk);
      this.turbo = TurboFactory.authenticated({ signer: this.signer });
    } catch (error) {
      throw new Error(`Failed to initialize TurboUploader: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadData(data: string, events?: UploadEvents) {
    try {
      return await this.turbo.upload({
        data,
        events: {
          onProgress: events?.onProgress,
          onError: events?.onError,
        },
      });
    } catch (error) {
      throw new Error(`Failed to upload data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadFile(filePath: string, events?: UploadEvents) {
    try {
      const absolutePath = path.resolve(filePath);
      const fileSize = fs.statSync(absolutePath).size;

      return await this.turbo.uploadFile({
        fileStreamFactory: () => fs.createReadStream(absolutePath),
        fileSizeFactory: () => fileSize,
        events: {
          onProgress: events?.onProgress,
          onError: events?.onError,
          onSigningProgress: events?.onSigningProgress,
          onSigningError: events?.onSigningError,
          onSigningSuccess: events?.onSigningSuccess,
          onUploadProgress: events?.onUploadProgress,
          onUploadError: events?.onUploadError,
          onUploadSuccess: events?.onUploadSuccess,
        },
      });
    } catch (error) {
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Example usage:
/*
const uploader = new TurboUploader();

// Upload data
const dataResult = await uploader.uploadData('Hello, world!', {
  onProgress: ({ totalBytes, processedBytes, step }) => {
    console.log('Progress:', { totalBytes, processedBytes, step });
  },
  onError: (error) => {
    console.error('Error:', error);
  },
});

// Upload file
const fileResult = await uploader.uploadFile('./my-image.png', {
  onProgress: ({ totalBytes, processedBytes, step }) => {
    console.log('Progress:', { totalBytes, processedBytes, step });
  },
  onUploadSuccess: () => {
    console.log('Upload completed successfully!');
  },
});
*/

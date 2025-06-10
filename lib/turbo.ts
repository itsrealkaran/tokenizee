'use server'

import { ArweaveSigner, TurboFactory } from '@ardrive/turbo-sdk';
import { createReadStream } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

if (!process.env.ARWEAVE_JWK) {
  throw new Error('ARWEAVE_JWK environment variable is not set');
}

// @ts-expect-error - JWK type from environment variable needs to be parsed without type checking
let jwk;
try {
  jwk = JSON.parse(process.env.ARWEAVE_JWK);
} catch (error) {
  console.log(error);
  throw new Error('Failed to parse ARWEAVE_JWK environment variable');
}

export async function uploadFileTurbo(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file) {
      throw new Error('No file provided');
    }

    // Write file to temp directory
    const tempPath = join(tmpdir(), file.name);
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(tempPath, Buffer.from(arrayBuffer));

    const turbo = TurboFactory.authenticated({ 
      // @ts-expect-error - ArweaveSigner expects a specific JWK type that we can't guarantee from env var
      signer: new ArweaveSigner(jwk)
    });

    const res = await turbo.uploadFile({
      fileStreamFactory: () => createReadStream(tempPath),
      fileSizeFactory: () => file.size,
      dataItemOpts: {
        tags: [
          { name: "App-Name", value: "Mekahuman" },
          { name: "Implements", value: "ANS-110" },
          { name: "Content-Type", value: file.type ?? "video/mp4" },
          { name: "Title", value: title ?? "unknown" },
          { name: "Description", value: description ?? "Test upload" },
        ],
      }
    });

    return { success: true, id: res.id };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
  }
} 
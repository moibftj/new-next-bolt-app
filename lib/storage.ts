import { supabase } from './supabase'

// Storage bucket configuration
export const STORAGE_BUCKET = 'documents' // Default bucket name
export const STORAGE_ENDPOINT = process.env.SUPABASE_STORAGE_ENDPOINT

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  path: string,
  bucket: string = STORAGE_BUCKET
): Promise<{ data: any; error: any }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    return { data, error }
  } catch (error) {
    console.error('Error uploading file:', error)
    return { data: null, error }
  }
}

/**
 * Download a file from Supabase Storage
 */
export async function downloadFile(
  path: string,
  bucket: string = STORAGE_BUCKET
): Promise<{ data: Blob | null; error: any }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)

    return { data, error }
  } catch (error) {
    console.error('Error downloading file:', error)
    return { data: null, error }
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(
  path: string,
  bucket: string = STORAGE_BUCKET
): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  path: string,
  bucket: string = STORAGE_BUCKET
): Promise<{ data: any; error: any }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path])

    return { data, error }
  } catch (error) {
    console.error('Error deleting file:', error)
    return { data: null, error }
  }
}

/**
 * List files in a directory
 */
export async function listFiles(
  path: string = '',
  bucket: string = STORAGE_BUCKET
): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit: 100,
        offset: 0
      })

    return { data, error }
  } catch (error) {
    console.error('Error listing files:', error)
    return { data: null, error }
  }
}
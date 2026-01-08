import { supabase } from '../lib/supabase'

export type StorageBucket = 'audio' | 'videos' | 'documents' | 'covers'

interface UploadResult {
  url: string
  path: string
}

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export const storageService = {
  /**
   * Upload a file to a specific bucket
   */
  async uploadFile(
    bucket: StorageBucket,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars
      .substring(0, 50) // Limit length
    const path = `${timestamp}_${sanitizedName}.${extension}`

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      url: urlData.publicUrl,
      path: data.path
    }
  },

  /**
   * Upload audio file (for episodes and chapters)
   */
  async uploadAudio(file: File, onProgress?: (progress: UploadProgress) => void): Promise<string> {
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/m4a']
    if (!validTypes.includes(file.type)) {
      throw new Error('Formato de audio no válido. Use MP3, WAV o M4A.')
    }
    const result = await this.uploadFile('audio', file, onProgress)
    return result.url
  },

  /**
   * Upload video file
   */
  async uploadVideo(file: File, onProgress?: (progress: UploadProgress) => void): Promise<string> {
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    if (!validTypes.includes(file.type)) {
      throw new Error('Formato de video no válido. Use MP4 o WebM.')
    }
    const result = await this.uploadFile('videos', file, onProgress)
    return result.url
  },

  /**
   * Upload PDF document
   */
  async uploadPDF(file: File, onProgress?: (progress: UploadProgress) => void): Promise<string> {
    if (file.type !== 'application/pdf') {
      throw new Error('El archivo debe ser un PDF.')
    }
    const result = await this.uploadFile('documents', file, onProgress)
    return result.url
  },

  /**
   * Upload cover image
   */
  async uploadCover(file: File, onProgress?: (progress: UploadProgress) => void): Promise<string> {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      throw new Error('Formato de imagen no válido. Use JPG, PNG o WebP.')
    }

    // Check file size (max 20MB for covers)
    if (file.size > 20 * 1024 * 1024) {
      throw new Error('La imagen no debe superar los 20MB.')
    }

    const result = await this.uploadFile('covers', file, onProgress)
    return result.url
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: StorageBucket, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
  },

  /**
   * Get file path from URL
   */
  getPathFromUrl(url: string, bucket: StorageBucket): string | null {
    const pattern = new RegExp(`/storage/v1/object/public/${bucket}/(.+)$`)
    const match = url.match(pattern)
    return match ? match[1] : null
  },

  /**
   * List files in a bucket
   */
  async listFiles(bucket: StorageBucket, folder?: string): Promise<string[]> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder || '', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) throw error
    return data.map(file => file.name)
  }
}

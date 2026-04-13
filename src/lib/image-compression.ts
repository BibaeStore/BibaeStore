/**
 * Client-side image compression utility.
 * Compresses images using canvas before uploading to reduce file size.
 */

export interface CompressOptions {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    type?: string
}

const DEFAULT_OPTIONS: CompressOptions = {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8,
    type: 'image/webp',
}

/**
 * Compresses an image file using canvas.
 * Returns a new File object with the compressed image data.
 */
export async function compressImage(
    file: File,
    options: CompressOptions = {}
): Promise<File> {
    const opts = { ...DEFAULT_OPTIONS, ...options }

    // If the file is already small (<100KB) or not an image, return as-is
    if (file.size < 100 * 1024 || !file.type.startsWith('image/')) {
        return file
    }

    return new Promise<File>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => {
            const img = new Image()
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas')
                    let { width, height } = img

                    // Scale down if needed while maintaining aspect ratio
                    if (width > (opts.maxWidth ?? 1920)) {
                        height = (height * (opts.maxWidth ?? 1920)) / width
                        width = opts.maxWidth ?? 1920
                    }
                    if (height > (opts.maxHeight ?? 1920)) {
                        width = (width * (opts.maxHeight ?? 1920)) / height
                        height = opts.maxHeight ?? 1920
                    }

                    canvas.width = width
                    canvas.height = height

                    const ctx = canvas.getContext('2d')
                    if (!ctx) {
                        resolve(file) // Fallback to original if canvas not supported
                        return
                    }

                    ctx.drawImage(img, 0, 0, width, height)

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                resolve(file)
                                return
                            }

                            // Only use compressed version if it's actually smaller
                            if (blob.size >= file.size) {
                                resolve(file)
                                return
                            }

                            const compressedFile = new File(
                                [blob],
                                file.name.replace(/\.[^.]+$/, '.webp'),
                                {
                                    type: opts.type ?? 'image/webp',
                                    lastModified: Date.now(),
                                }
                            )
                            resolve(compressedFile)
                        },
                        opts.type,
                        opts.quality
                    )
                } catch {
                    resolve(file) // Fallback to original on any error
                }
            }
            img.onerror = () => resolve(file) // Fallback to original
            img.src = event.target?.result as string
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

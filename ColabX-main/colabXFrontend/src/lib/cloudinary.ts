interface UploadToCloudinaryInput {
    file: File;
}

interface UploadToCloudinaryResult {
    secureUrl: string;
    originalFilename: string;
}

export async function uploadToCloudinary({ file }: UploadToCloudinaryInput): Promise<UploadToCloudinaryResult> {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET?.trim();

    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UNSIGNED_PRESET.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
    });

    const payload = await response.json();

    if (!response.ok || !payload?.secure_url) {
        throw new Error(payload?.error?.message || 'Cloudinary upload failed');
    }

    return {
        secureUrl: payload.secure_url,
        originalFilename: payload.original_filename || file.name,
    };
}

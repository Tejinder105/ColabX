export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024;

export const ACCEPTED_UPLOAD_EXTENSIONS = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.csv',
    '.ppt',
    '.pptx',
    '.txt',
    '.rtf',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.svg',
] as const;

const ACCEPTED_MIME_TYPES = new Set<string>([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/rtf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
]);

export const ACCEPTED_UPLOAD_LABEL = 'PDF, DOC/DOCX, XLS/XLSX/CSV, PPT/PPTX, TXT/RTF, JPG/PNG/GIF/WEBP/SVG';

export function formatUploadSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
        const kb = bytes / 1024;
        return `${Math.round(kb)} KB`;
    }

    return `${mb.toFixed(1)} MB`;
}

export function validateUploadFile(file: File): string | null {
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        return `File exceeds max size of ${formatUploadSize(MAX_UPLOAD_SIZE_BYTES)}.`;
    }

    const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
    const extensionAllowed = ACCEPTED_UPLOAD_EXTENSIONS.includes(extension as (typeof ACCEPTED_UPLOAD_EXTENSIONS)[number]);
    const mimeAllowed = !file.type || ACCEPTED_MIME_TYPES.has(file.type);

    if (!extensionAllowed || !mimeAllowed) {
        return `Unsupported file type. Allowed types: ${ACCEPTED_UPLOAD_LABEL}.`;
    }

    return null;
}

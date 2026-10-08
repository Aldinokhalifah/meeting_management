import { File, FileImage, FileSpreadsheet, FileText } from 'lucide-react'

// Harus sama dengan batas di backend (MAX_FILE_SIZE, MAX_ATTACHMENTS_PER_MEETING).
// Di sini hanya untuk validasi cepat sebelum upload; keputusan akhir tetap di backend.
export const MAX_FILE_SIZE = 10 * 1024 * 1024
export const MAX_ATTACHMENTS = 5
export const UPLOADABLE_STATUSES = ['ongoing', 'done']

export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx']
export const ACCEPT_ATTRIBUTE = ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',')

export const formatFileSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const getExtension = (fileName = '') => {
    const dot = fileName.lastIndexOf('.')
    return dot > 0 ? fileName.slice(dot + 1).toLowerCase() : ''
}

// Return pesan error, atau null kalau file lolos validasi awal
export const validateFile = (file) => {
    if (!ALLOWED_EXTENSIONS.includes(getExtension(file.name))) {
        return `"${file.name}": tipe file tidak didukung`
    }
    if (file.size === 0) return `"${file.name}": file kosong`
    if (file.size > MAX_FILE_SIZE) {
        return `"${file.name}": ukuran melebihi ${formatFileSize(MAX_FILE_SIZE)}`
    }
    return null
}

export const getFileKind = (fileType = '') => {
    if (fileType.startsWith('image/')) {
        return { label: 'Gambar', icon: FileImage, previewable: true, className: 'bg-blue-50 text-blue-500' }
    }
    if (fileType === 'application/pdf') {
        return { label: 'PDF', icon: FileText, previewable: true, className: 'bg-red-50 text-red-500' }
    }
    if (fileType.includes('spreadsheet') || fileType.includes('ms-excel')) {
        return { label: 'Excel', icon: FileSpreadsheet, previewable: false, className: 'bg-green-50 text-green-600' }
    }
    if (fileType.includes('word')) {
        return { label: 'Word', icon: FileText, previewable: false, className: 'bg-indigo-50 text-indigo-500' }
    }
    return { label: 'File', icon: File, previewable: false, className: 'bg-gray-100 text-gray-500' }
}

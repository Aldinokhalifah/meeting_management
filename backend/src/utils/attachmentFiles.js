const hasBytes = (buffer, bytes, offset = 0) =>
    buffer.length >= offset + bytes.length && bytes.every((byte, i) => buffer[offset + i] === byte)

const isJpeg = (buffer) => hasBytes(buffer, [0xff, 0xd8, 0xff])
const isPng = (buffer) => hasBytes(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const isWebp = (buffer) => hasBytes(buffer, [0x52, 0x49, 0x46, 0x46]) && hasBytes(buffer, [0x57, 0x45, 0x42, 0x50], 8)
// Spesifikasi PDF: header '%PDF-' harus ada di 1024 byte pertama
const isPdf = (buffer) => buffer.subarray(0, 1024).includes('%PDF-')
// Format lama Word/Excel (OLE2 compound file)
const isOle2 = (buffer) => hasBytes(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
// Format baru Word/Excel (docx/xlsx adalah arsip ZIP)
const isZip = (buffer) => hasBytes(buffer, [0x50, 0x4b, 0x03, 0x04])

// Sumber tunggal tipe file yang diizinkan. Tipe MIME ditentukan dari ekstensi,
// bukan dari nilai yang dikirim browser (yang bisa kosong atau dimanipulasi).
const ALLOWED_FILES = {
    jpg: { mime: 'image/jpeg', previewable: true, matchesSignature: isJpeg },
    jpeg: { mime: 'image/jpeg', previewable: true, matchesSignature: isJpeg },
    png: { mime: 'image/png', previewable: true, matchesSignature: isPng },
    webp: { mime: 'image/webp', previewable: true, matchesSignature: isWebp },
    pdf: { mime: 'application/pdf', previewable: true, matchesSignature: isPdf },
    doc: { mime: 'application/msword', previewable: false, matchesSignature: isOle2 },
    docx: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', previewable: false, matchesSignature: isZip },
    xls: { mime: 'application/vnd.ms-excel', previewable: false, matchesSignature: isOle2 },
    xlsx: { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', previewable: false, matchesSignature: isZip },
}

const MAX_FILE_NAME_LENGTH = 255

// Buang path, karakter kontrol, dan spasi di ujung. Return null jika hasilnya kosong.
const sanitizeFileName = (fileName) => {
    if (typeof fileName !== 'string') return null

    const base = fileName.split(/[\\/]/).pop()
    const cleaned = base.replace(/[\u0000-\u001f\u007f]/g, '').trim()

    if (!cleaned || cleaned.length > MAX_FILE_NAME_LENGTH) return null
    return cleaned
}

const getExtension = (fileName) => {
    const dot = fileName.lastIndexOf('.')
    if (dot <= 0 || dot === fileName.length - 1) return ''
    return fileName.slice(dot + 1).toLowerCase()
}

// Content-Disposition aman untuk nama file Unicode/berisi tanda kutip (RFC 6266 + RFC 5987)
const buildContentDisposition = (type, fileName) => {
    const asciiFallback = fileName.replace(/[^\x20-\x7e]/g, '_').replace(/["\\%;]/g, '_')
    const encoded = encodeURIComponent(fileName)
        .replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    return `${type}; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`
}

module.exports = { ALLOWED_FILES, sanitizeFileName, getExtension, buildContentDisposition }
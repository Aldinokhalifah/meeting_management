/**
 * Menjalankan tugas async tanpa menunggu hasilnya (tidak menghambat respons).
 * Semua error ditangkap supaya tidak jadi unhandled rejection yang bisa mematikan proses Node.
 * logDetail=false: jangan cetak pesan error (untuk pesan yang berisi data sensitif, dipakai di Langkah 2).
 */
const fireAndForget = (label, task, { logDetail = true } = {}) => {
    Promise.resolve()
        .then(task)
        .catch((err) => {
        const detail = logDetail
            ? String(err?.message || 'unknown error').slice(0, 200)
            : 'detail disembunyikan'
        console.error(`✗ ${label} gagal: ${detail}`)
    })
}

module.exports = { fireAndForget }
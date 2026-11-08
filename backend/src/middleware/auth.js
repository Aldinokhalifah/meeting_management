const jwt = require('jsonwebtoken')
const passwordResetRepo = require('../repositories/passwordResetRepository')

module.exports = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer <token>

    if (!token) return res.status(401).json({ message: 'Token tidak ada' })

    let decoded
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
        return res.status(401).json({ message: 'Token tidak valid' })
    }

    try {
        // Tolak JWT yang diterbitkan pada/sebelum password direset.
        // NULL (belum pernah reset) lolos. iat dalam detik, jadi dibandingkan dalam detik juga.
        const changedAt = await passwordResetRepo.findPasswordChangedAtEpoch(decoded.id)

        if (changedAt === undefined) {
            return res.status(401).json({ message: 'Token tidak valid' })
        }
        if (changedAt !== null && decoded.iat <= changedAt) {
            return res.status(401).json({ message: 'Sesi berakhir, silakan login kembali' })
        }

        req.user = decoded
        next()
    } catch (err) {
        // Gagal cek ke DB: tolak (fail closed), jangan loloskan token
        next(err)
    }
}
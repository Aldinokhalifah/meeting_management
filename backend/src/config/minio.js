const Minio = require('minio')
require('dotenv').config()

const toBool = (value) => String(value).toLowerCase() === 'true'

const accessKey = process.env.MINIO_ACCESS_KEY
const secretKey = process.env.MINIO_SECRET_KEY
const region = process.env.MINIO_REGION || 'us-east-1'
const bucket = process.env.MINIO_BUCKET

const buildClient = ({ endPoint, port, useSSL }) =>
    new Minio.Client({
        endPoint,
        port,
        useSSL,
        accessKey,
        secretKey,
        // region eksplisit: pembuatan presigned URL tidak perlu menghubungi MinIO
        region,
    })

const internalConfig = {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: Number(process.env.MINIO_PORT) || 9000,
    useSSL: toBool(process.env.MINIO_USE_SSL),
}

// Endpoint yang dibuka browser. Signature presigned URL mencakup host,
// jadi URL harus dibuat dengan client yang memakai endpoint publik ini.
const publicConfig = {
    endPoint: process.env.MINIO_PUBLIC_ENDPOINT || internalConfig.endPoint,
    port: Number(process.env.MINIO_PUBLIC_PORT) || internalConfig.port,
    useSSL: process.env.MINIO_PUBLIC_USE_SSL === undefined
        ? internalConfig.useSSL
        : toBool(process.env.MINIO_PUBLIC_USE_SSL),
}

module.exports = {
    // backend -> MinIO (stat, baca header file, hapus objek)
    internalClient: buildClient(internalConfig),
    // hanya untuk membuat presigned URL yang dipakai browser
    publicClient: buildClient(publicConfig),
    bucket,
    PostPolicy: Minio.PostPolicy,
}
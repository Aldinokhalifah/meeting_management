require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const errorHandler = require('./src/middleware/errorHandler')
const {testConnection} = require('./src/config/db')
const authRoute = require('./src/routes/auth')
const meetingRoute = require('./src/routes/meeting');
const noteRoute = require('./src/routes/note');
const actionItemRoute = require('./src/routes/actionItem');

const app = express()

app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(express.urlencoded({ extended: true })); 

// Routes
app.use('/api/auth', authRoute);
app.use('/api/meetings', meetingRoute);
app.use('/api/meetings/:id/notes', noteRoute);
app.use('/api/meetings/:id/action-items', actionItemRoute);

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'API - Meeting Management - Berjalan' })
});

app.get('/test-connection', async (req, res) => {
    const ok = await testConnection();
    if (ok) {
        res.status(200).json({
        message: "Koneksi database berhasil",
        });
    } else {
        res.status(500).json({
        message: "Koneksi database gagal",
        });
    }
});


app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`)
    const ok = await testConnection();
    if(ok) {
        console.log("PostgreSQL: connected");
    } else {
        console.log("PostgreSQL: GAGAL terhubung — cek .env dan service PostgreSQL");
    }
})
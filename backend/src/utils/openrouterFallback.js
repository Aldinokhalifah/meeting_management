import OpenAI from 'openai'
import openrouter from '../config/openrouter';

const FALLBACK_MODELS = [
    process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
];

// Status code error di tingkat API Key (langsung ganti key, skip sisa model)
const KEY_LEVEL_STATUS = [401, 402, 403];

export const chatCompletionsWithFallback = async (options) => {
    // Ambil API keys dari env (bisa single key atau multiple diseparat koma)
    const rawKeys = process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY || '';
    const apiKeys = rawKeys.split(',').map((k) => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
        throw new Error('NO_API_KEY_CONFIGURED');
    }

    let lastError = null;

    for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
        const apiKey = apiKeys[keyIndex];

        // Inisialisasi client OpenAI dengan key yang sedang dicoba
        const client = openrouter(apiKey)

        for (let modelIndex = 0; modelIndex < FALLBACK_MODELS.length; modelIndex++) {
        const model = FALLBACK_MODELS[modelIndex];

        try {
            const response = await client.chat.completions.create({
            ...options,
            model: model,
            });

            const content = response?.choices?.[0]?.message?.content;

            // Validasi: jika response kosong atau choices is null/empty
            if (!content || typeof content !== 'string' || content.trim() === '') {
            throw new Error(`Model ${model} mengembalikan respon kosong (choices is empty/null).`);
            }

            return content.trim();
        } catch (err) {
            lastError = err;
            const statusCode = err?.status || err?.statusCode || 500;

            console.warn(
            `[OpenRouter Fallback] Gagal Key #${keyIndex + 1} Model=${model} (Status ${statusCode}: ${err.message})`
            );

            // Jika error terkait kuota/key, lewati sisa model dan ganti API Key berikutnya
            if (KEY_LEVEL_STATUS.includes(statusCode)) {
            break;
            }
        }
        }
    }

    console.error('[OpenRouter Fallback] Semua kombinasi API key dan model telah dicoba dan gagal.', lastError);
    throw new Error('LLM_SERVICE_UNAVAILABLE');
};
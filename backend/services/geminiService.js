const { env } = require('../config/env');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = env.geminiModel;

const buildConversation = (history = [], message = '') => {
  const normalizedHistory = Array.isArray(history) ? history : [];

  const conversation = normalizedHistory
    .filter((entry) => entry && typeof entry.content === 'string' && entry.content.trim())
    .map((entry) => ({
      role: entry.role === 'bot' ? 'model' : 'user',
      parts: [{ text: entry.content.trim() }],
    }));

  conversation.push({
    role: 'user',
    parts: [{ text: message.trim() }],
  });

  return conversation;
};

const extractText = (payload = {}) => {
  const candidate = payload.candidates?.[0];
  const parts = candidate?.content?.parts || [];

  const text = parts
    .map((part) => part?.text || '')
    .join('')
    .trim();

  return text;
};

const generateChatReply = async ({ message, history = [] }) => {
  if (!env.geminiApiKey) {
    const error = new Error('GEMINI_API_KEY is missing in backend environment variables.');
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(
    `${GEMINI_API_URL}/${DEFAULT_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.geminiApiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                'You are a friendly college guidance chatbot for the Aarohan platform. Keep answers clear, practical, and concise. Focus on helping students understand streams, colleges, ranks, fees, and next steps.',
            },
          ],
        },
        contents: buildConversation(history, message),
      }),
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    const apiMessage =
      payload?.error?.message || 'Gemini API request failed.';
    const error = new Error(apiMessage);
    error.statusCode = response.status;
    throw error;
  }

  const reply = extractText(payload);

  if (!reply) {
    const error = new Error('Gemini returned an empty response.');
    error.statusCode = 502;
    throw error;
  }

  return reply;
};

module.exports = {
  generateChatReply,
};

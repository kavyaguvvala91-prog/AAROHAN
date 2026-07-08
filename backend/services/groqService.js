const { env } = require('../config/env');

const GROQ_API_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_MODEL = env.groqModel;
const SYSTEM_PROMPT =
  'You are a friendly college guidance chatbot for the Aarohan platform. Keep answers clear, practical, and concise. Focus on helping students understand streams, colleges, ranks, fees, and next steps.';

const buildConversation = (history = [], message = '') => {
  const normalizedHistory = Array.isArray(history) ? history : [];

  const conversation = [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    ...normalizedHistory
      .filter((entry) => entry && typeof entry.content === 'string' && entry.content.trim())
      .map((entry) => ({
        role: entry.role === 'bot' || entry.role === 'assistant' ? 'assistant' : 'user',
        content: entry.content.trim(),
      })),
    {
      role: 'user',
      content: message.trim(),
    },
  ];

  return conversation;
};

const extractText = (payload = {}) => {
  const choice = payload.choices?.[0];
  const content = choice?.message?.content;

  if (Array.isArray(content)) {
    return content
      .map((part) => part?.text || part?.content || '')
      .join('')
      .trim();
  }

  return String(content || '').trim();
};

const generateChatReply = async ({ message, history = [] }) => {
  if (!env.groqApiKey) {
    const error = new Error('GROQ_API_KEY is missing in backend environment variables.');
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: buildConversation(history, message),
      temperature: 0.4,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const apiMessage = payload?.error?.message || 'Groq API request failed.';
    const error = new Error(apiMessage);
    error.statusCode = response.status;
    throw error;
  }

  const reply = extractText(payload);

  if (!reply) {
    const error = new Error('Groq returned an empty response.');
    error.statusCode = 502;
    throw error;
  }

  return reply;
};

module.exports = {
  generateChatReply,
};

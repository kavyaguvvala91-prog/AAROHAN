const { generateChatReply } = require('../services/geminiService');

const chatWithGemini = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        message: 'A user message is required.',
      });
    }

    const reply = await generateChatReply({
      message: String(message),
      history,
    });

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  chatWithGemini,
};

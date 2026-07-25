const axios = require('axios');
const { getOpenAIConfig } = require('../config');

const TEMPLATE_NAMES = {
  clothing: '服装行业',
  digital: '数码产品',
  food: '食品',
  beauty: '美妆产品'
};
const GENERATION_TYPES = new Set(['description', 'image', 'tag']);

function buildPrompt(type, template, currentItems = []) {
  const industry = TEMPLATE_NAMES[template] || '通用商品';
  const existingContext = JSON.stringify(currentItems).slice(0, 4000);
  const requests = {
    description: '一段真实、清晰且有吸引力的商品描述，突出特点和使用场景',
    image: '一段可直接用于生成高质量商品主图的视觉提示词，包含构图、光线和背景',
    tag: '5 个简洁、准确、不夸大的营销标签'
  };
  return `请为${industry}生成${requests[type]}。现有页面内容：${existingContext}`;
}

function publicError(message, status) {
  const error = new Error(message);
  error.publicMessage = message;
  error.status = status;
  return error;
}

async function generateMerchantContent({ type, template, currentItems }) {
  let config;
  try {
    config = getOpenAIConfig();
  } catch {
    throw publicError('AI 服务尚未配置', 503);
  }

  try {
    const completion = await axios.post(
      `${config.baseUrl}/chat/completions`,
      {
        model: config.textModel,
        messages: [
          {
            role: 'system',
            content: '你是严谨的电商页面设计助手。内容必须准确、简洁，不得虚构认证或效果。'
          },
          { role: 'user', content: buildPrompt(type, template, currentItems) }
        ],
        max_completion_tokens: 1000
      },
      {
        headers: { Authorization: `Bearer ${config.apiKey}` },
        timeout: 30000
      }
    );

    const content = completion.data?.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('INVALID_UPSTREAM_RESPONSE');
    if (type !== 'image') return { content };

    const imageResponse = await axios.post(
      `${config.baseUrl}/images/generations`,
      { model: config.imageModel, prompt: content, n: 1, size: '1024x1024' },
      {
        headers: { Authorization: `Bearer ${config.apiKey}` },
        timeout: 60000
      }
    );
    const image = imageResponse.data?.data?.[0];
    const imageUrl = image?.url || (image?.b64_json ? `data:image/png;base64,${image.b64_json}` : '');
    if (!imageUrl) throw new Error('INVALID_IMAGE_RESPONSE');
    return { content, imageUrl };
  } catch (error) {
    if (error.publicMessage) throw error;
    if (error.response?.status === 429) {
      throw publicError('AI 请求过于频繁，请稍后再试', 429);
    }
    throw publicError('AI 服务暂时不可用', 502);
  }
}

module.exports = {
  GENERATION_TYPES,
  TEMPLATE_NAMES,
  buildPrompt,
  generateMerchantContent
};

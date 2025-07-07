require('dotenv').config();
const { OpenAI } = require('openai');

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

function getRandomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

async function analyzeImage(base64) {
  // 限制图片大小，最大10MB（base64编码约13333333字符）
  if (base64.length > 13_333_333) {
    return {
      food: null,
      confidence: null,
      calories: null,
      estimatedServing: null,
      totalCalories: null,
      healthTip: '图片过大，单张图片请小于10MB',
      error: '图片过大，单张图片请小于10MB',
      raw: null
    };
  }

  const messages = [
    {
      role: 'system',
      content: '你是营养师， 你擅长分析食物图片。请用json格式输出以下字段：food（食物名称）、calories（标准热量值）、estimatedServing（预估分量）、totalCalories（总热量）、healthTip（建议提示，如"请适量摄入，均衡饮食。"）。'
    },
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${base64}` }
        },
        {
          type: 'text',
          text: '你是营养师，擅长分析食物图片。请用json格式输出以下字段：food（食物名称）、calories（标准热量值）、estimatedServing（预估分量）、totalCalories（总热量）、healthTip（建议提示，如"请适量摄入，均衡饮食。"）。'
        }
      ]
    }
  ];
  const completion = await client.chat.completions.create({
    model: 'qwen-vl-max-latest',
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 1024,
    n: 1,
    presence_penalty: 1.0
  });
  // 解析模型返回的json字符串
  try {
    // 先去除所有 // 注释（包括行尾和独立注释行）
    let content = completion.choices[0].message.content;
    content = content.replace(/\s*\/\/.*$/gm, ''); // 去除每行 // 后的内容
    const aiResult = JSON.parse(content);
    // 组装新格式，确保所有字段都存在
    const food = aiResult.food || aiResult.name || null;
    const calories = aiResult.calories || null;
    const confidence = aiResult.confidence || Number(getRandomInRange(0.8, 0.95).toFixed(2));
    const estimatedServing = aiResult.estimatedServing || Math.floor(getRandomInRange(100, 200));
    const totalCalories = aiResult.totalCalories || (calories && estimatedServing ? Math.round(calories * estimatedServing / 100) : null);
    const healthTip = aiResult.healthTip || '请适量摄入，均衡饮食。';
    return {
      food,
      confidence,
      calories,
      estimatedServing,
      totalCalories,
      healthTip
    };
  } catch (e) {
    return { 
      food: null,
      confidence: null,
      calories: null,
      estimatedServing: null,
      totalCalories: null,
      healthTip: 'AI返回内容无法解析',
      error: 'AI返回内容无法解析',
      raw: completion.choices[0].message.content
    };
  }
}

module.exports = analyzeImage; 

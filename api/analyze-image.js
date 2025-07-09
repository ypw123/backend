import analyzeImage from '../backend/analyze.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let image_base64 = null;
  try {
    image_base64 = req.body?.image_base64;
  } catch (e) {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }

  if (!image_base64) {
    res.status(400).json({ error: '缺少 image_base64 字段' });
    return;
  }

  try {
    const result = await analyzeImage(image_base64);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: 'AI服务异常', detail: e.message });
  }
} 
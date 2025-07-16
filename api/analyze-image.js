const analyzeImage = require('../backend/analyze');

function setCORS(req, res) {
  const origin = req.headers.origin;
  if (
    origin === 'https://ypw123.github.io' ||
    /^http:\/\/localhost(:\d+)?$/.test(origin)
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  setCORS(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  let image_base64 = '';
  try {
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => {
        if (!data) return resolve({});
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error('Invalid JSON'));
        }
      });
      req.on('error', reject);
    });
    image_base64 = body.image_base64;
    if (!image_base64) throw new Error('缺少 image_base64 字段');
  } catch (e) {
    res.status(400).json({ error: e.message || '缺少 image_base64 字段' });
    return;
  }

  try {
    const result = await analyzeImage(image_base64);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: 'AI服务异常', detail: e.message });
  }
}; 
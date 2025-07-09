# API 文档

## POST /analyze-image

- 描述：上传 base64 图片，返回食物识别及相关健康建议。
- 请求参数：
  - image_base64: string，前端上传的 base64 编码图片
- 响应参数（JSON）：
  - food: string，食物名称
  - confidence: number，识别置信度（0-1）
  - calories: number，标准热量值（每100g）
  - estimatedServing: number，估算分量（g）
  - totalCalories: number，总热量（估算分量下）
  - healthTip: string，健康建议

### 示例

请求：
```json
{
  "image_base64": "..."
}
```

响应：
```json
{
  "food": "苹果",
  "confidence": 0.92,
  "calories": 52,
  "estimatedServing": 150,
  "totalCalories": 78,
  "healthTip": "苹果是低热量水果，富含纤维，推荐作为健康零食"
}
```

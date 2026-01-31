// Gemini 模型配置
export const geminiModels = [
  {
    label: 'gemini-3-pro-preview',
    value: 'gemini-3-pro-preview',
  },
  {
    label: 'gemini-3-flash-preview',
    value: 'gemini-3-flash-preview',
  },
]

// 默认模型 (建议使用配额最多的型号或最新型号)
export const defaultGeminiModel = geminiModels[0].value

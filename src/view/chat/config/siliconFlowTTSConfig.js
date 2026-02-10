// SiliconFlow TTS 模型配置
export const siliconFlowTTSModels = [
  {
    label: 'CosyVoice2-0.5B',
    value: 'FunAudioLLM/CosyVoice2-0.5B',
    description: '高质量语音合成模型，支持多种音色',
    voices: [
      { label: 'Alex (沉稳男声)', value: 'alex' },
      { label: 'Anna (沉稳女声)', value: 'anna' },
      { label: 'Benjamin (低沉男声)', value: 'benjamin' },
      { label: 'Claire (温柔女声)', value: 'claire' },
      { label: 'David (欢快男声)', value: 'david' },
      { label: 'Diana (欢快女声)', value: 'diana' },
    ],
  },
  {
    label: 'MOSS-TTSD-v0.5',
    value: 'fnlp/MOSS-TTSD-v0.5',
    description: '自然流畅的语音合成',
    voices: [
      { label: '害羞少女', value: 'shy_girl' },
      { label: '慵懒少女', value: 'lazy_girl' },
      { label: '成熟女士', value: 'mature_lady' },
      { label: '探索少女', value: 'explorer_girl' },
      { label: '洒脱青年', value: 'free_youth' },
      { label: '睿智少女', value: 'wise_girl' },
      { label: '纯真少年', value: 'innocent_boy' },
      { label: '绅士青年', value: 'gentleman' },
    ],
  },
  {
    label: 'IndexTTS-2',
    value: 'IndexTeam/IndexTTS-2',
    description: '快速高效的语音合成',
    voices: [
      { label: 'Alex', value: 'alex' },
      { label: 'Anna', value: 'anna' },
      { label: 'Benjamin', value: 'benjamin' },
      { label: 'Claire', value: 'claire' },
    ],
  },
]

// 默认配置
export const defaultSiliconFlowConfig = {
  apiKey: '',
  model: 'FunAudioLLM/CosyVoice2-0.5B',
  voice: 'alex',
  clonedVoices: [], // 克隆音色数组
}

import { planningConfig } from '../config/planningConfig.js'

const token = import.meta.env.VITE_AVA_PLANNING_TOKEN || ''

/**
 * 调用 AI API
 * @param {Object} requestBody - 请求体
 * @returns {Promise<Object>} AI 响应
 */
async function postAgent(requestBody) {
  return fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  })
    .then((res) => res.json())
    .catch((err) => err)
}

/**
 * 调用任务规划 AI 服务
 * @param {string} prompt - 用户的任务描述
 * @returns {Promise<string>} AI 返回的 JSON 字符串
 */
export async function callPlanningAI(prompt) {
  const requestBody = {
    ...planningConfig,
    messages: [
      ...planningConfig.messages,
      {
        role: 'user',
        content: prompt,
      },
    ],
  }

  const data = await postAgent(requestBody)

  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content
  }

  throw new Error('AI 响应格式不正确')
}

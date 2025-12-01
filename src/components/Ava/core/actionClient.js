import config from '../config/actionConfig.js'
const token = import.meta.env.VITE_AVA_ACTION_TOKEN || ''
/**
 * 调用 AI API
 * @param {Object} requestBody - 请求体
 * @returns {Promise<Object>} AI 响应
 */
async function postAgent(requestBody) {
  return fetch('https://api.siliconflow.cn/v1/chat/completions', {
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
 * 调用 AI 服务
 * @param {string} prompt - 用户 Prompt
 * @returns {Promise<Array>} tool_calls
 */
export async function callAI(prompt) {
  const requestBody = { ...config, messages: [...config.messages] }
  requestBody.messages.push({
    role: 'user',
    content: prompt,
  })
  const res = await postAgent(requestBody)
  return res.choices[0].message.tool_calls
}

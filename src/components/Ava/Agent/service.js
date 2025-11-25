const token = import.meta.env.VITE_AVA_TOKEN || ''
export function postAgent(requestBody) {
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

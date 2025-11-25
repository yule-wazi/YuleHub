import config from '../Agent/config'
import { postAgent } from '../Agent/service'

export async function chatToAgent(messageItem) {
  const requestBody = config
  requestBody.messages.push(messageItem)
  const res = await postAgent(requestBody)
  return res.choices[0].message.tool_calls
}

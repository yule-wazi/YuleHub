export function formatSpecialOutput(message, istextLight = true) {
  let newMessage = message
  if (istextLight) {
    newMessage = newMessage.replace(/"([^"]*)"/g, '<span class=chat>"$1"</span>') //高亮处理
  }
  return newMessage
    .replace(/\*/g, '')
    .replace(/\n/g, `<br>`)
    .replace(/```([\s\S]*?)```/g, `<pre>$1</pre>`) //规则处理
}
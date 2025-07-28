export function matchLoreBooks(messageList, loreBooks) {
  let loreBooksMessageList = []
  let messageKeys = []
  const newMessageList = messageList.slice(-1)
  newMessageList.forEach((message) => {
    const content = message.content
    loreBooks.forEach((item) => {
      if (
        item.keys.some((key) => {
          if (content.includes(key)) {
            messageKeys.push(key)
            return true
          }
        })
      ) {
        loreBooksMessageList.push(item)
      }
    })
  })
  loreBooksMessageList = [...new Set(loreBooksMessageList)]
  return { loreBooksMessageList, messageKeys }
}

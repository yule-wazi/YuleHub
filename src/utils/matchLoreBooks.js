export function matchLoreBooks(messageList, loreBooks) {
  let loreBooksMessageList = []
  const newMessageList = messageList.slice(-1)
  newMessageList.forEach((message) => {
    const content = message.content
    loreBooks.forEach((item) => {
      if (item.keys.some((key) => content.includes(key))) {
        loreBooksMessageList.push(item)
      }
    })
  })
  loreBooksMessageList = [...new Set(loreBooksMessageList)]
  return loreBooksMessageList
}

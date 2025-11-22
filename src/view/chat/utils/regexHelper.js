/**
 * 正则表达式辅助函数
 */

/**
 * 转义正则表达式特殊字符
 * @param {string} str - 要转义的字符串
 * @returns {string}
 */
export function escapeRegex(str) {
  // 转义所有正则特殊字符
  const specialChars = ['*', '.', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', '\\']
  let result = str
  for (const char of specialChars) {
    result = result.split(char).join('\\' + char)
  }
  return result
}

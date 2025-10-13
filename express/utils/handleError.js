const handleError = (error, req, res, next) => {
  let code = 0
  let message = ''
  switch (error) {
    case -4001:
      code = -4001
      message = '请求参数缺失'
      break
    case -4002:
      code= -4002
      message = '没有更多了'
  }

  res.send({
    code,
    message,
  })
}
export default handleError

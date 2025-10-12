const handleError = (error, req, res, next) => {
  let code = 0
  let message = ''
  switch (error) {
    case -4001:
      code = -4001
      message = '请求参数缺失'
      break
  }

  res.send({
    code,
    message,
  })
}
export default handleError

import LIMITSIZE from "../config/globalVar.js"

export default function getOffset(page) {
  return LIMITSIZE * (page - 1)
}
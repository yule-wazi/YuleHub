import fs from 'fs'
import getLocalIPAddress from './getLocationIPAdress.js'

export default function changeLocaltionIPAdress() {
  const newIPAdress = `VITE_HOST=${getLocalIPAddress()}`
  console.log('newIPAdress=', newIPAdress)
  fs.writeFile('./.env.local', newIPAdress, { flag: 'w' }, (err) => {
    if (err) {
      console.log('err', err)
    }
  })
}

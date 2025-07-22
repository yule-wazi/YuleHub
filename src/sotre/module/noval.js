import { getNewNoval } from '@/service/module/noval'
import { defineStore } from 'pinia'

const useNoval = defineStore('novalStore', {
  state: () => {
    return {
      novalList: [],
    }
  },
  actions: {
    async getHomeNoval() {
      const res = await getNewNoval()
      this.novalList = res.data.novels
      console.log(res)
    },
  },
})
export default useNoval

import { useTemplateRef, onMounted, onBeforeUnmount, onActivated } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

export function scrollRestore(elementRef, store) {
  // useTemplateRef 必须在 setup 顶层调用，不能放在 onMounted 里
  const ref = useTemplateRef(elementRef)

  onMounted(() => {
    if (ref.value) {
      ref.value.scrollTo({ top: store.scrollTop })
    }
  })

  onBeforeUnmount(() => {
    if (ref.value) {
      store.scrollTop = ref.value.scrollTop
    }
  })

  onActivated(() => {
    if (ref.value) {
      ref.value.scrollTo({ top: store.scrollTop })
    }
  })

  onBeforeRouteLeave(() => {
    if (ref.value) {
      store.scrollTop = ref.value.scrollTop
    }
  })
}

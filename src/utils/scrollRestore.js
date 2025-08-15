import { useTemplateRef, onMounted, onBeforeUnmount, onActivated, onDeactivated } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

export function scrollRestore(elementRef, store) {
  const ref = useTemplateRef(elementRef)
  onMounted(() => {
    ref.value.scrollTo({ top: store.scrollTop })
  })
  onBeforeUnmount(() => {
    store.scrollTop = ref.value.scrollTop
  })
  onActivated(() => {
    ref.value.scrollTo({ top: store.scrollTop })
  })
  onBeforeRouteLeave(() => {
    store.scrollTop = ref.value.scrollTop
  })
}

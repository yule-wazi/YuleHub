import { useTemplateRef, onMounted, onBeforeUnmount } from 'vue'

export function scrollRestore(elementRef, store) {
  const ref = useTemplateRef(elementRef)
  onMounted(() => {
    ref.value.scrollTo({ top: store.scrollTop })
  })
  onBeforeUnmount(() => {
    store.scrollTop = ref.value.scrollTop
  })
}

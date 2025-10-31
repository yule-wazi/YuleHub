// 测试mock服务是否正常工作
import videoMockService from './service/video.mock.service.js'

console.log('=== 测试Mock服务 ===\n')

// 测试获取列表
console.log('1. 测试list方法:')
const list = videoMockService.list(0)
console.log('  返回数据量:', list.length)
console.log('  第一条数据:', JSON.stringify(list[0] || {}, null, 2))

// 测试获取总数
console.log('\n2. 测试count方法:')
const count = videoMockService.count()
console.log('  总数:', count)

// 测试搜索
console.log('\n3. 测试search方法:')
const search = videoMockService.search('标签1', 0)
console.log('  搜索结果数量:', search.length)

// 测试Feed
console.log('\n4. 测试feed方法:')
const feed = videoMockService.feed(5)
console.log('  Feed数据量:', feed.length)

console.log('\n=== Mock服务测试完成 ===')


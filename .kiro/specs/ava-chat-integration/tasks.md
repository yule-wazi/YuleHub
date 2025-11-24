# 实现计划

- [x] 1. 创建 AgentController 核心模块

  - 实现 Agent 任务流程的协调逻辑
  - 集成 Observe、AI Service 和 ActionExecutor
  - _需求: 3.1, 4.1, 5.1_

- [x] 1.1 实现 AgentController 类基础结构

  - 创建 `src/components/Ava/utils/AgentController.js` 文件
  - 定义 AgentController 类和核心方法签名
  - 实现构造函数和初始化逻辑
  - _需求: 3.1, 4.1_

- [x] 1.2 实现页面观察功能

  - 调用 `getInteractables()` 扫描页面元素
  - 处理空元素列表的情况
  - 返回格式化的元素列表
  - _需求: 3.1, 3.2, 3.4_

- [x] 2. 实现 AI Prompt 构建和服务调用

  - 构建包含用户需求和元素列表的 Prompt
  - 调用现有的 postDZMMAgent 函数
  - _需求: 4.1, 4.2_

- [x] 2.1 创建 Prompt 模板

  - 在 `src/components/Ava/utils/prompts.js` 中定义模板
  - 实现 `buildAgentPrompt(userPrompt, elements)` 函数
  - 格式化元素列表为可读文本
  - _需求: 4.1_

- [x] 2.2 实现 AI 服务调用

  - 复用 `postDZMMAgent` 函数

  - 处理流式响应（用于对话展示）
  - 实现错误处理和重试逻辑
  - _需求: 4.1, 10.2_

- [x] 3. 实现 AI 响应解析和指令转换

  - 解析 AI 返回的 JSON 指令
  - 转换为 ActionExecutor 可执行的 Action 对象
  - _需求: 8.1, 8.2, 8.3, 8.4_

- [x] 3.1 实现 JSON 响应解析

  - 创建 `parseAIResponse(response)` 函数

  - 验证 JSON 格式有效性
  - 提取 actions 数组
  - _需求: 8.1, 8.2_

- [x] 3.2 实现指令转换逻辑

  - 创建 `convertToAction(instruction)` 函数
  - 将 ActionInstruction 转换为 Action 对象
  - 构建正确的 selector（使用 data-agent-id）
  - 设置默认的 waitAfter 参数
  - _需求: 8.3, 8.4_

- [x] 4. 实现操作执行和反馈

  - 调用 ActionExecutor 执行操作
  - 收集执行结果并生成反馈消息
  - _需求: 5.1, 5.2, 5.3, 9.1, 9.2, 9.3_

- [x] 4.1 实现操作执行流程

  - 遍历 actions 数组并逐个执行
  - 使用 ActionExecutor.perform() 执行操作
  - 捕获执行错误并记录
  - _需求: 5.1, 5.2, 5.3_

- [x] 4.2 实现反馈消息生成

  - 创建 `generateFeedbackMessage(results)` 函数
  - 根据执行结果生成用户友好的消息
  - 处理成功、失败和部分成功的情况
  - _需求: 9.1, 9.2, 9.3, 9.4_

- [x] 5. 集成对话界面到 Ava 组件

  - 更新 Ava.vue 组件以支持对话功能
  - 复用 MessageShow 组件展示消息
  - _需求: 1.1, 1.2, 2.1, 2.2, 6.1, 6.2_

- [x] 5.1 更新 Ava.vue 状态管理

  - 添加 messages 数组状态
  - 添加 isProcessing 状态
  - 实现消息添加和更新逻辑
  - _需求: 1.4, 2.4_

- [x] 5.2 实现消息发送功能

  - 绑定输入框的回车和发送按钮事件
  - 验证输入不为空
  - 调用 AgentController.runTask()
  - 将用户消息和 AI 回复添加到消息列表
  - _需求: 2.1, 2.2, 2.3_

- [x] 5.3 集成 MessageShow 组件

  - 在 Ava.vue 中导入 MessageShow 组件
  - 复用现有的样式和布局
  - 适配 Ava 对话框的尺寸
  - _需求: 6.1, 6.2, 6.3, 10.1_

- [x] 5.4 实现消息格式化

  - 使用 `formatSpecialOutput` 格式化消息内容
  - 支持 HTML 标记和高亮
  - _需求: 6.3, 6.4, 10.3_

- [x] 5.5 实现自动滚动

  - 在消息添加后滚动到底部
  - 使用 nextTick 确保 DOM 更新完成
  - _需求: 2.5, 6.5_

- [x] 6. 实现对话历史持久化

  - 使用 myCache 存储对话历史
  - 在组件挂载时恢复历史记录
  - _需求: 1.5, 10.5_

- [x] 6.1 实现历史记录保存

  - 监听 messages 数组变化
  - 使用 myCache.set() 保存到本地存储
  - 限制历史记录数量（如最多50条）
  - _需求: 1.5, 10.5_

- [x] 6.2 实现历史记录恢复

  - 在 onMounted 钩子中读取历史记录
  - 使用 myCache.get() 获取存储的消息
  - 初始化 messages 数组
  - _需求: 1.5, 10.5_

- [x] 7. 实现拖拽和点击的区分逻辑

  - 优化现有的拖拽逻辑
  - 确保拖拽不触发对话框展开
  - _需求: 1.3_

- [x] 7.1 优化拖拽检测

  - 记录 mousedown 时间戳
  - 在 click 事件中检查拖拽时长
  - 超过100ms则不触发 toggleDialog
  - _需求: 1.3_

- [x] 8. 实现错误处理和用户反馈

  - 创建统一的错误处理机制
  - 在对话中显示友好的错误消息
  - _需求: 9.3, 9.4_

- [x] 8.1 创建 ErrorHandler 类

  - 实现错误分类逻辑
  - 实现用户消息生成
  - 实现恢复操作建议
  - _需求: 9.3_

- [x] 8.2 集成错误处理到 Agent 流程

  - 在 AgentController 中捕获所有错误
  - 使用 ErrorHandler 处理错误
  - 将错误消息添加到对话列表
  - _需求: 9.3, 9.4_

- [x] 9. 优化和完善

  - 添加加载状态指示
  - 优化性能
  - 完善用户体验
  - _需求: 2.4, 9.1_

- [x] 9.1 添加加载状态

  - 在 AI 处理时显示"正在思考..."
  - 在操作执行时显示"正在执行..."
  - 使用 isProcessing 状态控制
  - _需求: 2.4, 9.1_

- [x] 9.2 实现请求去抖

  - 防止用户快速连续发送消息
  - 在处理中禁用发送按钮
  - _需求: 2.2_

- [x] 9.3 添加清除历史功能

  - 在对话框中添加清除按钮
  - 清空 messages 数组和本地存储
  - _需求: 1.5_

- [x] 10. 检查点 - 确保功能正常
  - 确保所有功能正常运行，如有问题请询问用户

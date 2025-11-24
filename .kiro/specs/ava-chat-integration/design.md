# 设计文档

## 概述

本设计文档描述了如何将现有的 AI Chat 功能集成到 Ava 浏览器助手组件中，使其成为一个能够理解用户意图、分析页面元素并执行自动化操作的智能助手。核心设计重点在于：

1. **元素识别与标记**: 准确识别页面上的可交互元素并为其分配唯一标识
2. **AI 指令生成**: 将用户需求和页面元素信息转换为 AI 可理解的 prompt
3. **指令解析与执行**: 将 AI 返回的 JSON 指令准确转换为 ActionExecutor 可执行的操作
4. **对话界面集成**: 复用现有 Chat 组件实现流畅的对话体验

## 架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        Ava Component                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Dialog UI (对话界面)                       │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  MessageList (消息列表)                          │  │ │
│  │  │  - 用户消息                                       │  │ │
│  │  │  - AI 回复                                        │  │ │
│  │  │  - 操作反馈                                       │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  InputArea (输入区域)                            │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Agent Controller                        │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  Observe       │  │  AI Service    │  │  Execute     │  │
│  │  (页面观察)    │→ │  (AI 决策)     │→ │  (操作执行)  │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Current Web Page                        │
│                    (当前浏览的网页)                          │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

```
用户输入 → Agent Controller → Observe (扫描页面)
                              ↓
                         构建 Prompt
                              ↓
                         AI Service (生成指令)
                              ↓
                         解析 JSON 响应
                              ↓
                         ActionExecutor (执行操作)
                              ↓
                         反馈结果 → 对话界面
```

## 组件和接口

### 1. Ava.vue 组件

**职责**: 主 UI 组件，管理对话界面的展开/收起、消息列表和用户交互

**状态**:

```javascript
{
  isExpanded: boolean,        // 对话框是否展开
  messages: Array<Message>,   // 消息列表
  position: { x, y },         // 浮动按钮位置
  isDragging: boolean,        // 是否正在拖拽
  isProcessing: boolean       // 是否正在处理请求
}
```

**接口**:

```javascript
// 切换对话框展开/收起
toggleDialog(): void

// 发送用户消息
sendMessage(text: string): Promise<void>

// 添加消息到列表
addMessage(message: Message): void

// 滚动到底部
scrollToBottom(): void
```

### 2. AgentController 模块

**职责**: 协调页面观察、AI 决策和操作执行的核心控制器

**接口**:

```javascript
class AgentController {
  // 执行完整的 Agent 任务流程
  async runTask(userPrompt: string): Promise<AgentResult>

  // 扫描页面元素
  async observePage(): Promise<InteractableElement[]>

  // 构建 AI Prompt
  buildPrompt(userPrompt: string, elements: InteractableElement[]): string

  // 调用 AI 服务
  async callAI(prompt: string): Promise<AIResponse>

  // 解析 AI 响应
  parseAIResponse(response: string): ActionInstruction[]

  // 执行操作指令
  async executeActions(actions: ActionInstruction[]): Promise<ExecutionResult>
}
```

### 3. Observe 模块 (已存在)

**职责**: 识别和标记页面上的可交互元素

**接口**:

```javascript
// 获取所有可交互元素
getInteractables(): InteractableElement[]

// 清除旧的标记
clearOldIdentifiers(): void

// 判断元素是否可见
isVisible(element: HTMLElement): boolean

// 判断元素是否可交互
isInteractive(element: HTMLElement): boolean
```

**数据结构**:

```javascript
interface InteractableElement {
  id: number,              // 唯一标识
  tagName: string,         // 标签名
  className: string,       // 类名
  type: string | null,     // 类型 (input/button 等)
  text: string,            // 文本内容 (截取前50字符)
  rect: DOMRect            // 位置信息
}
```

### 4. ActionExecutor 类 (已存在)

**职责**: 执行具体的浏览器操作

**接口**:

```javascript
class ActionExecutor {
  // 执行单个操作
  async perform(action: Action): Promise<ActionResult>

  // 执行操作序列
  async runSequence(actions: Action[]): Promise<void>

  // 等待指定时间
  async sleep(ms: number): Promise<void>
}
```

**数据结构**:

```javascript
interface Action {
  type: 'click' | 'input' | 'scroll' | 'observe' | 'navigate',
  selector: string,        // CSS 选择器
  value?: string,          // 输入值 (仅 input 类型)
  waitAfter?: number,      // 操作后等待时间 (ms)
  willNavigate?: boolean   // 是否会导致页面跳转
}

interface ActionResult {
  success: boolean,
  action: string,
  error?: string
}
```

### 5. AI Service 模块

**职责**: 与 AI API 通信，生成操作指令

**接口**:

```javascript
// 调用 DZMM AI 服务
async function callDZMMAI(prompt: string): Promise<string>

// 流式调用 AI 服务 (用于对话展示)
async function callDZMMAIStream(
  prompt: string,
  onChunk: (text: string) => void
): Promise<string>
```

**Prompt 模板**:

```javascript
const AGENT_PROMPT_TEMPLATE = `你是一个浏览器自动化助手。
当前页面是一个图片列表页。用户的需求是："{user_prompt}"。

以下是当前屏幕可见的可交互元素列表：
[ID] <标签> 文本内容 (Class/Role)
---------------------------------------------------
{element_list}
---------------------------------------------------

请分析元素列表，找到符合用户需求的元素。

如果需要点击，请返回 JSON 格式指令：
{"actions": [{"type": "click", "id": 目标ID, "reason": "理由"}]}

如果是滚动，请返回：
{"actions": [{"type": "scroll", "id": 目标ID}]}

如果需要输入，请返回：
{"actions": [{"type": "input", "id": 目标ID, "value": "输入内容"}]}

如果无法完成任务，请说明原因。`
```

## 数据模型

### Message (消息)

```javascript
interface Message {
  id: string,              // 消息唯一标识
  type: 'user' | 'assistant' | 'system',
  content: string,         // 消息内容
  timestamp: number,       // 时间戳
  isMe: boolean,          // 是否是用户消息
  image?: string,         // 头像 URL
  metadata?: {            // 元数据
    elementCount?: number,    // 扫描到的元素数量
    actionType?: string,      // 操作类型
    executionTime?: number    // 执行耗时
  }
}
```

### AgentResult (Agent 执行结果)

```javascript
interface AgentResult {
  success: boolean,
  message: string,         // 反馈消息
  actions?: ActionInstruction[],
  executionResults?: ExecutionResult[],
  error?: string
}
```

### ActionInstruction (AI 生成的操作指令)

```javascript
interface ActionInstruction {
  type: 'click' | 'scroll' | 'input',
  id: number,              // 元素 ID
  value?: string,          // 输入值 (仅 input 类型)
  reason?: string          // 操作理由
}
```

### ExecutionResult (操作执行结果)

```javascript
interface ExecutionResult {
  action: ActionInstruction,
  success: boolean,
  error?: string,
  duration: number         // 执行耗时 (ms)
}
```

## 正确性属性

_属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。_

## 正确性属性

_属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。_

### 验收标准可测试性分析

#### 1.1 点击展开对话框

**思考**: 这是测试 UI 交互的规则。对于任何 Ava 按钮，点击后应该展开对话框。可以通过生成随机的初始状态来测试。
**可测试性**: yes - property

#### 1.3 拖拽不触发展开

**思考**: 这是测试拖拽和点击的区分逻辑。对于任何拖拽时长超过100ms的操作，都不应该触发展开。
**可测试性**: yes - property

#### 1.5 保留对话历史

**思考**: 这是一个状态持久化的规则。关闭再打开对话框，消息列表应该保持不变。这是一个不变性属性。
**可测试性**: yes - property

#### 2.3 空消息阻止发送

**思考**: 这是输入验证规则。对于任何空字符串或纯空白字符串，都应该被拒绝。
**可测试性**: yes - property

#### 3.2 唯一ID分配

**思考**: 这是关键的唯一性约束。对于任何页面扫描结果，所有元素的 data-agent-id 必须唯一。
**可测试性**: yes - property

#### 3.4 构建元素列表

**思考**: 这是关于数据完整性的规则。扫描后的每个元素都应该包含所有必需的属性。
**可测试性**: yes - property

#### 4.2 生成JSON格式指令

**思考**: 这是关于输出格式的规则。AI 的响应必须是有效的 JSON 且包含特定字段。
**可测试性**: yes - property

#### 7.1 添加唯一data-agent-id

**思考**: 这与 3.2 类似，是唯一性约束。每次扫描都应该为元素分配唯一 ID。
**可测试性**: yes - property

#### 7.4 截取文本内容

**思考**: 这是数据处理规则。对于任何元素文本，如果超过50字符，应该被截取。
**可测试性**: yes - property

#### 8.1 验证JSON有效性

**思考**: 这是输入验证规则。对于任何 AI 返回的字符串，必须能够被解析为有效 JSON。
**可测试性**: yes - property

#### 8.3 构建click执行对象

**思考**: 这是指令转换规则。对于任何 type 为 click 的指令，转换后必须包含 type、selector 和 waitAfter。
**可测试性**: yes - property

#### 8.4 构建scroll执行对象

**思考**: 这是指令转换规则。对于任何 type 为 scroll 的指令，转换后必须包含 type、selector 和 waitAfter。
**可测试性**: yes - property

#### 不可测试的验收标准

以下验收标准涉及 UI 展示、用户体验或外部依赖，不适合自动化属性测试：

- 1.2, 1.4: UI 元素的显示（需要人工验证）
- 2.1, 2.2, 2.4, 2.5: UI 交互和视觉反馈
- 3.1, 3.3, 3.5: 依赖用户输入和 AI 响应的端到端流程
- 4.1, 4.3, 4.4, 4.5: 依赖 AI 服务的行为
- 5.1-5.5: 操作执行的端到端流程
- 6.1-6.5: UI 展示和格式化
- 7.3, 7.5: 数据提取和动态更新（需要集成测试）
- 8.2, 8.5: 依赖 AI 响应的解析流程
- 9.1-9.5: 用户反馈消息（需要集成测试）
- 10.1-10.5: 代码复用（通过代码审查验证）

### 属性反思

在编写具体属性之前，让我识别可能的冗余：

1. **唯一性属性**: 3.2 和 7.1 都测试 data-agent-id 的唯一性，可以合并为一个属性
2. **指令转换属性**: 8.3 和 8.4 都测试指令转换，可以合并为一个综合属性
3. **输入验证属性**: 2.3 和 8.1 都是输入验证，但针对不同的输入类型，应该保留

### 正确性属性列表

**属性 1: 对话框状态切换一致性**
_对于任何_ Ava 组件状态，点击按钮（非拖拽）应该切换 isExpanded 状态，且切换后状态与之前相反
**验证需求**: 1.1

**属性 2: 拖拽操作不触发展开**
_对于任何_ 拖拽操作，如果拖拽时长超过100毫秒，则不应该改变 isExpanded 状态
**验证需求**: 1.3

**属性 3: 对话历史持久化**
_对于任何_ 消息列表，关闭对话框后再打开，消息列表应该与关闭前完全相同
**验证需求**: 1.5

**属性 4: 空消息拒绝**
_对于任何_ 由空白字符组成的字符串（包括空字符串），发送操作应该被阻止，消息列表长度不变
**验证需求**: 2.3

**属性 5: 元素ID唯一性**
_对于任何_ 页面扫描结果，所有可交互元素的 data-agent-id 属性值必须互不相同
**验证需求**: 3.2, 7.1

**属性 6: 元素数据完整性**
_对于任何_ 扫描到的可交互元素，返回的元素对象必须包含 id、tagName、text、className 和 type 属性
**验证需求**: 3.4

**属性 7: 文本截取一致性**
_对于任何_ 元素文本内容，如果长度超过50个字符，则返回的文本长度应该等于50
**验证需求**: 7.4

**属性 8: JSON响应有效性**
_对于任何_ AI 返回的指令字符串，必须能够被 JSON.parse 成功解析且包含 actions 数组
**验证需求**: 8.1

**属性 9: 指令转换完整性**
_对于任何_ 有效的 ActionInstruction（type 为 click 或 scroll），转换后的 Action 对象必须包含 type、selector 和 waitAfter 属性
**验证需求**: 8.3, 8.4

## 错误处理

### 错误类型

1. **页面扫描错误**

   - 无可交互元素: 提示用户当前页面没有可操作的元素
   - DOM 访问异常: 捕获并记录错误，提示用户刷新页面

2. **AI 服务错误**

   - 网络请求失败: 提示用户检查网络连接，提供重试选项
   - API Token 无效: 提示用户配置有效的 API Token
   - 响应超时: 提示用户请求超时，建议简化需求

3. **JSON 解析错误**

   - 格式无效: 提示 AI 返回了无效格式，请求重新生成
   - 缺少必需字段: 提示缺少操作指令，请求补充

4. **操作执行错误**
   - 元素未找到: 提示目标元素可能已消失或页面已更新
   - 操作超时: 提示操作执行超时，建议检查页面状态
   - 权限错误: 提示某些操作可能被浏览器安全策略阻止

### 错误处理策略

```javascript
class ErrorHandler {
  // 统一错误处理入口
  static handle(error, context) {
    const errorType = this.classify(error)
    const userMessage = this.getUserMessage(errorType, error)
    const recovery = this.getRecoveryAction(errorType)

    return {
      type: errorType,
      message: userMessage,
      recovery: recovery,
      originalError: error,
    }
  }

  // 错误分类
  static classify(error) {
    if (error.code === 'NETWORK_ERROR') return 'NETWORK'
    if (error.code === 'PARSE_ERROR') return 'JSON_PARSE'
    if (error.code === 'ELEMENT_NOT_FOUND') return 'ELEMENT_MISSING'
    if (error.code === 'TIMEOUT') return 'TIMEOUT'
    return 'UNKNOWN'
  }

  // 获取用户友好的错误消息
  static getUserMessage(errorType, error) {
    const messages = {
      NETWORK: '网络连接失败，请检查网络后重试',
      JSON_PARSE: 'AI 返回了无效的指令格式，正在重新请求...',
      ELEMENT_MISSING: '目标元素未找到，页面可能已更新',
      TIMEOUT: '操作执行超时，请检查页面状态',
      UNKNOWN: '发生未知错误，请稍后重试',
    }
    return messages[errorType] || messages.UNKNOWN
  }

  // 获取恢复操作
  static getRecoveryAction(errorType) {
    const actions = {
      NETWORK: 'RETRY',
      JSON_PARSE: 'REGENERATE',
      ELEMENT_MISSING: 'RESCAN',
      TIMEOUT: 'MANUAL_CHECK',
      UNKNOWN: 'REPORT',
    }
    return actions[errorType] || actions.UNKNOWN
  }
}
```

## 测试策略

### 单元测试

单元测试覆盖独立的功能模块：

1. **Observe 模块测试**

   - 测试 `isInteractive()` 对各种元素类型的判断
   - 测试 `getInteractables()` 的元素提取和 ID 分配
   - 测试 `clearOldIdentifiers()` 的清理功能

2. **指令解析测试**

   - 测试 `parseAIResponse()` 对有效 JSON 的解析
   - 测试对无效 JSON 的错误处理
   - 测试指令转换为 Action 对象的正确性

3. **消息格式化测试**
   - 测试 `formatSpecialOutput()` 的 HTML 转义
   - 测试特殊标记的高亮处理
   - 测试长文本的截取

### 属性测试

使用属性测试库（如 fast-check）验证通用属性：

1. **属性 5: 元素ID唯一性测试**

```javascript
// 生成随机的 DOM 结构，验证扫描后所有 ID 唯一
fc.assert(
  fc.property(fc.array(fc.htmlElement()), (elements) => {
    const result = getInteractables()
    const ids = result.map((e) => e.id)
    return new Set(ids).size === ids.length
  }),
)
```

2. **属性 7: 文本截取一致性测试**

```javascript
// 生成随机长度的文本，验证截取逻辑
fc.assert(
  fc.property(fc.string(), (text) => {
    const element = { innerText: text }
    const result = extractElementText(element)
    return text.length > 50 ? result.length === 50 : result.length === text.length
  }),
)
```

3. **属性 9: 指令转换完整性测试**

```javascript
// 生成随机的 ActionInstruction，验证转换后包含所有必需字段
fc.assert(
  fc.property(
    fc.record({
      type: fc.constantFrom('click', 'scroll'),
      id: fc.integer({ min: 1, max: 100 }),
    }),
    (instruction) => {
      const action = convertToAction(instruction)
      return action.type && action.selector && action.waitAfter !== undefined
    },
  ),
)
```

### 集成测试

集成测试验证完整的工作流程：

1. **端到端 Agent 流程测试**

   - 模拟用户输入 → 页面扫描 → AI 决策 → 操作执行
   - 验证每个步骤的输出符合预期
   - 测试错误场景的恢复机制

2. **对话界面集成测试**

   - 测试消息发送和接收的完整流程
   - 验证消息列表的更新和滚动
   - 测试对话历史的持久化

3. **ActionExecutor 集成测试**
   - 在测试页面上执行真实的点击、滚动操作
   - 验证操作的视觉反馈（高亮效果）
   - 测试操作失败时的错误处理

### 测试工具和框架

- **单元测试**: Vitest
- **属性测试**: fast-check
- **E2E 测试**: Playwright 或 Cypress
- **Mock 工具**: vitest/mock 用于模拟 AI API 响应

## 实现注意事项

### 性能优化

1. **页面扫描优化**

   - 使用 `requestIdleCallback` 在浏览器空闲时扫描
   - 缓存扫描结果，避免重复扫描
   - 限制扫描的元素数量（如最多100个）

2. **消息渲染优化**

   - 使用虚拟滚动处理大量消息
   - 延迟渲染非可见区域的消息
   - 使用 `v-memo` 优化 Vue 组件渲染

3. **AI 请求优化**
   - 实现请求去抖，避免频繁调用
   - 使用流式响应提升用户体验
   - 缓存常见操作的 AI 响应

### 安全考虑

1. **XSS 防护**

   - 对用户输入进行 HTML 转义
   - 使用 `v-html` 时确保内容已清理
   - 限制可执行的操作类型

2. **权限控制**

   - 某些敏感操作需要用户确认
   - 限制可访问的 DOM 范围
   - 记录所有自动化操作的日志

3. **数据隐私**
   - 不发送敏感页面内容到 AI 服务
   - 对话历史仅存储在本地
   - 提供清除历史记录的功能

### 可维护性

1. **代码组织**

   - 按功能模块划分文件结构
   - 使用 TypeScript 提供类型安全
   - 编写清晰的注释和文档

2. **配置管理**

   - 将 Prompt 模板提取为配置文件
   - 支持自定义 AI 服务端点
   - 提供调试模式开关

3. **日志和监控**
   - 记录关键操作的执行日志
   - 统计 AI 请求的成功率和耗时
   - 提供错误上报机制

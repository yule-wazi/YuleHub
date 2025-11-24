# 需求文档

## 简介

本功能旨在将现有的 AI Chat 功能集成到 Ava 浏览器助手组件中，使 Ava 能够作为一个浏览器自动化助手，通过对话界面与用户交互，分析页面元素并执行自动化操作。

## 术语表

- **Ava组件**: 一个可拖拽的浮动按钮组件，用于触发AI助手功能
- **Chat功能**: 现有的AI对话系统，支持消息展示、流式输出和语音合成
- **浏览器自动化**: 通过AI分析页面元素并执行点击、滚动等操作的能力
- **可交互元素**: 页面上可以被用户操作的DOM元素（按钮、链接、输入框等）
- **Agent**: AI代理，负责理解用户意图并执行相应的浏览器操作
- **MessageShow组件**: 用于展示单条对话消息的UI组件
- **流式输出**: AI响应以流的方式逐字输出，而非一次性返回完整内容

## 需求

### 需求 1

**用户故事:** 作为用户，我希望点击 Ava 按钮时能打开对话界面，以便与 AI 助手进行交互。

#### 验收标准

1. WHEN 用户点击 Ava 浮动按钮 THEN Ava组件 SHALL 展开对话框界面
2. WHEN 对话框已展开 THEN Ava组件 SHALL 显示关闭按钮以便用户关闭对话框
3. WHEN 用户拖拽 Ava 按钮超过100毫秒 THEN Ava组件 SHALL 不触发对话框展开操作
4. WHEN 对话框展开 THEN Ava组件 SHALL 在对话框中显示消息列表和输入区域
5. WHEN 对话框关闭 THEN Ava组件 SHALL 保留对话历史记录以便下次打开时继续查看

### 需求 2

**用户故事:** 作为用户，我希望在对话框中发送消息并接收 AI 回复，以便与浏览器自动化助手交流我的需求。

#### 验收标准

1. WHEN 用户在输入框中输入文本并按下回车键 THEN Ava组件 SHALL 将消息添加到对话列表中
2. WHEN 用户点击发送按钮 THEN Ava组件 SHALL 将输入框中的消息发送给AI并清空输入框
3. WHEN 用户发送空消息 THEN Ava组件 SHALL 阻止发送操作并保持当前状态
4. WHEN AI开始响应 THEN Ava组件 SHALL 在消息列表中创建新的AI消息条目
5. WHEN AI响应完成 THEN Ava组件 SHALL 自动滚动消息列表到底部以显示最新消息

### 需求 3

**用户故事:** 作为用户，我希望 AI 能够分析当前页面的可交互元素，以便理解页面结构并执行自动化操作。

#### 验收标准

1. WHEN 用户发送包含操作意图的消息 THEN Agent SHALL 扫描当前页面的所有可交互元素
2. WHEN Agent扫描页面 THEN Agent SHALL 为每个可交互元素分配唯一的ID标识
3. WHEN Agent识别可交互元素 THEN Agent SHALL 提取元素的标签名、文本内容、类名和角色属性
4. WHEN Agent完成页面扫描 THEN Agent SHALL 构建包含所有可交互元素信息的列表
5. WHEN 可交互元素列表为空 THEN Agent SHALL 通知用户当前页面没有可操作的元素

### 需求 4

**用户故事:** 作为用户，我希望 AI 能够理解我的操作需求并生成相应的执行指令，以便自动完成浏览器操作。

#### 验收标准

1. WHEN Agent接收到用户需求和页面元素列表 THEN Agent SHALL 调用AI服务分析用户意图
2. WHEN AI分析用户意图 THEN Agent SHALL 生成包含操作类型和目标元素ID的JSON格式指令
3. WHEN 用户需求是点击操作 THEN Agent SHALL 返回包含type为click和目标元素ID的指令
4. WHEN 用户需求是滚动操作 THEN Agent SHALL 返回包含type为scroll和目标元素ID的指令
5. WHEN AI无法理解用户需求 THEN Agent SHALL 在对话中请求用户提供更明确的指令

### 需求 5

**用户故事:** 作为用户，我希望 AI 生成的指令能够被正确执行，以便完成我想要的浏览器自动化任务。

#### 验收标准

1. WHEN Agent生成执行指令 THEN Agent SHALL 使用ActionExecutor执行该指令
2. WHEN 执行点击操作 THEN ActionExecutor SHALL 定位目标元素并触发点击事件
3. WHEN 执行滚动操作 THEN ActionExecutor SHALL 将目标元素滚动到可视区域
4. WHEN 操作执行成功 THEN Agent SHALL 在对话中通知用户操作已完成
5. WHEN 操作执行失败 THEN Agent SHALL 在对话中说明失败原因并建议替代方案

### 需求 6

**用户故事:** 作为用户，我希望对话消息能够清晰地展示，包括用户消息和 AI 回复的区分，以便更好地理解对话内容。

#### 验收标准

1. WHEN 消息是用户发送的 THEN MessageShow组件 SHALL 将消息显示在右侧并使用用户头像
2. WHEN 消息是AI回复的 THEN MessageShow组件 SHALL 将消息显示在左侧并使用AI头像
3. WHEN 显示消息内容 THEN MessageShow组件 SHALL 支持HTML格式化和特殊标记高亮
4. WHEN 用户启用对话高亮功能 THEN MessageShow组件 SHALL 对特殊内容应用颜色标记
5. WHEN 消息列表更新 THEN Ava组件 SHALL 自动滚动到最新消息位置

### 需求 7

**用户故事:** 作为系统，我需要准确地识别和标记页面上的可交互元素，以便 AI 能够基于这些元素做出正确的操作决策。

#### 验收标准

1. WHEN Agent扫描页面元素 THEN Agent SHALL 为每个可交互元素添加唯一的data-agent-id属性
2. WHEN 元素被标记 THEN Agent SHALL 确保data-agent-id在当前页面上是唯一的
3. WHEN 构建元素列表 THEN Agent SHALL 包含元素的tagName、text、className、role和id属性
4. WHEN 元素文本内容过长 THEN Agent SHALL 截取前50个字符以避免prompt过大
5. WHEN 页面动态更新 THEN Agent SHALL 能够重新扫描并更新元素标记

### 需求 8

**用户故事:** 作为系统，我需要将 AI 返回的 JSON 指令准确地解析并转换为 ActionExecutor 可执行的操作，以便正确完成用户的自动化任务。

#### 验收标准

1. WHEN AI返回操作指令 THEN Agent SHALL 验证JSON格式的有效性
2. WHEN 解析JSON指令 THEN Agent SHALL 提取actions数组中的所有操作项
3. WHEN 操作类型是click THEN Agent SHALL 构建包含type、selector和waitAfter参数的执行对象
4. WHEN 操作类型是scroll THEN Agent SHALL 构建包含type、selector和waitAfter参数的执行对象
5. WHEN JSON解析失败 THEN Agent SHALL 在对话中显示错误信息并请求AI重新生成指令

### 需求 9

**用户故事:** 作为系统，我需要在 AI 指令执行过程中提供清晰的反馈，以便用户了解操作的执行状态和结果。

#### 验收标准

1. WHEN Agent开始执行操作 THEN Agent SHALL 在对话中显示"正在执行操作..."的提示消息
2. WHEN 操作执行成功 THEN Agent SHALL 在对话中显示操作成功的确认消息和执行的具体内容
3. WHEN 操作执行失败 THEN Agent SHALL 在对话中显示错误信息和失败原因
4. WHEN 找不到目标元素 THEN Agent SHALL 提示用户元素可能已消失或页面已更新
5. WHEN 操作完成后页面发生变化 THEN Agent SHALL 提示用户可以继续发送新的指令

### 需求 10

**用户故事:** 作为开发者，我希望 Ava 组件能够复用现有的 Chat 功能代码，以便减少重复开发并保持功能一致性。

#### 验收标准

1. WHEN 实现消息展示功能 THEN Ava组件 SHALL 复用MessageShow组件的代码和样式
2. WHEN 调用AI服务 THEN Ava组件 SHALL 使用现有的postDZMMAgent函数
3. WHEN 处理消息格式化 THEN Ava组件 SHALL 使用formatSpecialOutput工具函数
4. WHEN 管理对话状态 THEN Ava组件 SHALL 使用Pinia store进行状态管理
5. WHEN 存储对话历史 THEN Ava组件 SHALL 使用myCache工具进行本地缓存

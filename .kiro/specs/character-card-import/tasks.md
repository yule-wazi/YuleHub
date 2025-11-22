# Implementation Tasks

本任务列表将角色卡导入功能的实现分解为可执行的步骤。每个任务都包含具体的实现目标和相关的需求引用。

## 任务概览

- **核心功能**: PNG 解析、数据映射、UI 集成
- **增强功能**: 世界书匹配系统重构
- **测试验证**: 单元测试、集成测试
- **文档完善**: 用户文档、开发者文档

---

- [x] 1. 创建 PNG 角色卡解析工具

  - 创建 `src/utils/parseCharacterCard.js` 文件
  - 实现 PNG 文件签名验证
  - 实现 PNG 数据块读取和解析
  - 实现 tEXt/iTXt 块的角色数据提取
  - 实现 JSON 和 Base64 解码逻辑
  - 实现版本识别（V1/V2/V3）和数据标准化
  - 添加详细的错误处理和日志输出
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2. 创建角色卡数据映射工具

  - 创建 `src/utils/mapCharacterCard.js` 文件
  - 实现基本信息映射函数（名称、头像、描述、开场白）
  - 实现描述字段组合逻辑（description + personality + scenario + mes_example）
  - 实现头像提取和转换（支持 URL 和 base64）
  - 实现备用开场白处理
  - 实现元数据提取（spec、creator、tags 等）
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 7.1, 7.2, 7.3, 7.4_

- [x] 3. 实现世界书数据映射

  - 在 `mapCharacterCard.js` 中实现世界书映射函数
  - 提取 character_book 或 lorebook 字段
  - 遍历并转换每个世界书条目
  - 映射基本属性（id、name、keys、secondaryKeys、content、enabled）
  - 映射核心属性（insertionOrder、depth、position、probability）
  - 映射标志属性（constant、selective、useProbability）
  - 映射高级属性（caseSensitive、matchWholeWords、useGroupScoring、excludeRecursion）
  - 映射组相关属性（group、groupWeight、groupOverride）
  - 映射其他属性（scanDepth、automationId、regex）
  - 实现位置代码映射逻辑（0-4 的数字代码）
  - 创建世界书对象结构（label + value 数组）
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12_

- [x] 4. 实现高级功能映射

  - 在 `mapCharacterCard.js` 中提取正则脚本数组
  - 映射正则脚本的所有属性（scriptName、findRegex、replaceString、placement 等）
  - 提取系统提示（system_prompt）
  - 提取历史后指令（post_history_instructions）
  - 提取创建者笔记（creator_notes）
  - 提取深度提示（depth_prompt）对象
  - 实现数据验证函数（validateCharacterCard）
  - 定义错误类型和错误代码
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 5. 重构世界书匹配系统 - 核心评分

  - 备份现有的 `src/utils/matchLoreBooks.js` 文件
  - 扩展 `matchLoreBooksEnhanced` 函数的配置选项
  - 实现增强的评分函数 `scoreEntry`
  - 支持常驻条目（constant）的高优先级处理
  - 支持大小写敏感匹配（caseSensitive）
  - 支持完整单词匹配（matchWholeWords）
  - 支持次要关键词（secondaryKeys）匹配（权重减半）
  - 支持正则表达式匹配（regex 数组）
  - 支持优先级加成（insertionOrder）
  - 支持选择性条目（selective）的分数调整
  - _Requirements: 10.1, 10.2, 10.6, 10.7, 10.8, 10.9, 10.12_

- [x] 6. 重构世界书匹配系统 - 高级特性

  - 实现概率过滤函数 `applyProbability`
  - 支持概率属性（probability 0-100）
  - 常驻条目忽略概率过滤
  - 实现位置注入函数 `injectByPosition`
  - 支持 5 种位置类型（0: 角色前, 1: 角色后, 2: AN顶部, 3: AN底部, 4: 指定深度）
  - 实现深度扫描配置（scanDepth）
  - 扩展 `buildHistoryCandidates` 函数支持 scanDepth
  - 支持组评分机制（useGroupScoring）
  - 支持递归排除（excludeRecursion）
  - 更新函数返回值以支持位置信息
  - _Requirements: 10.3, 10.4, 10.5, 10.10, 10.11, 10.13_

- [x] 7. 在 Chat.vue 中添加导入功能 UI

  - 在"添加角色卡"对话框中添加"导入角色卡 PNG"按钮
  - 创建隐藏的文件输入元素（accept=".png"）
  - 实现 `triggerImportPNG` 函数触发文件选择
  - 实现 `handlePNGImport` 函数处理文件上传
  - 添加加载提示（ElLoading）
  - 调用 `parsePNGCharacterCard` 解析文件
  - 调用 `validateCharacterCard` 验证数据
  - 调用 `mapToInternalFormat` 映射数据
  - 实现错误处理函数 `handleImportError`
  - 根据错误类型显示友好的错误消息
  - _Requirements: 1.1, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 8. 创建导入预览对话框

  - 在 Chat.vue 中创建预览对话框组件
  - 显示角色基本信息（名称、规范版本、创建者、创建日期）
  - 显示统计信息（世界书条目数、正则脚本数、备用开场白数）
  - 显示角色描述预览（前 200 字符）
  - 显示开场白预览（前 200 字符）
  - 显示正则脚本提示信息
  - 实现"确认导入"按钮功能
  - 实现"取消"按钮功能
  - 实现 `confirmImport` 函数填充表单数据
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [x] 9. 集成导入数据到现有系统

  - 在 `confirmImport` 函数中填充角色名称
  - 填充头像 URL
  - 填充角色描述
  - 填充开场白
  - 填充音色选择（如果有）
  - 处理世界书数据（添加到 addLoreBooksData）
  - 存储正则脚本数据
  - 存储高级提示词数据（systemPrompt、postHistoryInstructions、depthPrompt）
  - 存储元数据信息
  - 确保与现有手动添加功能兼容
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [x] 10. 更新 systemPrompt 函数集成高级提示词

  - 查看 `src/utils/systemPrompt.js` 文件
  - 扩展函数以支持 systemPrompt 参数
  - 扩展函数以支持 postHistoryInstructions 参数
  - 扩展函数以支持 depthPrompt 参数
  - 实现提示词的正确组合逻辑
  - 确保与现有提示词格式兼容
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 11.3_

- [x] 11. 更新对话逻辑使用增强的世界书匹配

  - 查找调用 `matchLoreBooks` 的位置
  - 更新为调用 `matchLoreBooksEnhanced`
  - 传递正确的配置选项（respectPriority、respectPosition 等）
  - 处理返回的位置信息
  - 根据位置属性在正确的位置注入世界书内容
  - 测试常驻条目始终显示
  - 测试概率过滤功能
  - 测试优先级排序
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.13, 11.2_

- [ ]\* 12. 编写单元测试

  - 创建 `tests/utils/parseCharacterCard.test.js`
  - 测试 V3 格式解析
  - 测试 V1/V2 格式解析
  - 测试 Base64 解码
  - 测试非 PNG 文件拒绝
  - 测试缺少角色数据的处理
  - 创建 `tests/utils/mapCharacterCard.test.js`
  - 测试基本信息映射
  - 测试世界书映射（所有属性）
  - 测试缺失字段的默认值处理
  - 创建 `tests/utils/matchLoreBooks.test.js`
  - 测试 insertionOrder 排序
  - 测试概率过滤
  - 测试常驻条目
  - 测试大小写敏感匹配
  - 测试完整单词匹配
  - 测试位置注入
  - _Requirements: 所有需求的验证_

- [x] 13. 进行集成测试和手动测试

  - 准备测试用的角色卡 PNG 文件（V1、V2、V3 各一个）
  - 测试完整导入流程（上传 → 解析 → 预览 → 确认 → 添加）
  - 测试导入后的角色在对话中正常工作
  - 测试世界书在对话中正确触发
  - 测试优先级、深度、位置等属性生效
  - 测试概率过滤功能
  - 测试常驻条目始终显示
  - 测试大小写敏感和完整单词匹配
  - 测试错误处理（非 PNG、损坏数据等）
  - 测试与现有手动添加功能的兼容性
  - 测试数据持久化（刷新页面后数据仍存在）
  - 测试性能（大型世界书、多个角色）
  - _Requirements: 所有需求的端到端验证_

- [x] 14. 优化和完善

  - 添加文件大小限制检查（10MB）
  - 添加 JSON 深度限制检查
  - 优化 PNG 块读取性能（早期退出）
  - 为世界书关键词建立索引（可选优化）
  - 添加图片压缩功能（可选）
  - 完善错误消息的中文翻译
  - 添加控制台调试日志
  - 优化预览对话框的样式
  - 添加加载动画和进度提示
  - 处理边界情况和异常数据
  - _Requirements: 性能和用户体验优化_

- [ ]\* 15. 编写用户文档

  - 创建用户使用指南
  - 说明如何导入角色卡
  - 说明支持的格式
  - 说明世界书的工作原理
  - 提供常见问题解答
  - 添加截图和示例
  - _Requirements: 用户文档需求_

- [ ]\* 16. 编写开发者文档
  - 创建 API 参考文档
  - 说明各个函数的用法
  - 提供代码示例
  - 说明如何扩展功能
  - 说明数据模型结构
  - 添加架构图和流程图
  - _Requirements: 开发者文档需求_

---

## 实现顺序建议

1. **第一阶段（核心功能）**: 任务 1-4（PNG 解析和数据映射）
2. **第二阶段（世界书增强）**: 任务 5-6（世界书匹配系统重构）
3. **第三阶段（UI 集成）**: 任务 7-9（界面和数据集成）
4. **第四阶段（系统集成）**: 任务 10-11（提示词和对话逻辑）
5. **第五阶段（测试验证）**: 任务 12-13（单元测试和集成测试）
6. **第六阶段（优化完善）**: 任务 14-16（性能优化和文档）

## 注意事项

- 每完成一个任务，立即进行基本的功能测试
- 保持代码风格与项目现有代码一致
- 及时提交代码，避免大量修改后才提交
- 遇到问题及时记录和反馈
- 优先实现核心功能，可选功能可以后续迭代

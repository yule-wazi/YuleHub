# Requirements Document

## Introduction

本功能旨在为 AI Chat 应用添加完整的 PNG 角色卡导入能力。用户可以通过上传包含角色数据的 PNG 图片文件，自动解析并导入角色的完整信息，包括基本设定、世界书（Lorebook）、正则脚本、高级提示词等。系统需要支持 Character Card V1/V2/V3 规范，并将解析后的数据映射到现有的角色管理系统中。

## Glossary

- **Character Card System**: 角色卡系统，负责管理和导入角色卡数据的整体功能模块
- **PNG Parser**: PNG 解析器，从 PNG 图片的元数据块中提取角色 JSON 数据的组件
- **Lorebook Mapper**: 世界书映射器，将角色卡中的世界书数据转换为应用内部格式的组件
- **Character Card**: 角色卡，包含 AI 角色完整信息的数据结构（嵌入在 PNG 图片中）
- **tEXt/iTXt Chunk**: PNG 图片中存储文本元数据的数据块类型
- **World Book Entry**: 世界书条目，包含关键词、内容和各种配置属性的知识单元
- **Regex Script**: 正则脚本，用于文本处理的正则表达式规则
- **Alternate Greeting**: 备用开场白，角色的多个可选首条消息

## Requirements

### Requirement 1: PNG 角色卡文件解析

**User Story:** 作为用户，我希望能够上传 PNG 格式的角色卡图片，系统自动提取其中的角色数据，这样我就可以快速导入预制的角色。

#### Acceptance Criteria

1. WHEN 用户在添加角色卡对话框中点击"导入角色卡 PNG"按钮, THE Character Card System SHALL 打开文件选择器并限制只能选择 .png 文件
2. WHEN 用户选择了一个 PNG 文件, THE PNG Parser SHALL 读取文件的二进制数据并验证 PNG 文件签名（137, 80, 78, 71, 13, 10, 26, 10）
3. WHEN PNG 文件签名验证失败, THE Character Card System SHALL 显示错误提示"非有效的 PNG 文件"
4. WHEN PNG 文件签名验证成功, THE PNG Parser SHALL 遍历所有数据块查找 tEXt 或 iTXt 类型的块
5. WHEN 找到 tEXt 或 iTXt 数据块, THE PNG Parser SHALL 提取其中 key 为 "chara"、"character"、"Character" 或 "data" 的数据
6. WHEN 提取到角色数据, THE PNG Parser SHALL 尝试直接解析为 JSON，如果失败则尝试 Base64 解码后再解析
7. IF JSON 解析失败, THEN THE Character Card System SHALL 显示错误提示"角色卡数据格式错误"
8. WHEN JSON 解析成功, THE Character Card System SHALL 将解析后的数据传递给后续处理流程

### Requirement 2: 角色卡版本识别与数据标准化

**User Story:** 作为开发者，我希望系统能够自动识别角色卡的版本（V1/V2/V3），并将不同版本的数据结构统一转换为标准格式，这样后续处理逻辑可以保持一致。

#### Acceptance Criteria

1. WHEN Character Card System 接收到解析后的 JSON 数据, THE Character Card System SHALL 检查 spec 字段是否为 "chara_card_v3"
2. IF spec 字段为 "chara_card_v3", THEN THE Character Card System SHALL 提取 data 字段作为核心数据，并记录版本信息（spec、spec_version、create_date）
3. IF spec 字段不是 "chara_card_v3", THEN THE Character Card System SHALL 将整个 JSON 对象作为核心数据，并标记版本为 "V1/V2"
4. WHEN 核心数据提取完成, THE Character Card System SHALL 确保 extensions 字段存在，如果不存在则创建空对象
5. THE Character Card System SHALL 将标准化后的数据存储在统一的数据结构中供后续使用

### Requirement 3: 基本角色信息映射

**User Story:** 作为用户，我希望导入角色卡后，角色的基本信息（名称、头像、描述、开场白等）能够自动填充到添加角色表单中，这样我可以直接使用或进行微调。

#### Acceptance Criteria

1. WHEN 角色卡数据标准化完成, THE Character Card System SHALL 提取 name 字段并填充到表单的"角色名"输入框
2. WHEN 角色卡包含头像数据, THE Character Card System SHALL 将头像转换为可用的 URL 并填充到"头像"输入框
3. WHEN 角色卡包含 description 字段, THE Character Card System SHALL 填充到"角色卡介绍"文本域
4. WHEN 角色卡包含 first_mes 字段, THE Character Card System SHALL 填充到"角色开场白"文本域
5. WHEN 角色卡包含 personality 字段, THE Character Card System SHALL 将其附加到角色描述中或存储为独立字段
6. WHEN 角色卡包含 scenario 字段, THE Character Card System SHALL 将其附加到角色描述中或存储为独立字段
7. WHEN 角色卡包含 mes_example 字段, THE Character Card System SHALL 将其存储为示例对话数据

### Requirement 4: 世界书数据导入与映射

**User Story:** 作为用户，我希望导入角色卡时，其中包含的世界书（Lorebook）能够自动转换为系统支持的格式，这样角色的背景知识可以在对话中正确触发。

#### Acceptance Criteria

1. WHEN 角色卡数据包含 character_book 或 lorebook 字段, THE Lorebook Mapper SHALL 提取该字段作为世界书数据源
2. WHEN 世界书数据源包含 entries 数组, THE Lorebook Mapper SHALL 遍历每个条目进行转换
3. FOR EACH 世界书条目, THE Lorebook Mapper SHALL 提取 keys 数组作为关键词列表
4. FOR EACH 世界书条目, THE Lorebook Mapper SHALL 提取 content 字段作为条目内容
5. FOR EACH 世界书条目, THE Lorebook Mapper SHALL 提取 id、comment、name 字段用于标识
6. FOR EACH 世界书条目, THE Lorebook Mapper SHALL 提取 enabled 字段（默认为 true）
7. FOR EACH 世界书条目, THE Lorebook Mapper SHALL 提取 insertion_order、priority、depth、position、probability 等核心属性
8. FOR EACH 世界书条目, THE Lorebook Mapper SHALL 提取 extensions 对象中的扩展属性（如 group、scan_depth、case_sensitive 等）
9. FOR EACH 世界书条目, THE Lorebook Mapper SHALL 提取 secondary_keys 数组（如果存在）
10. FOR EACH 世界书条目, THE Lorebook Mapper SHALL 提取 constant、selective 等布尔标志
11. WHEN 所有条目转换完成, THE Lorebook Mapper SHALL 创建一个新的世界书对象，包含原始名称和转换后的条目列表
12. WHEN 世界书对象创建完成, THE Character Card System SHALL 将其添加到角色的世界书配置中

### Requirement 5: 正则脚本提取与存储

**User Story:** 作为用户，我希望导入角色卡时，其中包含的正则脚本能够被识别并存储，以便未来实现文本处理功能时可以使用。

#### Acceptance Criteria

1. WHEN 角色卡的 extensions 对象包含 regex_scripts 数组, THE Character Card System SHALL 提取该数组
2. FOR EACH 正则脚本对象, THE Character Card System SHALL 提取 scriptName、findRegex、replaceString 字段
3. FOR EACH 正则脚本对象, THE Character Card System SHALL 提取 disabled、runOnEdit、placement 等配置字段
4. WHEN 正则脚本提取完成, THE Character Card System SHALL 将脚本数组存储在角色的扩展数据中
5. THE Character Card System SHALL 在界面上显示提示信息，告知用户已导入 N 个正则脚本（当前版本暂不执行）

### Requirement 6: 高级提示词导入

**User Story:** 作为用户，我希望导入角色卡时，高级提示词（如系统提示、历史后指令等）能够被正确提取并应用到对话中，这样角色的行为更加符合预期。

#### Acceptance Criteria

1. WHEN 角色卡包含 system_prompt 字段, THE Character Card System SHALL 提取并存储该系统提示
2. WHEN 角色卡包含 post_history_instructions 字段, THE Character Card System SHALL 提取并存储该历史后指令
3. WHEN 角色卡包含 creator_notes 字段, THE Character Card System SHALL 提取并存储创建者笔记
4. WHEN 角色卡的 extensions 包含 depth_prompt 对象, THE Character Card System SHALL 提取其 prompt、depth、role 字段
5. WHEN 高级提示词提取完成, THE Character Card System SHALL 将这些数据整合到角色的消息构建逻辑中

### Requirement 7: 备用开场白处理

**User Story:** 作为用户，我希望导入角色卡时，如果包含多个备用开场白，系统能够保存所有选项，这样我可以在不同场景下选择不同的开场方式。

#### Acceptance Criteria

1. WHEN 角色卡包含 alternate_greetings 数组, THE Character Card System SHALL 提取该数组
2. WHEN alternate_greetings 数组不为空, THE Character Card System SHALL 将所有备用开场白存储在角色数据中
3. THE Character Card System SHALL 在界面上提供选择器，允许用户选择使用哪个开场白作为默认
4. WHEN 用户未选择, THE Character Card System SHALL 使用 first_mes 作为默认开场白

### Requirement 8: 导入预览与确认

**User Story:** 作为用户，我希望在正式导入角色卡之前，能够预览解析出的所有信息，并有机会进行修改或取消导入，这样可以避免导入错误的数据。

#### Acceptance Criteria

1. WHEN 角色卡解析完成, THE Character Card System SHALL 在对话框中显示解析结果的预览
2. THE Character Card System SHALL 显示角色名称、描述、开场白的前 200 个字符
3. THE Character Card System SHALL 显示世界书条目数量和总关键词数量
4. THE Character Card System SHALL 显示正则脚本数量（如果有）
5. THE Character Card System SHALL 显示是否包含高级提示词的标识
6. THE Character Card System SHALL 提供"确认导入"和"取消"按钮
7. WHEN 用户点击"确认导入", THE Character Card System SHALL 将所有数据应用到表单并关闭预览
8. WHEN 用户点击"取消", THE Character Card System SHALL 清空解析数据并关闭预览

### Requirement 9: 错误处理与用户反馈

**User Story:** 作为用户，我希望在导入过程中遇到任何问题时，系统能够给出清晰的错误提示，这样我可以知道问题所在并采取相应措施。

#### Acceptance Criteria

1. WHEN 文件读取失败, THE Character Card System SHALL 显示错误消息"文件读取失败，请重试"
2. WHEN PNG 格式验证失败, THE Character Card System SHALL 显示错误消息"非有效的 PNG 文件"
3. WHEN 未找到角色数据块, THE Character Card System SHALL 显示错误消息"该 PNG 文件不包含角色卡数据"
4. WHEN JSON 解析失败, THE Character Card System SHALL 显示错误消息"角色卡数据格式错误，无法解析"
5. WHEN 必填字段缺失（如 name）, THE Character Card System SHALL 显示警告消息"角色卡缺少必要信息：角色名"
6. WHEN 导入成功, THE Character Card System SHALL 显示成功消息"角色卡导入成功！"
7. THE Character Card System SHALL 在控制台输出详细的调试信息，包括解析的原始数据和转换后的数据

### Requirement 10: 与现有系统集成

**User Story:** 作为开发者，我希望导入的角色卡数据能够无缝集成到现有的角色管理和对话系统中，这样用户可以立即使用导入的角色进行对话。

#### Acceptance Criteria

1. WHEN 角色卡导入完成, THE Character Card System SHALL 将角色数据添加到 agentStore.users 数组
2. WHEN 角色包含世界书, THE Character Card System SHALL 确保世界书数据与 matchLoreBooks 函数兼容
3. WHEN 角色包含系统提示, THE Character Card System SHALL 将其整合到 systemPrompt 函数的调用中
4. WHEN 角色添加到列表, THE Character Card System SHALL 自动选中新添加的角色并切换到对话界面
5. THE Character Card System SHALL 将导入的角色数据持久化到本地缓存（localStorage）
6. WHEN 应用重新加载, THE Character Card System SHALL 从缓存中恢复导入的角色数据

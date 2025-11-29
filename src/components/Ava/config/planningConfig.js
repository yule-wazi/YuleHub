/**
 * 任务规划 Prompt 模板
 */
export const PLANNING_PROMPT_TEMPLATE = `你是一个任务规划助手。请将用户的复杂需求分解为1-8个有序的子任务。

用户需求："{user_prompt}"

要求：
1. 每个子任务应该是一个独立的、可执行的原子操作
2. 识别子任务之间的依赖关系（如果任务B必须在任务A之后执行，则B依赖A）
3. 为每个子任务设定清晰的目标和预期结果
4. 识别关键词（"然后"、"接着"、"之后"、"并且"）作为任务分隔标记
5. 子任务数量必须在1-8个之间
6. 每个子任务只能包含一个操作类型（点击、输入、导航等）

请使用以下JSON格式返回（只返回JSON，不要其他文字）：
{
  "tasks": [
    {
      "id": "task-1",
      "description": "具体操作描述",
      "goal": "预期达成的目标",
      "dependencies": [],
      "estimatedSteps": 2
    }
  ]
}`

/**
 * 构建规划 Prompt
 */
export function buildPlanningPrompt(userPrompt) {
  return PLANNING_PROMPT_TEMPLATE.replace('{user_prompt}', userPrompt)
}

/**
 * 任务规划的 AI 配置
 */
export const planningConfig = {
  model: 'Qwen/Qwen2.5-7B-Instruct',
  messages: [
    {
      role: 'system',
      content: `你是一个任务规划专家。你的职责是将用户的复杂需求分解为清晰、可执行的子任务序列。

规则：
1. 每个子任务必须是独立的、原子的操作
2. 子任务数量必须在1-8个之间
3. 识别并标记任务之间的依赖关系
4. 为每个子任务设定明确的目标
5. 只返回JSON格式，不要其他文字`,
    },
  ],
  stream: false,
  max_tokens: 2048,
  temperature: 0.7,
  top_p: 0.9,
}

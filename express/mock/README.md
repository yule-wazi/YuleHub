# Video Mock 数据使用说明

## 快速开始

1. **启用/关闭Mock模式**：修改 `express/config/globalVar.js` 文件中的 `USE_MOCK` 值

   ```javascript
   // true = 使用mock数据，false = 使用数据库
   export const USE_MOCK = true
   ```

   也可以使用环境变量覆盖（优先级更高）：

   ```bash
   USE_MOCK=true node express/main.js
   USE_MOCK=false node express/main.js
   ```

2. **修改Mock数据**：编辑 `express/mock/video.mock.json` 文件，添加你的视频数据

## 数据格式说明

### 视频数据格式（videos数组中的每个对象）

```json
{
  "id": 1, // 视频ID（必填）
  "title": "视频标题", // 视频标题（必填）
  "author": "作者名", // 作者名称（必填）
  "authorImg": "作者头像URL", // 作者头像（可选）
  "videoSrc": "BV1xx411c7mD", // 视频源（B站BV号或URL）（必填）
  "videoImg": "封面图URL", // 视频封面图（可选，前端会自动填充默认图）
  "viewCount": 1000, // 浏览量（可选）
  "createAt": "2024-01-01", // 创建时间（可选）
  "desc": "视频描述", // 视频描述（可选）
  "labels": ["标签1", "标签2"] // 标签数组（可选，用于搜索）
}
```

## 支持的接口

Mock模式支持以下所有视频相关接口：

- `GET /video/list?page=1` - 获取视频列表（分页）
- `GET /video/search?keyword=xxx&page=1` - 搜索视频
- `GET /video/feed?limit=20` - 获取竖屏Feed列表
- `GET /video/author?name=xxx` - 获取作者信息（从videos中查找）

## 注意事项

1. Mock数据中的 `labels` 字段必须是数组格式
2. 如果 `videoImg` 为空，前端会自动填充默认图片
3. `videoSrc` 支持B站BV号（如 `BV1xx411c7mD`）或直接URL
4. 分页逻辑：每页默认返回20条数据（LIMITSIZE=20）

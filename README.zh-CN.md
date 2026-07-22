# Pixabay API Codex Skill

[English](README.md) | 简体中文

一个面向 Codex 的 Pixabay 搜索 Skill，以及无需额外依赖的 Node.js 命令行工具。它可以安全地搜索 Pixabay 图片和视频，并返回带有来源信息的精简结果。

## 功能

- 使用 URL 编码关键词搜索 Pixabay 图片和视频。
- 默认开启 SafeSearch，并在请求前校验常用筛选参数。
- 将成功的搜索结果缓存 24 小时，避免重复请求 API。
- 输出精简 JSON，包括作者、尺寸、预览链接、Pixabay 原始页面和来源标注。
- API Key 不写入源码、标准输出或缓存标识。
- 使用 Node.js 内置测试工具提供离线测试，无需联网即可验证基础功能。

## 环境要求

- Node.js 18 或更高版本。
- 通过环境变量 `PIXABAY_API_KEY` 提供的 Pixabay API Key。

## 安装为 Codex Skill

将此目录克隆或复制到 Codex 的 Skills 目录：

```powershell
Copy-Item -Recurse .\pixabay-api "$HOME\.codex\skills\pixabay-api"
```

安装后重启 Codex。随后即可通过 `$pixabay-api` 调用该 Skill 进行 Pixabay 搜索或集成开发。

## 使用命令行工具

在当前 PowerShell 会话中设置密钥：

```powershell
$env:PIXABAY_API_KEY = 'YOUR_API_KEY'
```

搜索横向照片：

```powershell
node scripts/search-pixabay.mjs --query 'blue mountains' --type image --image-type photo --orientation horizontal --per-page 5
```

搜索视频：

```powershell
node scripts/search-pixabay.mjs --query 'ocean waves' --type video --lang en --per-page 6
```

查看完整参数列表：

```powershell
node scripts/search-pixabay.mjs --help
```

## 输出与素材使用

命令行工具会将 JSON 写入标准输出。每一条结果都包含 Pixabay 原始页面和来源标注；展示或保存选中的素材时，请同时保留这些来源信息。

图片的 `previewUrl` 仅用于临时预览。请不要在应用中长期热链接 Pixabay 的图片 CDN 地址；若确认使用某项素材，应先下载并保存到你自己的合规存储位置。

## 安全建议

- 不要提交真实 API Key；默认已忽略 `.env` 文件。
- 为 Web 应用集成时，将 API 请求保留在服务端执行。
- 如果 API Key 出现在截图、提交记录、工单、聊天或公开文档中，请立刻轮换该密钥。
- 漏洞或凭据泄露的报告方式请参阅 [SECURITY.md](SECURITY.md)。

## 许可证与内容权利

本仓库暂未包含开源许可证。公开发布前，请根据你的复用和分发需求选择并添加合适的许可证。

Pixabay 素材受其适用的内容许可约束，且可能涉及人物肖像、商标、品牌或私人财产等第三方权利。请针对每个具体素材和用途自行确认合规性。

## 开发与测试

```powershell
npm test
npm run check
```

## 发布前检查清单

- [ ] 确认未追踪 `PIXABAY_API_KEY`、`.env` 文件或下载的私人素材。
- [ ] 根据你的发布意图添加开源许可证。
- [ ] 运行 `npm test` 与 `npm run check`。
- [ ] 在发布前查看 Pixabay 最新 API 条款和内容许可。

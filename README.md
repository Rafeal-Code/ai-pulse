# AI Pulse · AI 脉冲

一款为 Android / 桌面浏览器开发的轻量 AI 资讯卡片 PWA，无需 Android Studio。

## 目前能做什么

- 横向滑动新闻卡片、分类筛选、详情展开、点击查看来源
- 收藏/已读记录保存在浏览器本地
- 支持 Chrome 添加到手机桌面、全屏体验与离线缓存
- GitHub Actions 每约六小时采集 RSS，部署到免费 GitHub Pages
- 可选：配置 OpenAI 兼容模型接口，对新闻生成中文标题、摘要和关注点
- 没有配置 API KEY 也能显示新闻，但内容大多为英文 RSS 原文

> 注意：首次打开源代码，看到的是标记为「演示模式」的示例卡片，不代表正在提供实时资讯。部署并成功运行采集任务后，数据模式将显示为 `live`。

## 5 分钟本地预览

在电脑上解压 ZIP，进入仓库根目录：

```bash
cd ai-pulse
python -m http.server 8000 -d web
```

打开 http://localhost:8000 ，可以用浏览器 F12 手机模式查看。这里仅是演示数据。

## 免费部署到 GitHub Pages（推荐）

1. 在 GitHub 新建一个公开仓库，比如 `ai-pulse`。
2. 把这个文件夹的**全部内容**上传到仓库根目录，确保 `.github/workflows/publish.yml` 隐藏目录也在。
3. 打开仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。
4. 打开 **Actions → Collect AI news and deploy PWA → Run workflow**，手动触发第一次采集和部署。
5. 等工作流显示绿色勾号后，打开 **Settings → Pages** 里的地址，一般是 `https://用户名.github.io/ai-pulse/`。
6. 手机上用 Chrome 打开这个 HTTPS 地址，右上角 **⋮ → 安装应用 / 添加到主屏幕**。小米 HyperOS / 不同浏览器可能只生成桌面快捷方式，仍可使用。

自动采集计划：每天四次（UTC 00:20、06:20、12:20、18:20）。GitHub 定时任务可能延迟；公开仓库连续 60 天没有活动时，定时工作流可能被自动禁用。需要在 Actions 里重新启用或有仓库活动。

## 可选：启用 AI 中文摘要

在仓库 **Settings → Secrets and variables → Actions**：

**Secrets** 新建 `AI_API_KEY`，填模型服务端 API Key（不要写在网站 JS 里，也不要放到公开仓库）。

**Variables** 可新建：

- `AI_BASE_URL`：支持 OpenAI Chat Completions 的服务基址，例如 `https://api.openai.com/v1`，留空默认就是这个地址。
- `AI_MODEL`：例如 `gpt-4o-mini`，留空则使用这个默认值（视你的服务商是否支持）。

手动重新运行工作流。模型只会处理排序靠前的最多 18 条 RSS 资讯，失败时自动回退为原文。

**成本提醒**：GitHub Pages 通常适合免费公开个人项目，AI API 费用由你自己的服务商计费。不要把模型 Key 放到前端网页或 commit 中。

## 新闻源

OpenAI、Google DeepMind、Google AI、Hugging Face、Mistral AI、TechCrunch AI、The Verge AI、Simon Willison、arXiv cs.AI/cs.CL。见 `scripts/fetch_news.py`。某个 RSS 源拒绝请求不会阻塞所有其他来源。官方没有 RSS 的站点（例如 Anthropic）目前不直接抓取，属于之后可以扩展的功能。

## 核心结构

```
web/index.html          卡片 UI / 响应式页面
web/app.js              滑动、收藏、分类、本地缓存
web/news.json           初始演示数据；构建时由采集脚本覆盖
web/sw.js               离线 Service Worker
web/manifest.webmanifest 应用安装配置
web/icons/              192 / 512 安装图标
scripts/fetch_news.py   RSS 聚合、排序、去重、可选中文 AI 摘要
.github/workflows/publish.yml 自动采集并发布 GitHub Pages
```

## 已知限制和未来方向

1. RSS 对发布时间和内容提供程度不同：不保证 100% 覆盖昨天到现在的新闻，也不保证摘要准确；重大消息务必核实原文。
2. 收藏只保存在本机浏览器，当前版本没有账号同步与推送通知。
3. 手机端不需要配置 API Key；后台摘要配置只能在 GitHub 仓库完成。
4. 前端目前为单卡滑动，而非短视频式纵向滚动；将来可增加桌面小组件、阅读热度权重、新闻聚类、通知、APK 封装。

## 开发与个人使用

这是可以自由修改的个人学习项目基础版，没有账号、后台数据库或自定义域名要求。不要将抓取到的原文全文进行未经授权的转载；本项目只使用 RSS 提供的标题、简短摘要及源链接。

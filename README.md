# 周昕楠 · 个人作品集

中文 / English 个人作品集，纯 HTML、CSS、JavaScript，无需构建或服务端。

- 网站：<https://pppppzzz.github.io/xinnan-portfolio/>
- 仓库：<https://github.com/pppppzzz/xinnan-portfolio>

## 本地预览

在本目录运行：

```bash
python -m http.server 8000
```

打开 <http://localhost:8000/>。使用 HTTP 预览可正常检查媒体加载、剪贴板和音乐；入口为 `index.html`。

## 目录

```text
index.html / work.html / about.html / contact.html
assets/
  data/       中英文内容、项目、分类、贴纸和音乐配置
  css/        样式
  js/         页面交互、共享联系方式与音频管理
  media/
    works/    项目图片与缩略图
    video/    作品片花与首页封面帧
    audio/    Lobby Time
    portraits/ stickers/ cursors/
    tv-games/  电视外壳、旋钮、软垫、牌背与鹦鹉头
  fonts/      Archivo 字体与授权文件
  vendor/     本地 GSAP、ScrollTrigger、Lenis
video/封面vedio.mp4    首页视频，文件名保持原样
.github/workflows/pages.yml
```

项目内容集中在 `assets/data/`，修改图片引用时保留大小写及相对路径。无需将原始设计文件、开发记录、测试截图或依赖目录加入仓库。网页图片保持完整比例。

首页精选为纯文字录像带入口；作品页提供分类、横向滚轮、悬停预览、全部图片与大图浏览。个人页贴纸可拖动；首页末尾与独立联系页共用联系数据及掉落贴纸。音乐默认关闭，点击开启；有声视频优先播放。

个人页的复古电视包含接宠物、翻牌和工字型地图贪吃蛇三个频道。成绩纪录仅保存在当前标签页会话中；翻牌比较完成用时，其余游戏比较得分。换台、离屏或切后台暂停，返回后由用户继续。每次进入个人页都会重新准备游玩引导，同次停留只展示一次。鹦鹉头使用提供的 PNG，连续浅蓝身体按素材取色后用 Canvas 绘制，无额外游戏音轨。

内页左上方的返回入口使用同一标签页的站内导航记录，优先收起项目详情，再返回实际来源页。作品筛选、书签横向位置与页面纵向位置按浏览历史条目保存；直接打开分享链接时，详情返回列表，其他内页返回首页。

## 部署与更新

GitHub Pages 使用 GitHub Actions 发布。工作流只打包四个 HTML、`assets/` 和 `video/`，不发布 `.git`、README、开发工具或本地备份。`index.html` 位于产物根目录，全部媒体和脚本使用相对路径，可在 `/xinnan-portfolio/` 子路径加载。

修改并本地检查后：

```bash
git add index.html work.html about.html contact.html assets video
git commit -m "Update portfolio"
git push origin main
```

推送 `main` 会自动部署；在仓库 Actions 的 **Deploy portfolio to Pages** 查看结果，也可使用 Run workflow 手动重发。部署成功后刷新公开网址；若修改脚本或数据，同步更新 HTML 中相应的 `?v=` 缓存版本。

当前发布版本保留所有使用中的媒体，包括约53 MB的首页视频与真实 Lobby Time MP3。页面无 Node 依赖。私人开发记录、原始历史备份和闲置素材仅在本地保存；公开历史保留改动与提交说明，提交编号经过隐私清理。不要用 `git push --all` 或推送本地历史标签。

## 音乐署名与许可

“Lobby Time” Kevin MacLeod (incompetech.com)

Licensed under Creative Commons: By Attribution 4.0 License

- [官方曲目页面](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600054)
- [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

署名与授权链接也保留在网站音乐控件的信息按钮中。

Archivo 字体采用 SIL Open Font License，见 `assets/fonts/OFL.txt`。GSAP/ScrollTrigger 和 Lenis 保留各自原文件许可声明。作品图片、影像与设计版权归周昕楠及相应团队所有，不作为可自由复制的素材授权。

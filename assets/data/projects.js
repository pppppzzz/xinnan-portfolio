/* 项目数据（内容核心）。新增作品主要改这里，不必复制交互代码。
   字段说明：
   id            稳定项目ID（中英共用，勿改）
   title/ desc/ role  双语
   year          创作年份；未核实填 null，配 yearConfirmed:false（前端显示"待核实"）
   yearConfirmed false=占位/待核实
   yearStart/yearEnd 跨年项目的开始年和结束年；显示完整范围，按结束年排序
   productionStatus "produced"=已落地，与 normal/ongoing 独立；不改变录像带颜色
   themeYears    作品主题年代（仅裁金用，非创作年份）
   types[]       分类标签ID（见 categories.js），一个项目可多个；筛选不复制项目
   status        "normal" | "ongoing"(在制→脊背品红)
   cover         封面/脊背预览图
   media[]       { type:"image"|"video", src, prev, caption:{zh,en}, nature:{zh,en}, group? }
                 nature 标注真实性质（实物照片/建模过程/AI概念图·效果模拟/海报/分镜…）
   links[]       { label:{zh,en}, url, external:true }
   featured      是否上首页精选行
   order         同一结束年份内的原有相对顺序（越小越前）
*/
window.PROJECTS = [

  {
    id: "silent-bloom",
    title: { zh: "静默之绽：泰坦魔芋的记忆", en: "Silent Bloom: A Memory of the Titan Arum" },
    desc: {
      zh: "以泰坦魔芋短暂而罕见的绽放为灵感，将植物的层叠曲面转化为灯具造型。项目从 AI 概念探索出发，通过 ZBrush 建模、3D 打印与光影实验，尝试留住自然中容易被忽视的美。",
      en: "Inspired by the titan arum’s rare, fleeting bloom, this project translates its layered forms into a sculptural lamp. AI concept exploration, ZBrush modelling, 3D printing, and lighting experiments explore beauty in nature that is easily overlooked."
    },
    role: { zh: "独立完成：概念、建模、打印与光影实验", en: "Solo: concept, modelling, printing and lighting experiments" },
    year: 2025, yearConfirmed: true,
    types: ["installation"],
    status: "normal",
    cover: "assets/media/works/silent-bloom/result-lit-prev.jpg",
    media: [
      { type: "image", src: "assets/media/works/silent-bloom/result-lit.jpg", prev: "assets/media/works/silent-bloom/result-lit-prev.jpg", nature: { zh: "实物照片（点亮）", en: "Physical photo (lit)" }, caption: { zh: "点亮后的灯具", en: "The lamp lit" } },
      { type: "image", src: "assets/media/works/silent-bloom/result-white.jpg", prev: "assets/media/works/silent-bloom/result-white-prev.jpg", nature: { zh: "实物照片", en: "Physical photo" }, caption: { zh: "磨砂白 PLA 打印成品", en: "Matte-white PLA print" } },
      { type: "image", src: "assets/media/works/silent-bloom/result-gradient.jpg", prev: "assets/media/works/silent-bloom/result-gradient-prev.jpg", nature: { zh: "实物照片", en: "Physical photo" }, caption: { zh: "骨白与粉紫绿渐变材料", en: "Bone-white and gradient materials" } },
      { type: "video", src: "assets/media/video/silent-bloom.mp4", prev: "assets/media/works/silent-bloom/result-lit-prev.jpg", nature: { zh: "项目视频", en: "Project video" }, caption: { zh: "成果短片", en: "Result clip" } },
      { type: "image", src: "assets/media/works/silent-bloom/ai-concept-1.jpg", prev: "assets/media/works/silent-bloom/ai-concept-1-prev.jpg", nature: { zh: "AI概念图／效果模拟", en: "AI concept / simulation" }, caption: { zh: "AI 概念探索", en: "AI concept exploration" } },
      { type: "image", src: "assets/media/works/silent-bloom/ai-concept-2.jpg", prev: "assets/media/works/silent-bloom/ai-concept-2-prev.jpg", nature: { zh: "AI概念图／效果模拟", en: "AI concept / simulation" }, caption: { zh: "MJ 造型结合", en: "MJ form combination" } },
      { type: "image", src: "assets/media/works/silent-bloom/zbrush-1.jpg", prev: "assets/media/works/silent-bloom/zbrush-1-prev.jpg", nature: { zh: "建模过程", en: "Modelling process" }, caption: { zh: "ZBrush 建模与结构调整", en: "ZBrush modelling and structure" } },
      { type: "image", src: "assets/media/works/silent-bloom/zbrush-2.jpg", prev: "assets/media/works/silent-bloom/zbrush-2-prev.jpg", nature: { zh: "建模过程", en: "Modelling process" }, caption: { zh: "曲面与厚度调整", en: "Surface and thickness tuning" } }
    ],
    links: [],
    featured: true,
    order: 1
  },

  {
    id: "caijin",
    title: { zh: "裁金 1984—1993", en: "Cut of Fortune 1984–1993" },
    desc: {
      zh: "以 1992 年上海证券热潮为背景的实体互动装置：观众通过电话、茶杯与认购机做出选择。1984—1993 为作品主题年代，非创作年份。团队项目 / 阶段性展示。",
      en: "A physical interactive installation set against the 1992 Shanghai securities boom: visitors make choices via a landline, a teacup and a subscription terminal. 1984–1993 is the work’s thematic era, not its creation year. Team project / staged showcase."
    },
    role: {
      zh: "在团队协作中，主要负责项目的视觉设计，并借助 AI 辅助完成电话交互部分的 Arduino 组件编程与装置的最终组装。",
      en: "Within the team, I primarily worked on the project’s visual design and used AI assistance to complete the Arduino programming for the telephone interaction and the final assembly of the installation."
    },
    year: 2026, yearConfirmed: true,
    themeYears: { zh: "主题年代 1984—1993", en: "Thematic era 1984–1993" },
    types: ["installation", "web"],
    status: "normal",
    cover: "assets/media/works/caijin/caijin-main.jpg",
    media: [
      { type: "image", src: "assets/media/works/caijin/caijin-main.jpg", prev: "assets/media/works/caijin/caijin-main.jpg", nature: { zh: "现场实拍", en: "Event photograph" }, caption: { zh: "裁金装置全景", en: "Caijin installation overview" } },
      { type: "image", src: "assets/media/works/caijin/poster-2.jpg", prev: "assets/media/works/caijin/poster-2-prev.jpg", nature: { zh: "装置海报", en: "Installation poster" }, caption: { zh: "装置海报 2", en: "Installation poster 2" } },
      { type: "image", src: "assets/media/works/caijin/poster-3.jpg", prev: "assets/media/works/caijin/poster-3-prev.jpg", nature: { zh: "装置海报", en: "Installation poster" }, caption: { zh: "装置海报 3", en: "Installation poster 3" } },
      { type: "image", src: "assets/media/works/caijin/newspaper-1.jpg", prev: "assets/media/works/caijin/newspaper-1-prev.jpg", nature: { zh: "装置物料·报纸", en: "Installation material · newspaper" }, caption: { zh: "装置报纸设计 1", en: "Installation newspaper 1" }, zoom: true },
      { type: "image", src: "assets/media/works/caijin/newspaper-2.jpg", prev: "assets/media/works/caijin/newspaper-2-prev.jpg", nature: { zh: "装置物料·报纸", en: "Installation material · newspaper" }, caption: { zh: "装置报纸设计 2", en: "Installation newspaper 2" }, zoom: true },
      { type: "image", src: "assets/media/works/caijin/brochure.jpg", prev: "assets/media/works/caijin/brochure-prev.jpg", nature: { zh: "装置物料·三折页", en: "Installation material · tri-fold" }, caption: { zh: "装置三折页导览设计", en: "Installation tri-fold guide" }, zoom: true }
    ],
    links: [
      { label: { zh: "打开项目网站", en: "Visit Project Website" }, url: "https://pppppzzz.github.io/caijin-1984-1993/", external: true }
    ],
    featured: true,
    order: 2
  },

  {
    id: "four-am",
    title: { zh: "凌晨四点之外", en: "Beyond Four AM" },
    desc: {
      zh: "短片《凌晨四点之外》：报时与记忆的视觉探索。含海报、15 秒片花与完整影片。",
      en: "Short film “Beyond Four AM”: a visual exploration of timekeeping and memory. Includes poster, 15-second teaser and full film."
    },
    role: { zh: "海报版式与视觉整合；AI 影像剪辑", en: "Poster layout and visual integration; AI footage editing" },
    year: 2026, yearConfirmed: true,
    types: ["film"],
    status: "normal",
    cover: "assets/media/works/four-am/poster-prev.jpg",
    media: [
      { type: "image", src: "assets/media/works/four-am/poster.jpg", prev: "assets/media/works/four-am/poster-prev.jpg", nature: { zh: "海报", en: "Poster" }, caption: { zh: "《凌晨四点之外》海报", en: "“Beyond Four AM” poster" } },
      { type: "video", src: "assets/media/video/four-am-teaser.mp4", prev: "assets/media/works/four-am/poster-prev.jpg", nature: { zh: "片花", en: "Teaser" }, caption: { zh: "15 秒片花", en: "15-second teaser" } }
    ],
    links: [
      { label: { zh: "观看完整影片", en: "Watch Full Film" }, url: "https://3.cn/36yx0-fH", external: true }
    ],
    featured: true,
    order: 3
  },

  {
    id: "jagermeister",
    title: { zh: "野格《一碰就出界》", en: "Jägermeister · One Touch, Out of Bounds" },
    desc: {
      zh: "野格《一碰就出界》竖屏广告影像。参与创意构思与镜头画面方案，分镜用于前期视觉叙事规划。",
      en: "Jägermeister “One Touch, Out of Bounds” ad film in vertical format. Contributed to concept development and shot plans, using storyboards to plan the visual narrative."
    },
    role: { zh: "参与创意构思与镜头画面方案", en: "Contributed to concept development and shot plans" },
    year: 2026, yearConfirmed: true,
    types: ["film"],
    status: "normal",
    cover: "assets/media/works/jagermeister/cover-prev.jpg",
    media: [
      { type: "image", src: "assets/media/works/jagermeister/cover.jpg", prev: "assets/media/works/jagermeister/cover-prev.jpg", nature: { zh: "剧照", en: "Still" }, caption: { zh: "《一碰就出界》剧照", en: "“One Touch, Out of Bounds” still" } }
    ],
    links: [
      { label: { zh: "观看影片", en: "Watch Film" }, url: "https://v.douyin.com/nFIO-8CE-7s/", external: true }
    ],
    featured: false,
    order: 4
  },

  {
    id: "relic-posters",
    title: { zh: "器以载魂 · 非遗器物拟人海报", en: "Vessels with Souls · Cultural Character Posters" },
    desc: {
      zh: "非遗器物拟人海报系列选作。AIGC 辅助角色造型探索，版式与视觉整合由本人完成。",
      en: "Selected cultural-relic character posters. AIGC-assisted character exploration; layout and visual integration by me."
    },
    role: { zh: "版式与视觉整合（AIGC 辅助造型）", en: "Layout and visual integration (AIGC-assisted forms)" },
    year: 2026, yearConfirmed: true,
    types: ["visual"],
    status: "normal",
    cover: "assets/media/works/relic-posters/p1-prev.jpg",
    media: [
      { type: "image", src: "assets/media/works/relic-posters/p1.jpg", prev: "assets/media/works/relic-posters/p1-prev.jpg", nature: { zh: "海报", en: "Poster" }, caption: { zh: "宣传海报 1", en: "Poster 1" } },
      { type: "image", src: "assets/media/works/relic-posters/p2.jpg", prev: "assets/media/works/relic-posters/p2-prev.jpg", nature: { zh: "海报", en: "Poster" }, caption: { zh: "宣传海报 2", en: "Poster 2" } },
      { type: "image", src: "assets/media/works/relic-posters/p3.jpg", prev: "assets/media/works/relic-posters/p3-prev.jpg", nature: { zh: "海报", en: "Poster" }, caption: { zh: "宣传海报 3", en: "Poster 3" } },
      { type: "image", src: "assets/media/works/relic-posters/p4.jpg", prev: "assets/media/works/relic-posters/p4-prev.jpg", nature: { zh: "海报", en: "Poster" }, caption: { zh: "宣传海报 4", en: "Poster 4" } },
      { type: "image", src: "assets/media/works/relic-posters/p5.jpg", prev: "assets/media/works/relic-posters/p5-prev.jpg", nature: { zh: "海报", en: "Poster" }, caption: { zh: "宣传海报 5", en: "Poster 5" } },
      { type: "image", src: "assets/media/works/relic-posters/p6.jpg", prev: "assets/media/works/relic-posters/p6-prev.jpg", nature: { zh: "海报", en: "Poster" }, caption: { zh: "宣传海报 6", en: "Poster 6" } },
      { type: "image", src: "assets/media/works/relic-posters/p7.jpg", prev: "assets/media/works/relic-posters/p7-prev.jpg", nature: { zh: "海报", en: "Poster" }, caption: { zh: "宣传海报 7", en: "Poster 7" } },
      { type: "image", src: "assets/media/works/relic-posters/p8.jpg", prev: "assets/media/works/relic-posters/p8-prev.jpg", nature: { zh: "海报", en: "Poster" }, caption: { zh: "宣传海报 8", en: "Poster 8" } }
    ],
    links: [],
    featured: false,
    order: 5
  },

  {
    id: "fan-visuals",
    title: { zh: "饭圈视觉设计（合集）", en: "Fan Community Visual Design (Collection)" },
    desc: {
      zh: "饭圈美工设计合集：易拉宝、大王扇与御守（亚克力吊牌）。按分组浏览。",
      en: "Fan-merch design collection: roll-up banners, uchiwa fans and omamori (acrylic tags). Browse by group."
    },
    role: { zh: "独立完成", en: "Solo" },
    year: 2026, yearConfirmed: true,
    types: ["visual"],
    status: "normal",
    productionStatus: "produced",
    cover: "assets/media/works/fan-visuals/banner-preview-6-prev.jpg",
    media: [
      { type: "image", group: "banner", src: "assets/media/works/fan-visuals/banner-preview-1.jpg", prev: "assets/media/works/fan-visuals/banner-preview-1-prev.jpg", nature: { zh: "设计预览", en: "Design preview" }, caption: { zh: "易拉宝 1 预览", en: "Banner 1 preview" } },
      { type: "image", group: "banner", src: "assets/media/works/fan-visuals/banner-preview-2.jpg", prev: "assets/media/works/fan-visuals/banner-preview-2-prev.jpg", nature: { zh: "设计预览", en: "Design preview" }, caption: { zh: "易拉宝 2 预览", en: "Banner 2 preview" } },
      { type: "image", group: "banner", src: "assets/media/works/fan-visuals/banner-preview-3.jpg", prev: "assets/media/works/fan-visuals/banner-preview-3-prev.jpg", nature: { zh: "设计预览", en: "Design preview" }, caption: { zh: "易拉宝 3 预览", en: "Banner 3 preview" } },
      { type: "image", group: "banner", src: "assets/media/works/fan-visuals/banner-preview-5.jpg", prev: "assets/media/works/fan-visuals/banner-preview-5-prev.jpg", nature: { zh: "设计预览", en: "Design preview" }, caption: { zh: "易拉宝 5 预览", en: "Banner 5 preview" } },
      { type: "image", group: "banner", src: "assets/media/works/fan-visuals/banner-preview-6.jpg", prev: "assets/media/works/fan-visuals/banner-preview-6-prev.jpg", nature: { zh: "设计预览", en: "Design preview" }, caption: { zh: "易拉宝 6 预览", en: "Banner 6 preview" } },
      { type: "image", group: "banner", src: "assets/media/works/fan-visuals/banner-preview-7.jpg", prev: "assets/media/works/fan-visuals/banner-preview-7-prev.jpg", nature: { zh: "设计预览", en: "Design preview" }, caption: { zh: "易拉宝 7 预览", en: "Banner 7 preview" } },
      { type: "image", group: "fan", src: "assets/media/works/fan-visuals/fan-1.jpg", prev: "assets/media/works/fan-visuals/fan-1-prev.jpg", nature: { zh: "设计预览", en: "Design preview" }, caption: { zh: "大王扇 1", en: "Fan 1" } },
      { type: "image", group: "fan", src: "assets/media/works/fan-visuals/fan-2.jpg", prev: "assets/media/works/fan-visuals/fan-2-prev.jpg", nature: { zh: "设计预览", en: "Design preview" }, caption: { zh: "大王扇 2", en: "Fan 2" } },
      { type: "image", group: "fan", src: "assets/media/works/fan-visuals/fan-3.jpg", prev: "assets/media/works/fan-visuals/fan-3-prev.jpg", nature: { zh: "设计预览", en: "Design preview" }, caption: { zh: "大王扇 3", en: "Fan 3" } },
      { type: "image", group: "fan", src: "assets/media/works/fan-visuals/fan-4.jpg", prev: "assets/media/works/fan-visuals/fan-4-prev.jpg", nature: { zh: "设计预览", en: "Design preview" }, caption: { zh: "大王扇 4", en: "Fan 4" } },
      { type: "image", group: "omamori", src: "assets/media/works/fan-visuals/omamori-1.jpg", prev: "assets/media/works/fan-visuals/omamori-1-prev.jpg", nature: { zh: "设计预览", en: "Design preview" }, caption: { zh: "御守 1", en: "Omamori 1" } },
      { type: "image", group: "omamori", src: "assets/media/works/fan-visuals/omamori-2.jpg", prev: "assets/media/works/fan-visuals/omamori-2-prev.jpg", nature: { zh: "设计预览", en: "Design preview" }, caption: { zh: "御守 2", en: "Omamori 2" } }
    ],
    groups: [
      { id: "banner",  zh: "易拉宝", en: "Roll-up Banners" },
      { id: "fan",     zh: "大王扇", en: "Uchiwa Fans" },
      { id: "omamori", zh: "御守／吊牌", en: "Omamori / Tags" }
    ],
    links: [],
    featured: false,
    order: 6
  },

  {
    id: "xiaojin-suzhou",
    title: { zh: "小金宣传片 · 苏州（金鸡湖）篇", en: "Xiaojin Promo · Suzhou (Jinji Lake)" },
    desc: { zh: "小金宣传片苏州（金鸡湖）篇的画面方案，围绕镜头节奏、景别与场景衔接展开。展示分镜阶段的两页设计稿。", en: "Shot plans for the Xiaojin Suzhou (Jinji Lake) promo, focusing on pacing, shot scale and scene transitions. Two pages from the storyboarding stage are shown." },
    role: { zh: "前期画面设计", en: "Pre-production shot design" },
    year: 2026, yearConfirmed: true,
    types: ["film"],
    status: "normal",
    cover: "assets/media/works/xiaojin-suzhou/b1-prev.jpg",
    media: [
      { type: "image", src: "assets/media/works/xiaojin-suzhou/b1.jpg", prev: "assets/media/works/xiaojin-suzhou/b1-prev.jpg", nature: { zh: "前期画面设计稿", en: "Pre-production shot artwork" }, caption: { zh: "画面方案 1", en: "Shot plan 1" }, zoom: true },
      { type: "image", src: "assets/media/works/xiaojin-suzhou/b2.jpg", prev: "assets/media/works/xiaojin-suzhou/b2-prev.jpg", nature: { zh: "前期画面设计稿", en: "Pre-production shot artwork" }, caption: { zh: "画面方案 2", en: "Shot plan 2" }, zoom: true }
    ],
    links: [ { label: { zh: "观看成片", en: "Watch Final" }, url: "https://xhslink.cn/o/6hD4lnf2zWr", external: true } ],
    featured: false, order: 7
  },

  {
    id: "xiaojin-xihu",
    title: { zh: "小金宣传片 · 西湖篇", en: "Xiaojin Promo · West Lake" },
    desc: { zh: "小金宣传片西湖篇的前期画面设计，展示分镜阶段的两页设计稿。", en: "Pre-production shot design for the Xiaojin West Lake promo. Two pages from the storyboarding stage are shown." },
    role: { zh: "前期画面设计", en: "Pre-production shot design" },
    year: 2026, yearConfirmed: true,
    types: ["film"],
    status: "normal",
    cover: "assets/media/works/xiaojin-xihu/b1-prev.jpg",
    media: [
      { type: "image", src: "assets/media/works/xiaojin-xihu/b1.jpg", prev: "assets/media/works/xiaojin-xihu/b1-prev.jpg", nature: { zh: "前期画面设计稿", en: "Pre-production shot artwork" }, caption: { zh: "画面方案 1", en: "Shot plan 1" }, zoom: true },
      { type: "image", src: "assets/media/works/xiaojin-xihu/b2.jpg", prev: "assets/media/works/xiaojin-xihu/b2-prev.jpg", nature: { zh: "前期画面设计稿", en: "Pre-production shot artwork" }, caption: { zh: "画面方案 2", en: "Shot plan 2" }, zoom: true }
    ],
    links: [ { label: { zh: "观看成片", en: "Watch Final" }, url: "https://xhslink.cn/o/7VUm84sD9SY", external: true } ],
    featured: false, order: 8
  },

  {
    id: "ad-pjzj",
    title: { zh: "商业广告 · 披荆斩棘的哥哥", en: "Commercial · Call Me by Fire" },
    desc: { zh: "《披荆斩棘的哥哥》广告的镜头构思与画面方案。展示分镜阶段的前期设计稿。", en: "Shot ideas and visual plans for the “Call Me by Fire” commercial. Pre-production artwork from the storyboarding stage is shown." },
    role: { zh: "参与广告镜头构思与画面方案", en: "Contributed to shot ideas and visual plans" },
    year: 2026, yearConfirmed: true,
    types: ["film"],
    status: "normal",
    cover: "assets/media/works/ad-pjzj/b1-prev.jpg",
    media: [
      { type: "image", src: "assets/media/works/ad-pjzj/b1.jpg", prev: "assets/media/works/ad-pjzj/b1-prev.jpg", nature: { zh: "前期画面设计稿", en: "Pre-production shot artwork" }, caption: { zh: "广告画面方案", en: "Ad shot plan" }, zoom: true }
    ],
    links: [], featured: false, order: 9
  },

  {
    id: "ad-qianwen",
    title: { zh: "千问 App 广告", en: "Qwen App Ad" },
    desc: { zh: "千问 App 广告的前期画面方案，展示分镜阶段的设计稿。", en: "Pre-production shot plans for the Qwen app ad, shown through artwork from the storyboarding stage." },
    role: { zh: "前期画面设计", en: "Pre-production shot design" },
    year: 2026, yearConfirmed: true,
    types: ["film"],
    status: "normal",
    cover: "assets/media/works/ad-qianwen/b1-prev.jpg",
    media: [
      { type: "image", src: "assets/media/works/ad-qianwen/b1.jpg", prev: "assets/media/works/ad-qianwen/b1-prev.jpg", nature: { zh: "前期画面设计稿", en: "Pre-production shot artwork" }, caption: { zh: "千问 App 广告画面方案", en: "Qwen app ad shot plan" }, zoom: true }
    ],
    links: [], featured: false, order: 10
  },

  {
    id: "pingtan-im",
    title: { zh: "平潭IM两岸青年影展海报", en: "Pingtan IM Cross-Strait Youth Film Festival Poster" },
    desc: { zh: "平潭IM两岸青年影展海报。", en: "Poster for the Pingtan IM Cross-Strait Youth Film Festival." },
    role: { zh: "海报设计", en: "Poster design" },
    year: 2026, yearConfirmed: true,
    types: ["visual"],
    status: "normal",
    cover: "assets/media/works/pingtan-im/poster-prev.jpg",
    media: [
      { type: "image", src: "assets/media/works/pingtan-im/poster.jpg", prev: "assets/media/works/pingtan-im/poster-prev.jpg", nature: { zh: "海报", en: "Poster" }, caption: { zh: "影展海报", en: "Festival poster" } }
    ],
    links: [], featured: false, order: 11
  },

  {
    id: "student-union",
    title: { zh: "校学生会换届大会海报", en: "Student Union Election Congress Poster" },
    desc: { zh: "校学生会换届大会海报。", en: "Poster for the student union election congress." },
    role: { zh: "海报设计", en: "Poster design" },
    year: 2025, yearConfirmed: true,
    types: ["visual"],
    status: "normal",
    cover: "assets/media/works/student-union/poster-prev.jpg",
    media: [
      { type: "image", src: "assets/media/works/student-union/poster.jpg", prev: "assets/media/works/student-union/poster-prev.jpg", nature: { zh: "海报", en: "Poster" }, caption: { zh: "换届大会海报", en: "Election congress poster" } }
    ],
    links: [], featured: false, order: 12
  },

  {
    id: "underground-idol",
    title: { zh: "地下偶像招募海报", en: "Underground Idol Recruitment Poster" },
    desc: { zh: "地下偶像招募海报。", en: "Recruitment poster for an underground idol group." },
    role: { zh: "海报设计", en: "Poster design" },
    year: 2025, yearConfirmed: true,
    types: ["visual"],
    status: "normal",
    cover: "assets/media/works/underground-idol/poster-prev.jpg",
    media: [
      { type: "image", src: "assets/media/works/underground-idol/poster.jpg", prev: "assets/media/works/underground-idol/poster-prev.jpg", nature: { zh: "海报", en: "Poster" }, caption: { zh: "招募海报", en: "Recruitment poster" } }
    ],
    links: [], featured: false, order: 13
  },

  {
    id: "ja-ip",
    title: { zh: "JA 学生公司 IP", en: "JA Student Company IP" },
    desc: { zh: "JA 学生公司角色形象及品牌应用探索。团队获最佳产品奖、2023 JA 中国学生公司大赛营销特别奖，并入围全国赛。", en: "Character and brand application exploration for a JA student company. The team received the Best Product Award and was a national competition finalist. It also received the Marketing Special Award at the 2023 JA China Student Company Competition." },
    role: { zh: "角色形象及品牌应用探索", en: "Character and brand application exploration" },
    year: null, yearStart: 2022, yearEnd: 2023, yearConfirmed: true,
    types: ["visual"],
    status: "normal",
    cover: "assets/media/works/ja-ip/ja-best-product-award-prev.jpg",
    media: [
      { type: "image", src: "assets/media/works/ja-ip/cover.jpg", prev: "assets/media/works/ja-ip/cover-prev.jpg", nature: { zh: "品牌视觉", en: "Brand visual" }, caption: { zh: "角色与品牌应用", en: "Character and brand application" } },
      { type: "image", src: "assets/media/works/ja-ip/ja-product-display.jpg", prev: "assets/media/works/ja-ip/ja-product-display-prev.jpg", nature: { zh: "现场实拍", en: "Event photograph" }, caption: { zh: "商品与摊位展示", en: "Product and booth display" } },
      { type: "image", src: "assets/media/works/ja-ip/ja-popup-booth.jpg", prev: "assets/media/works/ja-ip/ja-popup-booth-prev.jpg", nature: { zh: "现场实拍", en: "Event photograph" }, caption: { zh: "快闪店现场", en: "Pop-up booth" } },
      { type: "image", src: "assets/media/works/ja-ip/ja-campus-booth.jpg", prev: "assets/media/works/ja-ip/ja-campus-booth-prev.jpg", nature: { zh: "现场实拍", en: "Event photograph" }, caption: { zh: "校园摊位现场", en: "Campus booth" } },
      { type: "image", src: "assets/media/works/ja-ip/ja-best-product-award.jpg", prev: "assets/media/works/ja-ip/ja-best-product-award-prev.jpg", nature: { zh: "现场实拍", en: "Event photograph" }, caption: { zh: "团队最佳产品奖合影", en: "Team photo with the Best Product Award" } },
      { type: "image", src: "assets/media/works/ja-ip/ja-finalist-team.jpg", prev: "assets/media/works/ja-ip/ja-finalist-team-prev.jpg", nature: { zh: "现场实拍", en: "Event photograph" }, caption: { zh: "全国赛入围团队合影", en: "National competition finalist team" } },
      { type: "image", src: "assets/media/works/ja-ip/ja-competition-team.jpg", prev: "assets/media/works/ja-ip/ja-competition-team-prev.jpg", nature: { zh: "现场实拍", en: "Event photograph" }, caption: { zh: "2023 JA 中国学生公司大赛合影", en: "Team photo at the 2023 JA China Student Company Competition" } }
    ],
    links: [], featured: false, order: 14
  }
];

/* 首页与作品页共用年份格式与排序；背景年代 themeYears 不参与比较。 */
window.PROJECT_DATA = {
  endYear: function (p) {
    if (!p.yearConfirmed) return -Infinity;
    return Number.isInteger(p.yearEnd) ? p.yearEnd : (Number.isInteger(p.year) ? p.year : -Infinity);
  },
  formatYear: function (p) {
    if (!p.yearConfirmed) return null;
    if (Number.isInteger(p.yearStart) && Number.isInteger(p.yearEnd) && p.yearEnd >= p.yearStart)
      return p.yearStart === p.yearEnd ? String(p.yearStart) : p.yearStart + "—" + p.yearEnd;
    return Number.isInteger(p.year) ? String(p.year) : null;
  },
  sorted: function (list) {
    return (list || window.PROJECTS || []).slice().sort(function (a, b) {
      var aYear = window.PROJECT_DATA.endYear(a), bYear = window.PROJECT_DATA.endYear(b);
      return aYear !== bYear ? bYear - aYear : (a.order || 0) - (b.order || 0);
    });
  }
};

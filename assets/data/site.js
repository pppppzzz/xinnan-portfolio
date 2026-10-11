/* 站点级配置：导航、语言、个人固定文案、联系方式、首页视频、BGM、页脚。
   修改文案/联系方式/视频/音乐只需改这里，无需改交互代码。 */
window.SITE = {
  defaultLang: "zh",

  brand: { zh: "周昕楠", en: "Xinnan Zhou" },

  nav: [
    { id: "home",    zh: "首页",     en: "Home",    href: "index.html"   },
    { id: "work",    zh: "作品",     en: "Work",    href: "work.html"    },
    { id: "about",   zh: "关于我",   en: "About",   href: "about.html"   },
    { id: "contact", zh: "联系方式", en: "Contact", href: "contact.html" }
  ],

  /* 固定个人文案（原样使用，勿扩写） */
  copy: {
    tagline: {
      zh: "在影像、设计和生活之间，收集有趣的可能。",
      en: "Finding possibilities in film, design, and everyday life."
    },
    directions: {
      zh: "视觉设计 · 交互叙事 · 影像创作",
      en: "Visual Design · Interactive Storytelling · Filmmaking"
    },
    bio: {
      zh: [
        "就读于上海视觉艺术学院艺术与科技专业，创作涉及视觉设计、交互叙事与影像。",
        "曾参与 AI 影视项目的创意、分镜设计、视觉资产与影像制作，也有品牌与 IP 设计经历。",
        "关注画面中的故事，以及叙事如何通过空间、物件和互动被体验。实体互动装置的探索围绕心理与人际关系展开，尝试将抽象概念转化为可参与的规则。"
      ],
      en: [
        "Studying Art and Technology at Shanghai Institute of Visual Arts, with creative work spanning visual design, interactive storytelling, and film.",
        "Experience in concepts, storyboard design, visual assets, and production for AI film projects, as well as brand and IP design.",
        "A focus on stories within images and how narrative is experienced through spaces, objects, and interaction. Explorations of physical interactive installations centre on psychology and interpersonal relationships, turning abstract concepts into rules that invite participation."
      ]
    },
    hobbies: {
      zh: "创作之外：音乐、追星、旅行、摄影、跳舞、cosplay、养小动物。",
      en: "Beyond creative work: music, following favourite artists, travel, photography, dance, cosplay, and caring for pets."
    },
    footer: { zh: "谢谢你来逛逛。", en: "Thanks for stopping by." }
  },

  /* 联系方式：仅公开邮箱+电话（已确认）。学号等一律不出现。社交账号未提供→不显示。 */
  contact: {
    email: "2900520853@qq.com",
    phone: "15121173380",
    socials: []   // 例：{ id:"instagram", label:"Instagram", url:"https://..." }
  },

  /* 首页本人提供的封面视频；音轨直接随视频播放，不使用独立BGM。 */
  hero: {
    video: "video/封面vedio.mp4",
    poster: "assets/media/video/hero-poster.jpg",
    titleTop: { zh: "来都来了", en: "YOU’RE HERE ALREADY" },
    titleBottom: { zh: "看一眼嘛", en: "TAKE A PEEK" },
    scrollHint: { zh: "往下翻翻，有点东西 ↓", en: "SCROLL DOWN, THERE’S GOOD STUFF ↓" }
  },

  /* 首页后续入口；标题/封面/分类由原项目记录读取，勿在此重复项目事实。 */
  home: {
    featuredIds: ["caijin", "four-am", "ja-ip"],
    featuredTitle: { zh: "精选作品", en: "SELECTED WORK" },
    allWork: { zh: "看看全部作品 →", en: "SEE ALL WORK →" },
    aboutTitle: { zh: "顺便认识一下嘛", en: "LET’S GET ACQUAINTED" },
    aboutDescription: { zh: "音乐、追星、旅行、摄影、跳舞、cosplay、养小动物。", en: "Music, fandom, travel, photography, dance, cosplay, and caring for little animals." },
    aboutLink: { zh: "认识一下 →", en: "A LITTLE ABOUT ME →" },
    contactTitle: { zh: "来聊聊", en: "LET’S TALK" },
    contactDescription: { zh: "聊作品，聊想法，聊点别的也行。", en: "Projects, ideas, or whatever’s on your mind." }
  },

  /* BGM：默认不播放。src 留空 → 隐藏播放按钮。选定后填 mp3 路径。 */
  bgm: {
    src: "",        // 例："assets/media/audio/bgm.mp3"
    title: { zh: "", en: "" },
    credit: { zh: "", en: "" }   // 若授权要求署名则填写
  },

  /* 个人照片（旧作品集 PPT 第2页 image2.jpeg） */
  portrait: "assets/media/portraits/zhou-xinnan.jpg",

  /* 合作/委托方（首页 CLIENTS 下拉）。按项目整理，未确认的不列。 */
  clients: [
    { zh: "野格 Jägermeister", en: "Jägermeister" },
    { zh: "JA 学生公司", en: "JA Student Company" },
    { zh: "平潭IM两岸青年影展", en: "Pingtan IM Cross-Strait Youth Film Festival" },
    { zh: "小金宣传片（苏州/西湖）", en: "Xiaojin Promo (Suzhou / West Lake)" },
    { zh: "千问 App", en: "Qwen App" },
    { zh: "《披荆斩棘的哥哥》", en: "Call Me by Fire" },
    { zh: "校学生会", en: "Student Union" }
  ]
};

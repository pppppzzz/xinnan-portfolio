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
        "你好，我是周昕楠，目前在未来设计学院学习。我的创作围绕视觉设计、交互叙事与影像展开，也在尝试把 AI 和不同的制作工具融入其中。",
        "我参与过 AI 影视项目的创意、分镜设计、视觉资产与影像制作，也探索过品牌与 IP 的视觉表达。我喜欢有故事的画面，也在意观看或参与的人会产生什么感受。",
        "最近，我对实体互动装置很感兴趣：把一个心理概念变成奇怪、有趣、可以亲自参与的规则，让观众在选择和体验中，慢慢发现它与自己的关系。"
      ],
      en: [
        "Hi, I’m Xinnan Zhou, a student at the College of Future Design. My work explores visual design, interactive storytelling, and filmmaking. I also experiment with AI and different creative tools.",
        "I have contributed to concepts, storyboards, visual assets, and production for AI film projects, and explored visual expression for brands and original characters. I enjoy images that tell stories and care about how people feel when they watch or take part.",
        "Recently, I’ve become interested in physical interactive installations: turning psychological ideas into unusual, playful rules that people can experience through their own choices."
      ]
    },
    hobbies: {
      zh: "创作之外，我喜欢听音乐、追星、旅行、摄影和养小动物，有时也会跳舞，也尝试过 cosplay。看喜欢的舞台、四处走走、拍下一个有意思的瞬间，或者跟着音乐动一动，都能让我开心一阵子。",
      en: "Outside my creative work, I enjoy music, following my favourite artists, travelling, photography, and caring for pets. I dance sometimes, too. I’ve also tried cosplay. A live show, a little wandering, an interesting moment caught on camera, or moving to a song can make my day."
    },
    footer: { zh: "谢谢你来逛逛。", en: "Thanks for stopping by." }
  },

  /* 联系方式：仅公开邮箱+电话（已确认）。学号等一律不出现。社交账号未提供→不显示。 */
  contact: {
    email: "2900520853@qq.com",
    phone: "15121173380",
    socials: []   // 例：{ id:"instagram", label:"Instagram", url:"https://..." }
  },

  /* 首页视频：留空 → 显示中性占位；填入路径即启用。勿用项目视频或参考站视频填充。 */
  hero: {
    video: "",      // 例："assets/media/video/hero.mp4"
    poster: ""      // 例："assets/media/video/hero-poster.jpg"
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

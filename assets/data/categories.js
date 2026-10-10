/* 分类/类型标签。年份=排序字段，类型=筛选标签，两者分离。
   enabled=false 或无内容的分类默认不显示（保留以后添加的能力）。
   顺序即显示顺序。 */
window.CATEGORIES = [
  { id: "visual",       zh: "视觉设计",   en: "Visual Design",          enabled: true  },
  { id: "storyboard",   zh: "分镜设计",   en: "Storyboard",             enabled: true  },
  { id: "film",         zh: "影像创作",   en: "Filmmaking",             enabled: true  },
  { id: "installation", zh: "互动装置",   en: "Interactive Installation", enabled: true },
  { id: "product",      zh: "产品与灯具", en: "Product & Lighting",     enabled: true  },
  { id: "web",          zh: "网站设计",   en: "Web Design",             enabled: true  },
  /* 以下为项目级附加标签（也可作筛选） */
  { id: "threed",       zh: "三维设计",   en: "3D Modelling",           enabled: true  },
  { id: "ai",           zh: "AI辅助创作", en: "AI-assisted",            enabled: true  },
  { id: "brand",        zh: "品牌与IP",   en: "Brand & IP",             enabled: true  },
  /* 预留：摄影栏目（未启用、无内容→不显示空导航） */
  { id: "photo",        zh: "摄影",       en: "Photography",            enabled: false }
];

/* 首页与作品页共用的四个分类，顺序即显示顺序。
   “全部”由作品页生成；项目可归入多个分类，但不复制项目。 */
window.CATEGORIES = [
  { id: "visual",       zh: "视觉设计",     en: "Visual Design",         enabled: true },
  { id: "film",         zh: "影像与分镜",   en: "Film & Storyboards",     enabled: true },
  { id: "installation", zh: "装置与物件",   en: "Installations & Objects", enabled: true },
  { id: "web",          zh: "网站设计",     en: "Web Design",            enabled: true }
];

/* 兼容旧版 zn_filter。AI 跨多个新分类，回到全部，避免遗漏项目。 */
window.LEGACY_FILTERS = {
  storyboard: "film",
  product: "installation",
  threed: "installation",
  brand: "visual",
  ai: "all",
  photo: "all"
};

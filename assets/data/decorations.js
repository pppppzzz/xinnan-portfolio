/* 贴纸/装饰配置。第一版为中性占位贴纸（assets/media/stickers/placeholder-*.svg）。
   以后替换为个人贴图：只换 src 文件与这里的参数，不改布局/交互代码。
   pos 使用 vw/vh 或 %，与参考站一致（绝对定位）。rotate 单位 deg。 */
window.DECORATIONS = {

  /* 全屏菜单内的贴纸（错峰弹入） */
  menu: [
    { id: "m-oval",   src: "assets/media/stickers/placeholder-oval.svg",   pos: { top: "9vh",  left: "6vw"  }, width: "13vw", rotate: -8 },
    { id: "m-char",   src: "assets/media/stickers/placeholder-char.svg",   pos: { top: "12vh", right: "12vw" }, width: "7vw",  rotate: 6 },
    { id: "m-stamp",  src: "assets/media/stickers/placeholder-stamp.svg",  pos: { top: "36vh", right: "6vw"  }, width: "5vw",  rotate: -4 },
    { id: "m-comp",   src: "assets/media/stickers/placeholder-comp.svg",   pos: { top: "44vh", left: "3vw"  }, width: "6vw",  rotate: 3 },
    { id: "m-cross",  src: "assets/media/stickers/placeholder-cross.svg",  pos: { bottom: "10vh", left: "30vw" }, width: "6vw", rotate: -12 },
    { id: "m-badge",  src: "assets/media/stickers/placeholder-badge.svg",  pos: { bottom: "8vh", right: "22vw" }, width: "7vw", rotate: 0 }
  ],

  /* 关于页：照片上可拖拽的贴纸 */
  about: [
    { id: "a-wing",  src: "assets/media/stickers/placeholder-wing.svg",  pos: { top: "-6%",  left: "18%" }, width: "34%", rotate: -6, draggable: true },
    { id: "a-cross", src: "assets/media/stickers/placeholder-cross.svg", pos: { top: "-8%",  right: "6%" }, width: "20%", rotate: 14, draggable: true },
    { id: "a-globe", src: "assets/media/stickers/placeholder-globe.svg", pos: { top: "34%",  left: "-14%" }, width: "26%", rotate: 0,  draggable: true },
    { id: "a-stamp", src: "assets/media/stickers/placeholder-stamp.svg", pos: { top: "30%",  right: "-6%" }, width: "22%", rotate: -8, draggable: true },
    { id: "a-band",  src: "assets/media/stickers/placeholder-band.svg",  pos: { top: "46%",  right: "10%" }, width: "24%", rotate: 10, draggable: true },
    { id: "a-badge", src: "assets/media/stickers/placeholder-badge.svg", pos: { bottom: "-6%", left: "-8%" }, width: "26%", rotate: -4, draggable: true }
  ],

  /* 联系页：旋转圆形贴纸 */
  contact: [
    { id: "c-round", src: "assets/media/stickers/placeholder-round.svg", pos: { top: "10vh", right: "8vw" }, width: "12vw", rotate: 0, spin: true }
  ],

  /* 首页跑马灯旁的装饰箭头贴纸 */
  home: [
    { id: "h-arrow", src: "assets/media/stickers/placeholder-arrow.svg", pos: { top: "40%", left: "48%" }, width: "6vw", rotate: 0 }
  ]
};

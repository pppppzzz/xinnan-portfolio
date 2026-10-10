/* 个人透明 PNG；原素材全部保留，页面仅使用少量贴纸。
   pos 使用 vw/vh 或 %；width 可用 clamp，rotate 单位 deg。
   compact:false 在窄屏隐藏；hotspot 为 36px 光标副本的真实操作位置。 */
window.DECORATIONS = {
  cursors: {
    arrow:   { src: "assets/media/cursors/cursor-arrow-36.png",   hotspot: [8, 1], fallback: "auto" },
    pointer: { src: "assets/media/cursors/cursor-pointer-36.png", hotspot: [15, 2], fallback: "pointer" },
    play:    { src: "assets/media/cursors/cursor-play-36.png",    hotspot: [18, 17], fallback: "pointer" }
  },

  /* 菜单右侧留白，窄屏隐藏，避开导航与关闭按钮。 */
  menu: [
    { id: "m-cat", src: "assets/media/stickers/sticker-cat-blue-white.png", pos: { top: "18vh", right: "15vw" }, width: "clamp(85px, 8vw, 115px)", rotate: 7, compact: false },
    { id: "m-vhs", src: "assets/media/stickers/sticker-vhs.png", pos: { top: "44vh", right: "5vw" }, width: "clamp(115px, 11vw, 165px)", rotate: -8, compact: false },
    { id: "m-poodle", src: "assets/media/stickers/sticker-poodle-grey.png", pos: { bottom: "15vh", right: "12vw" }, width: "clamp(90px, 9vw, 125px)", rotate: -5, compact: false }
  ],

  /* 个人页照片四角可拖动；窄屏仅保留相机和猫。 */
  about: [
    { id: "a-camera", src: "assets/media/stickers/sticker-camera.png", pos: { top: "-3%", left: "-1%" }, width: "clamp(84px, 10vw, 128px)", rotate: -8, draggable: true },
    { id: "a-mask", src: "assets/media/stickers/sticker-mask.png", pos: { top: "3%", right: "1%" }, width: "clamp(110px, 13vw, 170px)", rotate: 8, draggable: true, compact: false },
    { id: "a-cat", src: "assets/media/stickers/sticker-cat-blue.png", pos: { bottom: "3%", left: "1%" }, width: "clamp(70px, 7vw, 100px)", rotate: -7, draggable: true },
    { id: "a-budgie", src: "assets/media/stickers/sticker-budgie-blue-white.png", pos: { bottom: "8%", right: "1%" }, width: "clamp(65px, 6vw, 85px)", rotate: 6, draggable: true, compact: false }
  ],

  /* 联系页留白中的黑胶唱片，窄屏隐藏。 */
  contact: [
    { id: "c-vinyl", src: "assets/media/stickers/sticker-vinyl.png", pos: { top: "10vh", right: "8vw" }, width: "clamp(90px, 9vw, 130px)", rotate: 0, spin: true }
  ],

  /* 首页继续留白，其余命名 PNG 已保存备用。 */
  home: []
};

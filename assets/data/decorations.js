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

  /* 个人页：位置相对照片，x/y 分别以照片宽/高为单位，size 是宽度比。
     手机单独布局；四种动物同时保留。faceFit 使用原图像素坐标校准眼孔，非吸附点。 */
  about: [
    { id: "a-camera", src: "assets/media/stickers/sticker-camera.png", layout: { x: .02, y: .03, size: .34 }, mobile: { x: .03, y: .04, size: .36 }, rotate: -8, draggable: true },
    { id: "a-ticket", src: "assets/media/stickers/sticker-concert-ticket.png", layout: { x: .53, y: .025, size: .44 }, mobile: { x: .53, y: .03, size: .43 }, rotate: 7, draggable: true },
    { id: "a-headphones", src: "assets/media/stickers/sticker-headphones.png", layout: { x: .02, y: .74, size: .32 }, mobile: { x: .03, y: .73, size: .34 }, rotate: -9, draggable: true },
    { id: "a-travel", src: "assets/media/stickers/sticker-travel-tag.png", layout: { x: .75, y: .65, size: .20 }, mobile: { x: .75, y: .64, size: .21 }, rotate: 8, draggable: true },
    { id: "a-cat", src: "assets/media/stickers/sticker-cat-blue.png", layout: { x: .015, y: 1.05, size: .24 }, mobile: { x: .015, y: 1.04, size: .25 }, rotate: -7, draggable: true },
    { id: "a-cat-white", src: "assets/media/stickers/sticker-cat-blue-white.png", layout: { x: .285, y: 1.025, size: .235 }, mobile: { x: .29, y: 1.02, size: .24 }, rotate: 6, draggable: true },
    { id: "a-budgie", src: "assets/media/stickers/sticker-budgie-blue-white.png", layout: { x: .55, y: 1.055, size: .18 }, mobile: { x: .56, y: 1.05, size: .185 }, rotate: -5, draggable: true },
    { id: "a-poodle", src: "assets/media/stickers/sticker-poodle-grey.png", layout: { x: .735, y: 1.045, size: .25 }, mobile: { x: .74, y: 1.035, size: .25 }, rotate: 5, draggable: true },
    { id: "a-mask", src: "assets/media/stickers/sticker-mask.png", layout: { x: .075, y: -.22 }, mobile: { x: .08, y: -.235 }, draggable: true,
      faceFit: { portraitSize: [825, 1100], portraitEyes: [[309, 390], [450, 360]], imageSize: [2172, 724], eyeHoles: [[1056, 400], [1518, 360]] } }
  ],

  /* 联系页留白中的黑胶唱片，窄屏隐藏。 */
  contact: [
    { id: "c-vinyl", src: "assets/media/stickers/sticker-vinyl.png", pos: { top: "10vh", right: "8vw" }, width: "clamp(90px, 9vw, 130px)", rotate: 0, spin: true }
  ],

  /* 首页继续留白，其余命名 PNG 已保存备用。 */
  home: []
};

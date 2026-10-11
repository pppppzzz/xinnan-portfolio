/* 个人透明 PNG；原素材全部保留，页面仅使用少量贴纸。
   pos 使用 vw/vh 或 %；width 可用 clamp，rotate 单位 deg。
   compact:false 在窄屏隐藏；hotspot 为 36px 光标副本的真实操作位置。 */
window.DECORATIONS = {
  cursors: {
    arrow:   { src: "assets/media/cursors/cursor-arrow-36.png",   hotspot: [8, 1], fallback: "auto" },
    pointer: { src: "assets/media/cursors/cursor-pointer-36.png", hotspot: [15, 2], fallback: "pointer" },
    play:    { src: "assets/media/cursors/cursor-play-36.png",    hotspot: [18, 17], fallback: "pointer" }
  },

  /* 目录固定四张：右侧错落留白，手机采用对应的小尺寸构图。 */
  menu: [
    { id: "m-vhs", src: "assets/media/stickers/sticker-vhs.png", pos: { top: "40vh", right: "5vw" }, width: "clamp(180px, 18vw, 260px)", rotate: -8 },
    { id: "m-vinyl", src: "assets/media/stickers/sticker-vinyl.png", pos: { top: "18vh", right: "21vw" }, width: "clamp(100px, 11vw, 150px)", rotate: 8 },
    { id: "m-map", src: "assets/media/stickers/sticker-map.png", pos: { bottom: "13vh", right: "19vw" }, width: "clamp(140px, 15vw, 215px)", rotate: -6 },
    { id: "m-star", src: "assets/media/stickers/sticker-smiling-star.png", pos: { bottom: "36vh", right: "8vw" }, width: "clamp(55px, 6vw, 80px)", rotate: 12 }
  ],

  /* 个人页：photo 的x/y相对照片；bioBelow的x相对正文宽、y相对照片高。
     size 为照片宽度比；手机单独布局。faceFit 校准主体与眼孔，非吸附点。 */
  about: [
    { id: "a-camera", src: "assets/media/stickers/sticker-camera.png", layout: { anchor: "photo", x: .02, y: .03, size: .36 }, mobile: { anchor: "photo", x: .01, y: .04, size: .40 }, rotate: -8, draggable: true },
    { id: "a-ticket", src: "assets/media/stickers/sticker-concert-ticket.png", layout: { anchor: "bioBelow", x: .52, y: .08, size: .48 }, mobile: { anchor: "bioBelow", x: .49, y: .06, size: .52 }, rotate: 7, draggable: true },
    { id: "a-headphones", src: "assets/media/stickers/sticker-headphones.png", layout: { anchor: "bioBelow", x: .05, y: .06, size: .36 }, mobile: { anchor: "bioBelow", x: .04, y: .10, size: .40 }, rotate: -9, draggable: true },
    { id: "a-travel", src: "assets/media/stickers/sticker-travel-tag.png", layout: { anchor: "bioBelow", x: .73, y: .38, size: .23 }, mobile: { anchor: "bioBelow", x: .76, y: .28, size: .24 }, rotate: 8, draggable: true },
    { id: "a-cat", src: "assets/media/stickers/sticker-cat-blue.png", layout: { anchor: "photo", x: .09, y: 1.035, size: .28 }, mobile: { anchor: "photo", x: .09, y: 1.035, size: .30 }, rotate: -7, draggable: true },
    { id: "a-cat-white", src: "assets/media/stickers/sticker-cat-blue-white.png", layout: { anchor: "bioBelow", x: .08, y: .40, size: .28 }, mobile: { anchor: "bioBelow", x: .02, y: .61, size: .34 }, rotate: 6, draggable: true },
    { id: "a-budgie", src: "assets/media/stickers/sticker-budgie-blue-white.png", layout: { anchor: "bioBelow", x: .40, y: .55, size: .24 }, mobile: { anchor: "bioBelow", x: .38, y: .54, size: .29 }, rotate: -5, draggable: true },
    { id: "a-poodle", src: "assets/media/stickers/sticker-poodle-grey.png", layout: { anchor: "bioBelow", x: .65, y: .72, size: .32 }, mobile: { anchor: "bioBelow", x: .68, y: .67, size: .36 }, rotate: 5, draggable: true },
    { id: "a-mask", src: "assets/media/stickers/sticker-mask.png", layout: { anchor: "photo", x: .035, y: -.29 }, mobile: { anchor: "photo", x: -.035, y: -.31 }, draggable: true,
      faceFit: { bodyScale: 1.15, portraitSize: [825, 1100], portraitEyes: [[309, 390], [450, 360]], imageSize: [2172, 724], eyeHoles: [[1056, 400], [1518, 360]] } }
  ],

  /* 联系页留白中的黑胶唱片，窄屏隐藏。 */
  contact: [
    { id: "c-vinyl", src: "assets/media/stickers/sticker-vinyl.png", pos: { top: "10vh", right: "8vw" }, width: "clamp(90px, 9vw, 130px)", rotate: 0, spin: true }
  ],

  /* 首页继续留白，其余命名 PNG 已保存备用。 */
  home: []
};

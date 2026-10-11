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

  /* 初始位置以可见主体中心计算。photo相对照片，side横跨照片右侧留白，
     below用于手机正文后的错落摆放；size仍为完整PNG宽/照片宽。 */
  about: [
    { id: "a-camera", src: "assets/media/stickers/sticker-camera.png", bodyBox: [234, 42, 1373, 933], layout: { anchor: "photo", x: .13, y: .02, size: .36 }, mobile: { anchor: "photo", x: .14, y: .035, size: .40 }, rotate: -8, draggable: true },
    { id: "a-ticket", src: "assets/media/stickers/sticker-concert-ticket.png", bodyBox: [73, 117, 1474, 920], layout: { anchor: "photo", x: 1.06, y: .76, size: .48 }, mobile: { anchor: "photo", x: .63, y: 1.12, size: .54 }, rotate: 8, draggable: true },
    { id: "a-headphones", src: "assets/media/stickers/sticker-headphones.png", bodyBox: [284, 8, 1379, 1019], layout: { anchor: "side", x: .85, y: .40, size: .36 }, mobile: { anchor: "below", x: .80, y: .22, size: .37 }, rotate: -14, draggable: true },
    { id: "a-travel", src: "assets/media/stickers/sticker-travel-tag.png", bodyBox: [165, 66, 875, 1455], layout: { anchor: "photo", x: .07, y: .99, size: .22 }, mobile: { anchor: "photo", x: .075, y: 1.01, size: .24 }, rotate: -11, draggable: true },
    { id: "a-cat", src: "assets/media/stickers/sticker-cat-blue.png", bodyBox: [124, 164, 1192, 1125], layout: { anchor: "photo", x: 1.09, y: .92, size: .30 }, mobile: { anchor: "below", x: .21, y: .72, size: .34 }, rotate: -7, draggable: true },
    { id: "a-cat-white", src: "assets/media/stickers/sticker-cat-blue-white.png", bodyBox: [68, 111, 1246, 1140], layout: { anchor: "photo", x: 1.32, y: 1.045, size: .28 }, mobile: { anchor: "below", x: .52, y: 1.08, size: .31 }, rotate: 6, draggable: true },
    { id: "a-budgie", src: "assets/media/stickers/sticker-budgie-blue-white.png", bodyBox: [213, 98, 1103, 1115], layout: { anchor: "photo", x: .94, y: .56, size: .18 }, mobile: { anchor: "photo", x: .965, y: .65, size: .20 }, rotate: -5, draggable: true },
    { id: "a-poodle", src: "assets/media/stickers/sticker-poodle-grey.png", bodyBox: [151, 65, 1388, 975], layout: { anchor: "side", x: .58, y: .82, size: .29 }, mobile: { anchor: "below", x: .82, y: .66, size: .34 }, rotate: 5, draggable: true },
    { id: "a-mask", src: "assets/media/stickers/sticker-mask.png", bodyBox: [650, 22, 1815, 630], layout: { anchor: "side", x: .36, y: .20 }, mobile: { anchor: "photo", x: .64, y: .79 }, draggable: true,
      faceFit: { bodyScale: 1.15, portraitSize: [825, 1100], portraitEyes: [[309, 390], [450, 360]], imageSize: [2172, 724], eyeHoles: [[1056, 400], [1518, 360]] } }
  ],

  /* 联系页留白中的黑胶唱片，窄屏隐藏。 */
  contact: [
    { id: "c-vinyl", src: "assets/media/stickers/sticker-vinyl.png", pos: { top: "10vh", right: "8vw" }, width: "clamp(90px, 9vw, 130px)", rotate: 0, spin: true }
  ],

  /* 联系页动态素材池。bodyBox是alpha>180的主体像素边界，只用于等比尺寸/出场中心。 */
  contactRain: {
    distance: 30, interval: 120, maxActive: 18, duration: [1600, 2100], bodySize: [60, 110],
    pool: [
      { src: "assets/media/stickers/sticker-envelope.png", weight: 2, canvas: [1536, 1024], bodyBox: [213, 91, 1337, 963] },
      { src: "assets/media/stickers/sticker-chat-bubble.png", weight: 2, canvas: [1536, 1024], bodyBox: [236, 81, 1302, 943] },
      { src: "assets/media/stickers/sticker-clover.png", weight: 2, canvas: [1327, 1186], bodyBox: [166, 53, 1172, 1158] },
      { src: "assets/media/stickers/sticker-smiling-star.png", weight: 1, canvas: [1536, 1024], bodyBox: [338, 85, 1199, 932] },
      { src: "assets/media/stickers/sticker-cat-blue.png", weight: 1, canvas: [1315, 1197], bodyBox: [124, 164, 1192, 1125] },
      { src: "assets/media/stickers/sticker-cat-blue-white.png", weight: 1, canvas: [1313, 1198], bodyBox: [68, 111, 1246, 1140] },
      { src: "assets/media/stickers/sticker-budgie-blue-white.png", weight: 1, canvas: [1316, 1195], bodyBox: [213, 98, 1103, 1115] },
      { src: "assets/media/stickers/sticker-poodle-grey.png", weight: 1, canvas: [1536, 1024], bodyBox: [151, 65, 1388, 975] }
    ]
  },

  /* 首页继续留白，其余命名 PNG 已保存备用。 */
  home: []
};

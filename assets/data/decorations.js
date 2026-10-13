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

  /* 本人截图确认的初始构图；photo-origin为PNG原点相对照片宽/高，
     bio-origin为PNG原点相对正文宽、正文底部起的照片宽。刷新回此默认，不读取旧拖动缓存。 */
  about: [
    { id: "a-camera", src: "assets/media/stickers/sticker-camera.png", bodyBox: [234, 42, 1373, 933], layout: { anchor: "photo-origin", x: -0.1165045, y: 0.3610384, size: 0.36 }, mobile: { anchor: "photo-origin", x: -0.1165045, y: 0.3610384, size: 0.36 }, rotate: -8, draggable: true },
    { id: "a-ticket", src: "assets/media/stickers/sticker-concert-ticket.png", bodyBox: [73, 117, 1474, 920], layout: { anchor: "photo-origin", x: 0.6439015, y: 0.7171833, size: 0.48 }, mobile: { anchor: "photo-origin", x: 0.6439015, y: 0.7171833, size: 0.48 }, rotate: 8, draggable: true },
    { id: "a-headphones", src: "assets/media/stickers/sticker-headphones.png", bodyBox: [284, 8, 1379, 1019], layout: { anchor: "bio-origin", x: 0.3521511, y: 0.4832913, size: 0.36 }, mobile: { anchor: "bio-origin", x: 0.55, y: 0.65, size: 0.36 }, rotate: -14, draggable: true },
    { id: "a-travel", src: "assets/media/stickers/sticker-travel-tag.png", bodyBox: [165, 66, 875, 1455], layout: { anchor: "bio-origin", x: 0.07761, y: 0.0933845, size: 0.22 }, mobile: { anchor: "bio-origin", x: 0.07761, y: 0.0933845, size: 0.22 }, rotate: -11, draggable: true },
    { id: "a-cat", src: "assets/media/stickers/sticker-cat-blue.png", bodyBox: [124, 164, 1192, 1125], layout: { anchor: "photo-origin", x: 0.5553179, y: 0.9918019, size: 0.3 }, mobile: { anchor: "photo-origin", x: 0.5553179, y: 0.9918019, size: 0.3 }, rotate: -7, draggable: true },
    { id: "a-cat-white", src: "assets/media/stickers/sticker-cat-blue-white.png", bodyBox: [68, 111, 1246, 1140], layout: { anchor: "photo-origin", x: 0.2520508, y: 0.9987438, size: 0.28 }, mobile: { anchor: "photo-origin", x: 0.2520508, y: 0.9987438, size: 0.28 }, rotate: 6, draggable: true },
    { id: "a-cat-orange", src: "assets/media/stickers/sticker-cat-orange.png", bodyBox: [16, 60, 1300, 1174], layout: { anchor: "photo-origin", x: 0.875, y: 1.005, size: 0.27 }, mobile: { anchor: "photo-origin", x: 0.84, y: 1.08, size: 0.24 }, rotate: 4, draggable: true },
    { id: "a-budgie", src: "assets/media/stickers/sticker-budgie-blue-white.png", bodyBox: [213, 98, 1103, 1115], layout: { anchor: "photo-origin", x: 1.19, y: 1.0486749, size: 0.18 }, mobile: { anchor: "photo-origin", x: 1.08, y: 0.96, size: 0.15 }, rotate: -5, draggable: true },
    { id: "a-poodle", src: "assets/media/stickers/sticker-poodle-grey.png", bodyBox: [151, 65, 1388, 975], layout: { anchor: "photo-origin", x: -0.0326923, y: 1.0278638, size: 0.29 }, mobile: { anchor: "photo-origin", x: -0.0326923, y: 1.0278638, size: 0.29 }, rotate: 5, draggable: true },
    { id: "a-mask", src: "assets/media/stickers/sticker-mask.png", bodyBox: [650, 22, 1815, 630], layout: { anchor: "photo-origin", x: 0.0896227, y: -0.2482606 }, mobile: { anchor: "photo-origin", x: 0.0896227, y: -0.2482606 }, draggable: true,
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

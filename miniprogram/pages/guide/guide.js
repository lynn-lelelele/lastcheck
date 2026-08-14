Page({
  data: {
    steps: [
      { no: '01', title: '添加场所', desc: '选一个常去的坐标，比如家或公司，设定提醒半径。' },
      { no: '02', title: '套用模板', desc: '从模板库一键生成该场所的出门清单，可自行增删。' },
      { no: '03', title: '出门打卡', desc: '点「我出门了」，逐项确认，未确认项会高亮提醒。' }
    ]
  },

  onLoad() {
    // 已看过引导，直接进首页
    if (wx.getStorageSync('lastcheck_guide_seen')) {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  onStart() {
    wx.setStorageSync('lastcheck_guide_seen', true);
    wx.switchTab({ url: '/pages/index/index' });
  }
});
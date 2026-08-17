
Page({
  data: {
    locationAuthorized: false,
    version: '0.1.0'
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    console.log('[LastCheck] settings onShow');
    wx.getSetting({
      success: (res) => {
        this.setData({
          locationAuthorized: !!(res.authSetting['scope.userLocation'])
        });
      }
    });
  },

  onRequestAuth() {
    wx.authorize({
      scope: 'scope.userLocation',
      success: () => {
        this.setData({ locationAuthorized: true });
        wx.showToast({ title: '已授权', icon: 'success' });
      },
      fail: () => {
        wx.showModal({
          title: '需要定位权限',
          content: '关闭后无法自动触发出门提醒，仍可自己查看和确认清单。',
          showCancel: false
        });
      }
    });
  },

  onClearData() {
    wx.showModal({
      title: '清空本地数据',
      content: '将删除所有地点与清单数据，此操作不可恢复。',
      confirmColor: '#c0392b',
      success: (res) => {
        if (!res.confirm) return;
        wx.clearStorageSync();
        this.setData({ locationAuthorized: false });
        wx.showToast({ title: '已清空', icon: 'success' });
      }
    });
  },

  onDemoRemind() {
    wx.setStorageSync('lastcheck_demo_trigger', true);
    wx.switchTab({ url: '/pages/index/index' });
  },

  onOpenRepo() {
    wx.setClipboardData({
      data: 'https://github.com/lynn-lelelele/lastcheck',
      success: () => {
        wx.showToast({ title: '仓库地址已复制', icon: 'none' });
      }
    });
  }
});
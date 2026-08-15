App({
  globalData: {
    openid: '',
    locationAuthorized: false
  },

  onLaunch() {
    // 游客模式/未开通云开发时，初始化失败不应阻塞页面
    try {
      if (wx.cloud) {
        wx.cloud.init({
          // TODO(M2): 替换为你的云开发环境 ID
          env: 'YOUR_CLOUD_ENV',
          traceUser: true
        });
      }
    } catch (e) {
      console.warn('[LastCheck] cloud init skipped:', e);
    }
  }
});
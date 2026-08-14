App({
  globalData: {
    openid: '',
    locationAuthorized: false
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('当前基础库过低，无法使用云能力，请升级基础库');
      return;
    }
    wx.cloud.init({
      // TODO(M2): 替换为你的云开发环境 ID，如 'lastcheck-xxxxxx'
      env: 'YOUR_CLOUD_ENV',
      traceUser: true
    });
  }
});
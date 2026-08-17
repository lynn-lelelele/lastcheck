// 定位服务：封装后台定位、前台定位与授权状态。
// 后台定位（startLocationUpdateBackground）需在小程序后台申请位置接口权限。

function isAuthorized() {
  return new Promise((resolve) => {
    wx.getSetting({
      success: (res) => resolve(!!res.authSetting['scope.userLocation']),
      fail: () => resolve(false)
    });
  });
}

function requestAuth() {
  return new Promise((resolve) => {
    wx.authorize({
      scope: 'scope.userLocation',
      success: () => resolve(true),
      fail: () => resolve(false)
    });
  });
}

// 前台持续监听（基础能力，无需申请）
function startWatch(onLocation) {
  if (!wx.startLocationUpdate) return false;
  wx.startLocationUpdate({
    type: 'gcj02',
    success: () => {
      wx.onLocationChange((res) => onLocation(res));
    },
    fail: () => {}
  });
  return true;
}

// 后台持续监听（需申请位置接口权限），失败时降级为前台监听
function startBackgroundWatch(onLocation) {
  if (wx.startLocationUpdateBackground) {
    wx.startLocationUpdateBackground({
      success: () => {
        wx.onLocationChange((res) => onLocation(res));
      },
      fail: () => {
        startWatch(onLocation);
      }
    });
  } else {
    startWatch(onLocation);
  }
}

function stopWatch() {
  if (wx.stopLocationUpdate) {
    wx.stopLocationUpdate({});
  }
}

module.exports = {
  isAuthorized,
  requestAuth,
  startWatch,
  startBackgroundWatch,
  stopWatch
};

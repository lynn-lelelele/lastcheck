// 订阅消息封装。
// 真实推送需要：正式 AppID + 云开发环境 + 已申请订阅消息模板。
// 游客/测试号环境无法真正下发，此模块会安全降级返回 false。

const TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // TODO(M2): 替换为你的订阅消息模板 ID

function requestReminderSubscription() {
  return new Promise((resolve) => {
    if (!wx.requestSubscribeMessage) {
      resolve(false);
      return;
    }
    wx.requestSubscribeMessage({
      tmplIds: [TEMPLATE_ID],
      success: (res) => {
        resolve(res[TEMPLATE_ID] === 'accept');
      },
      fail: () => resolve(false)
    });
  });
}

module.exports = { requestReminderSubscription };
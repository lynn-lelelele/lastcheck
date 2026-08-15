// 云函数：下发「出门提醒」订阅消息。
// 前置条件：正式 AppID、开通云开发、已申请订阅消息模板并填入模板 ID。
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const { openid, templateId, page, data } = event;
  if (!openid || !templateId) {
    return { ok: false, errMsg: 'missing openid or templateId' };
  }
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid,
      templateId,
      page: page || 'pages/index/index',
      data
    });
    return { ok: true, result };
  } catch (e) {
    return { ok: false, errMsg: e.errMsg || String(e) };
  }
};
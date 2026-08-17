// 提醒服务：把触发事件转换为拟人化提醒，交给回调（UI 弹窗 / 订阅消息推送）。
const messageService = require('./messageService');

function createReminderHandler({ onRemind }) {
  return function handleEvent(ev) {
    if (!ev || ev.type !== 'leave') return;
    const place = ev.place;
    const items = place.items || [];
    const checkedMap = place.checkedMap || {};
    const pending = items.filter((_, i) => !checkedMap[i]);
    const content = messageService.buildLeaveMessage(place, pending);
    onRemind({ place, pendingItems: pending, content });
  };
}

module.exports = { createReminderHandler };

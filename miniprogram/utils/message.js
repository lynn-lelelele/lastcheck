// 场景化提醒文案：根据场所名称关键词生成有温度的提醒话术。
// 规则后续迁移到 data/scene-templates.json（M3，数据化、社区共建）。

function buildLeaveMessage(place, pendingItems) {
  const name = (place && place.name) || '';
  const items = pendingItems || [];
  const itemText = items.length ? '别忘了带：' + items.join('、') : '别忘了检查随身物品';

  if (/酒店|宾馆|民宿|客栈/.test(name)) {
    return '检测到您离开「' + name + '」，是在旅游吗？' + itemText;
  }
  if (/公司|大厦|办公|写字楼|科技园/.test(name)) {
    return '检测到您离开「' + name + '」，去上班吗？' + itemText;
  }
  if (/健身|游泳|运动|瑜伽/.test(name)) {
    return '运动结束，' + itemText;
  }
  if (/饭店|餐厅|火锅|烧烤|咖啡/.test(name)) {
    return '离开「' + name + '」，' + itemText;
  }
  if (/家|小区|公寓|花园|苑|里/.test(name)) {
    return '出门顺利！' + itemText;
  }
  return '检测到您离开「' + name + '」，' + itemText;
}

module.exports = { buildLeaveMessage };

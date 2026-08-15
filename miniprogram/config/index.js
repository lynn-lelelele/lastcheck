// 配置中心：集中管理环境与默认值。
module.exports = {
  // TODO(M2): 替换为你的云开发环境 ID
  cloudEnv: 'YOUR_CLOUD_ENV',
  // 默认围栏半径（米）
  defaultRadius: 100,
  // 订阅消息模板 ID（M2 填写）
  reminderTemplateId: 'YOUR_TEMPLATE_ID',
  // 腾讯位置服务 key（M3 POI 识别使用，云函数侧配置）
  tencentLbsKey: '',
  // 出门习惯学习：提前提醒分钟数
  habitLeadMinutes: 15
};

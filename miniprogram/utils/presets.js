// 场景预设：添加场所时按类型自动生成常用物品。
// 这是纯数据，社区可通过 PR 扩充（见 templates/README.md）。

const SCENE_TYPES = [
  { key: 'home', label: '家', items: ['钥匙', '手机', '钱包', '工卡', '充电器', '雨伞'] },
  { key: 'office', label: '公司', items: ['工卡', '电脑', '充电器', '耳机', '雨伞'] },
  { key: 'hotel', label: '酒店', items: ['房卡', '身份证', '充电器', '洗漱包', '票据'] },
  { key: 'restaurant', label: '饭店', items: ['手机', '钱包', '外套', '雨伞'] },
  { key: 'gym', label: '健身房', items: ['毛巾', '换洗衣物', '水杯', '耳机', '健身卡'] }
];

module.exports = { SCENE_TYPES };
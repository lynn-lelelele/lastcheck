// 内置场所模板。模板是纯数据，社区可通过 PR 扩充（见 templates/README.md）。
const BUILTIN_TEMPLATES = [
  { id: 't_home', name: '家', items: ['钥匙', '手机', '钱包', '工卡', '充电器', '雨伞'] },
  { id: 't_office', name: '公司', items: ['工卡', '电脑', '充电器', '耳机', '雨伞'] },
  { id: 't_hotel', name: '酒店', items: ['房卡', '身份证', '充电器', '洗漱包', '票据'] },
  { id: 't_restaurant', name: '饭店', items: ['手机', '钱包', '外套', '雨伞'] },
  { id: 't_gym', name: '健身房', items: ['毛巾', '换洗衣物', '水杯', '耳机', '健身卡'] }
];

Page({
  data: {
    templates: BUILTIN_TEMPLATES
  },

  onApply(e) {
    const id = e.currentTarget.dataset.id;
    const tpl = BUILTIN_TEMPLATES.find(t => t.id === id);
    if (!tpl) return;
    wx.navigateTo({
      url: '/pages/places/places?template=' + tpl.id
    });
    wx.showToast({ title: '请在「场所」中添加该模板', icon: 'none' });
  }
});
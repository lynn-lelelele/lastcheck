const store = require('../../utils/store');

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

    const places = store.getPlaces();
    if (places.length === 0) {
      wx.showModal({
        title: '还没有场所',
        content: '请先到「场所」页添加一个地点（如家或公司），再把模板套用到该场所。',
        confirmText: '去添加',
        success: (r) => {
          if (r.confirm) {
            wx.switchTab({ url: '/pages/places/places' });
          }
        }
      });
      return;
    }

    const names = places.map(p => p.name);
    wx.showActionSheet({
      itemList: names,
      success: (res) => {
        const target = places[res.tapIndex];
        target.items = tpl.items.slice();
        target.checkedMap = {};
        store.savePlaces(places);
        // 把当前场所切到被套用的场所，保证清单页直接看到效果
        wx.setStorageSync('lastcheck_current_place_id', target.id);
        wx.showToast({ title: '已套用到「' + target.name + '」', icon: 'success' });
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' });
        }, 800);
      }
    });
  }
});
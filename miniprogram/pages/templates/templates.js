const store = require('../../utils/store');
const presets = require('../../utils/presets');

Page({
  data: {
    presetsList: presets.SCENE_TYPES,
    customList: []
  },

  onShow() {
    console.log('[LastCheck] templates onShow');
    this.setData({ customList: store.getTemplates() });
  },

  // 新建自己的清单
  onNewTemplate() {
    wx.showModal({
      title: '新建清单',
      editable: true,
      placeholderText: '如：图书馆、学校、出差包',
      success: (res) => {
        if (!res.confirm) return;
        const name = (res.content || '').trim();
        if (!name) return;
        const list = store.getTemplates();
        list.push({ id: 't_' + Date.now(), name, items: [] });
        store.saveTemplates(list);
        this.setData({ customList: list });
        wx.showToast({ title: '已创建，可先用到地点', icon: 'success' });
      }
    });
  },

  onRemoveCustom(e) {
    const id = e.currentTarget.dataset.id;
    const list = store.getTemplates().filter(t => t.id !== id);
    store.saveTemplates(list);
    this.setData({ customList: list });
  },

  // 把清单用到某个常去的地方
  onUse(e) {
    const customId = e.currentTarget.dataset.custom;
    const key = e.currentTarget.dataset.key;
    let items = [];
    let label = '';
    if (customId) {
      const custom = this.data.customList.find(t => t.id === customId);
      if (!custom) return;
      items = custom.items || [];
      label = custom.name;
    } else {
      const preset = presets.SCENE_TYPES.find(p => p.key === key);
      if (!preset) return;
      items = preset.items;
      label = preset.label;
    }

    const places = store.getPlaces();
    if (places.length === 0) {
      wx.showModal({
        title: '还没有常去的地方',
        content: '请先到「地点」页添加一个常去的地方，再把这份清单用到它。',
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
        target.items = items.slice();
        target.checkedMap = {};
        store.savePlaces(places);
        wx.setStorageSync('lastcheck_current_place_id', target.id);
        wx.showToast({ title: '已用到「' + target.name + '」', icon: 'success' });
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' });
        }, 800);
      }
    });
  }
});

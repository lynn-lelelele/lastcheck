const store = require('../../utils/store');
const presets = require('../../utils/presets');

Page({
  data: {
    presetsList: presets.SCENE_TYPES
  },

  onUse(e) {
    const key = e.currentTarget.dataset.key;
    const preset = presets.SCENE_TYPES.find(p => p.key === key);
    if (!preset) return;

    const places = store.getPlaces();
    if (places.length === 0) {
      wx.showModal({
        title: '还没有常去的地方',
        content: '请先到「地点」页添加一个常去的地方，再把这份清单用到该地点。',
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
        target.items = preset.items.slice();
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
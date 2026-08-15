const templateService = require('../../services/templateService');
const placeService = require('../../services/placeService');

Page({
  data: {
    presetsList: [],
    customList: []
  },

  onShow() {
    console.log('[LastCheck] templates onShow');
    this.setData({
      presetsList: templateService.getPresets(),
      customList: templateService.getCustomList()
    });
  },

  onNewTemplate() {
    wx.showModal({
      title: '新建清单',
      editable: true,
      placeholderText: '如：图书馆、学校、出差包',
      success: (res) => {
        if (!res.confirm) return;
        const name = (res.content || '').trim();
        if (!name) return;
        templateService.createCustom(name);
        this.setData({ customList: templateService.getCustomList() });
        wx.showToast({ title: '已创建，可先用到地点', icon: 'success' });
      }
    });
  },

  onRemoveCustom(e) {
    templateService.removeCustom(e.currentTarget.dataset.id);
    this.setData({ customList: templateService.getCustomList() });
  },

  onUse(e) {
    const customId = e.currentTarget.dataset.custom;
    const key = e.currentTarget.dataset.key;
    let items = [];
    if (customId) {
      const got = templateService.getItemsById(customId);
      if (got === null) return;
      items = got;
    } else {
      const got = templateService.getItemsByKey(key);
      if (got === null) return;
      items = got;
    }

    const places = placeService.list();
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
        placeService.update(target.id, { items: items.slice(), checkedMap: {} });
        placeService.setCurrentPlaceId(target.id);
        wx.showToast({ title: '已用到「' + target.name + '」', icon: 'success' });
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' });
        }, 800);
      }
    });
  }
});

const templateService = require('../../services/templateService');
const placeService = require('../../services/placeService');

Page({
  data: {
    presetsList: [],
    customList: []
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
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

  // 用一份清单 = 地图选点生成一个新地点（新围栏），清单物品自动带上
  onUse(e) {
    const customId = e.currentTarget.dataset.custom;
    const key = e.currentTarget.dataset.key;
    let items = [];
    let label = '';
    if (customId) {
      const got = templateService.getItemsById(customId);
      if (got === null) return;
      items = got;
      label = this.data.customList.find(t => t.id === customId).name;
    } else {
      const got = templateService.getItemsByKey(key);
      if (got === null) return;
      items = got;
      label = this.data.presetsList.find(p => p.key === key).label;
    }

    wx.showLoading({ title: '正在选择位置…', mask: true });
    let settled = false;

    const finish = (address, latitude, longitude) => {
      if (settled) return;
      settled = true;
      wx.hideLoading();
      const place = placeService.add({
        id: 'p_' + Date.now(),
        name: label,
        address: address || '',
        latitude: latitude,
        longitude: longitude,
        items: items.slice()
      });
      placeService.setCurrentPlaceId(place.id);
      wx.showToast({ title: '已创建「' + label + '」', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 800);
    };

    const useDemo = () => {
      if (settled) return;
      settled = true;
      wx.hideLoading();
      wx.showModal({
        title: '地图不可用',
        content: '已用示例位置创建「' + label + '」，稍后可在地点页修改。',
        confirmText: '知道了',
        success: () => finish('示例位置（稍后可修改）', 28.228209, 112.938814)
      });
    };

    setTimeout(useDemo, 8000);
    wx.chooseLocation({
      success: (res) => {
        finish(res.address || '', res.latitude, res.longitude);
      },
      fail: () => useDemo()
    });
  }
});

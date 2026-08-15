const store = require('../../utils/store');

Page({
  data: {
    places: []
  },

  onShow() {
    console.log('[LastCheck] places onShow');
    this.setData({ places: store.getPlaces() });
  },

  // 添加场所：先让用户选择获取方式，游客模式下地图不可用也能继续
  onAddPlace() {
    wx.showActionSheet({
      itemList: ['地图选点', '用演示位置'],
      success: (r) => {
        if (r.tapIndex === 1) {
          this.addPlaceWithCoords('演示场所', '演示位置（长沙，可删除）', 28.228209, 112.938814);
          return;
        }
        this.tryMapPick();
      },
      fail: () => {}
    });
  },

  tryMapPick() {
    wx.showLoading({ title: '正在获取位置…', mask: true });
    let settled = false;
    const finish = (name, address, latitude, longitude) => {
      if (settled) return;
      settled = true;
      wx.hideLoading();
      this.addPlaceWithCoords(name, address, latitude, longitude);
    };
    const useDemo = () => {
      if (settled) return;
      settled = true;
      wx.hideLoading();
      wx.showModal({
        title: '地图不可用',
        content: '当前环境无法打开地图，可用演示位置创建场所，之后可修改或删除。',
        confirmText: '用演示位置',
        success: () => this.addPlaceWithCoords('演示场所', '演示位置（长沙，可删除）', 28.228209, 112.938814)
      });
    };
    setTimeout(useDemo, 8000);
    wx.chooseLocation({
      success: (res) => {
        finish(res.name || '新场所', res.address || '', res.latitude, res.longitude);
      },
      fail: () => useDemo()
    });
  },

  addPlaceWithCoords(name, address, latitude, longitude) {
    const places = store.getPlaces();
    places.push({
      id: 'p_' + Date.now(),
      name: name || '新场所',
      address: address || '',
      latitude: latitude,
      longitude: longitude,
      radius: 100,
      items: [],
      checkedMap: {}
    });
    store.savePlaces(places);
    this.setData({ places });
    wx.showToast({ title: '已添加', icon: 'success' });
  },

  onEditRadius(e) {
    const id = e.currentTarget.dataset.id;
    const places = store.getPlaces();
    const place = places.find(p => p.id === id);
    if (!place) return;
    const options = ['50 米', '100 米', '200 米', '300 米', '500 米'];
    const radiusMap = [50, 100, 200, 300, 500];
    wx.showActionSheet({
      itemList: options,
      success: (res) => {
        place.radius = radiusMap[res.tapIndex];
        store.savePlaces(places);
        this.setData({ places });
      }
    });
  },

  onRemovePlace(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除场所',
      content: '删除后该场所的清单也会一并移除。',
      confirmColor: '#c0392b',
      success: (res) => {
        if (!res.confirm) return;
        const places = store.getPlaces().filter(p => p.id !== id);
        store.savePlaces(places);
        this.setData({ places });
      }
    });
  }
});
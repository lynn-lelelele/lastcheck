const store = require('../../utils/store');
const presets = require('../../utils/presets');

Page({
  data: {
    places: []
  },

  onShow() {
    console.log('[LastCheck] places onShow');
    this.setData({ places: store.getPlaces() });
  },

  // 添加常去的地方：先选类型（自动带常用物品），再选位置方式
  onAddPlace() {
    const names = presets.SCENE_TYPES.map(s => s.label).concat(['其他']);
    wx.showActionSheet({
      itemList: names,
      success: (r) => {
        const preset = presets.SCENE_TYPES[r.tapIndex];
        if (preset) {
          this.chooseLocationMethod(preset.label, preset.items);
        } else {
          // 其他：让用户自定义名称
          wx.showModal({
            title: '地点名称',
            editable: true,
            placeholderText: '如：图书馆、学校、医院',
            success: (res) => {
              if (!res.confirm) return;
              const name = (res.content || '').trim() || '其他';
              this.chooseLocationMethod(name, []);
            }
          });
        }
      },
      fail: () => {}
    });
  },

  chooseLocationMethod(name, items) {
    wx.showActionSheet({
      itemList: ['地图选点', '用演示位置'],
      success: (r) => {
        if (r.tapIndex === 1) {
          this.addPlaceWithCoords(name, '演示位置（长沙，可删除）', 28.228209, 112.938814, items);
          return;
        }
        this.tryMapPick(name, items);
      },
      fail: () => {}
    });
  },

  tryMapPick(name, items) {
    wx.showLoading({ title: '正在获取位置…', mask: true });
    let settled = false;
    const finish = (n, address, latitude, longitude) => {
      if (settled) return;
      settled = true;
      wx.hideLoading();
      this.addPlaceWithCoords(n, address, latitude, longitude, items);
    };
    const useDemo = () => {
      if (settled) return;
      settled = true;
      wx.hideLoading();
      wx.showModal({
        title: '地图不可用',
        content: '当前环境无法打开地图，可用演示位置创建地点，之后可修改或删除。',
        confirmText: '用演示位置',
        success: () => this.addPlaceWithCoords(name, '演示位置（长沙，可删除）', 28.228209, 112.938814, items)
      });
    };
    setTimeout(useDemo, 8000);
    wx.chooseLocation({
      success: (res) => {
        finish(res.name || name, res.address || '', res.latitude, res.longitude);
      },
      fail: () => useDemo()
    });
  },

  addPlaceWithCoords(name, address, latitude, longitude, items) {
    const places = store.getPlaces();
    places.push({
      id: 'p_' + Date.now(),
      name: name || '新地点',
      address: address || '',
      latitude: latitude,
      longitude: longitude,
      radius: 100,
      items: items || [],
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
      title: '删除地点',
      content: '删除后这里对应的清单也会一并移除。',
      confirmColor: '#a25e4c',
      success: (res) => {
        if (!res.confirm) return;
        const places = store.getPlaces().filter(p => p.id !== id);
        store.savePlaces(places);
        this.setData({ places });
      }
    });
  }
});

const placeService = require('../../services/placeService');
const presets = require('../../data/presets');

Page({
  data: {
    places: []
  },

  onShow() {
    console.log('[LastCheck] places onShow');
    this.setData({ places: placeService.list() });
  },

  onAddPlace() {
    const names = presets.SCENE_TYPES.map(s => s.label).concat(['其他']);
    wx.showActionSheet({
      itemList: names,
      success: (r) => {
        const preset = presets.SCENE_TYPES[r.tapIndex];
        if (preset) {
          this.chooseLocationMethod(preset.label, preset.items);
        } else {
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
      itemList: ['地图选点', '用示例位置'],
      success: (r) => {
        if (r.tapIndex === 1) {
          this.addPlaceWithCoords(name, '示例位置（稍后可修改）', 28.228209, 112.938814, items);
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
        content: '当前环境无法打开地图，可用示例位置创建地点，之后可修改或删除。',
        confirmText: '用示例位置',
        success: () => this.addPlaceWithCoords(name, '示例位置（稍后可修改）', 28.228209, 112.938814, items)
      });
    };
    setTimeout(useDemo, 8000);
    wx.chooseLocation({
      success: (res) => {
        // 地点名保持用户选的类型名，地图只提供坐标与地址
        finish(name, res.address || '', res.latitude, res.longitude);
      },
      fail: () => useDemo()
    });
  },

  addPlaceWithCoords(name, address, latitude, longitude, items) {
    const finalName = name || '新地点';
    const exists = placeService.list().some(p => p.name === finalName);
    if (exists) {
      wx.showModal({
        title: '已有同名地点',
        content: '已存在「' + finalName + '」，仍要再添加一个吗？',
        confirmText: '仍要添加',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.savePlace(finalName, address, latitude, longitude, items);
          }
        }
      });
      return;
    }
    this.savePlace(finalName, address, latitude, longitude, items);
  },

  savePlace(name, address, latitude, longitude, items) {
    placeService.add({
      id: 'p_' + Date.now(),
      name: name,
      address: address || '',
      latitude: latitude,
      longitude: longitude,
      items: items || []
    });
    this.setData({ places: placeService.list() });
    wx.showToast({ title: '已添加', icon: 'success' });
  },

  onEditRadius(e) {
    const id = e.currentTarget.dataset.id;
    const options = ['50 米', '100 米', '200 米', '300 米', '500 米'];
    const radiusMap = [50, 100, 200, 300, 500];
    wx.showActionSheet({
      itemList: options,
      success: (res) => {
        placeService.update(id, { radius: radiusMap[res.tapIndex] });
        this.setData({ places: placeService.list() });
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
        placeService.remove(id);
        this.setData({ places: placeService.list() });
      }
    });
  }
});

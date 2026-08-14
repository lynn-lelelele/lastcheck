const store = require('../../utils/store');

Page({
  data: {
    places: []
  },

  onShow() {
    this.setData({ places: store.getPlaces() });
  },

  onAddPlace() {
    wx.chooseLocation({
      success: (res) => {
        const places = store.getPlaces();
        const place = {
          id: 'p_' + Date.now(),
          name: res.name || res.address || '未命名场所',
          address: res.address || '',
          latitude: res.latitude,
          longitude: res.longitude,
          radius: 100,
          items: [],
          checkedMap: {}
        };
        places.push(place);
        store.savePlaces(places);
        this.setData({ places });
        wx.showToast({ title: '已添加', icon: 'success' });
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '需要定位权限', icon: 'none' });
        }
      }
    });
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
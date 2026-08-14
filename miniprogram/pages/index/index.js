const store = require('../../utils/store');

Page({
  data: {
    places: [],
    currentPlaceId: '',
    currentPlace: null,
    items: [],
    checkedMap: {},
    triggerInfo: ''
  },

  onShow() {
    const places = store.getPlaces();
    let currentPlaceId = wx.getStorageSync('lastcheck_current_place_id') || '';
    if (places.length === 0) {
      this.setData({ places: [], currentPlace: null, items: [] });
      return;
    }
    if (!places.some(p => p.id === currentPlaceId)) {
      currentPlaceId = places[0].id;
      wx.setStorageSync('lastcheck_current_place_id', currentPlaceId);
    }
    const currentPlace = places.find(p => p.id === currentPlaceId);
    this.setData({
      places,
      currentPlaceId,
      currentPlace,
      items: currentPlace.items || [],
      checkedMap: currentPlace.checkedMap || {}
    });
  },

  onSwitchPlace(e) {
    const id = e.currentTarget.dataset.id;
    wx.setStorageSync('lastcheck_current_place_id', id);
    this.onShow();
  },

  onToggleItem(e) {
    const index = e.currentTarget.dataset.index;
    const checkedMap = Object.assign({}, this.data.checkedMap);
    checkedMap[index] = !checkedMap[index];
    this.setData({ checkedMap });
    this.persist();
  },

  onCheckAll() {
    const checkedMap = {};
    this.data.items.forEach((_, i) => { checkedMap[i] = true; });
    this.setData({ checkedMap });
    this.persist();
  },

  persist() {
    const places = store.getPlaces();
    const idx = places.findIndex(p => p.id === this.data.currentPlaceId);
    if (idx === -1) return;
    places[idx].checkedMap = this.data.checkedMap;
    store.savePlaces(places);
  },

  // TODO(M2): 接入 wx.startLocationUpdateBackground 与围栏判定后，
  // 由 triggerInfo 展示「检测到你离开 X，请核对清单」。
  goPlaces() {
    wx.switchTab && wx.navigateTo({ url: '/pages/places/places' });
  }
});
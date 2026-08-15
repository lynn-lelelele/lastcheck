const store = require('../../utils/store');

Page({
  data: {
    places: [],
    currentPlaceId: '',
    currentPlace: null,
    items: [],
    checkedMap: {},
    triggerInfo: '',
    triggerOk: false,
    showLeaveCard: false,
    build: 'cfaf591'
  },

  onLoad() {
    // M1-3: 首次进入引导定位授权（游客模式可跳过，不影响本地功能）
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] === false) {
          wx.showModal({
            title: '开启定位',
            content: '授权后，离开场所时才能自动提醒你检查清单。当前可以先用手动打卡体验。',
            confirmText: '去开启',
            cancelText: '暂不',
            success: (r) => {
              if (r.confirm) {
                wx.openSetting();
              }
            }
          });
        }
      }
    });
  },

  onShow() {
    console.log('[LastCheck] index onShow');
    const places = store.getPlaces();
    let currentPlaceId = wx.getStorageSync('lastcheck_current_place_id') || '';
    if (places.length === 0) {
      this.setData({ places: [], currentPlace: null, items: [], triggerInfo: '', triggerOk: false, showLeaveCard: false });
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
      checkedMap: currentPlace.checkedMap || {},
      triggerInfo: '',
      triggerOk: false,
      showLeaveCard: false
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
    this.refreshLeaveStatus();
  },

  onCheckAll() {
    const checkedMap = {};
    this.data.items.forEach((_, i) => { checkedMap[i] = true; });
    this.setData({ checkedMap });
    this.persist();
    this.refreshLeaveStatus();
  },

  // M1-6: 手动出门打卡，验证「提醒 → 确认」交互闭环
  onManualLeave() {
    if (!this.data.currentPlace) return;
    this.setData({ showLeaveCard: true, triggerInfo: '', triggerOk: false });
    this.refreshLeaveStatus();
  },

  refreshLeaveStatus() {
    if (!this.data.showLeaveCard) return;
    const items = this.data.items;
    const checked = this.data.checkedMap;
    const pending = items.filter((_, i) => !checked[i]);
    if (items.length === 0) {
      this.setData({ triggerInfo: '清单为空，可到「常用」选用一份。', triggerOk: false });
    } else if (pending.length === 0) {
      this.setData({ triggerInfo: '全部确认已带，可以安心出门。', triggerOk: true });
    } else {
      const names = pending.map((_, i) => {
        return items[i];
      });
      this.setData({ triggerInfo: '还有未确认：' + names.join('、'), triggerOk: false });
    }
  },

  persist() {
    const places = store.getPlaces();
    const idx = places.findIndex(p => p.id === this.data.currentPlaceId);
    if (idx === -1) return;
    places[idx].checkedMap = this.data.checkedMap;
    store.savePlaces(places);
  },

  goTemplates() {
    wx.switchTab({ url: '/pages/templates/templates' });
  },

  goPlaces() {
    wx.switchTab({ url: '/pages/places/places' });
  }
});
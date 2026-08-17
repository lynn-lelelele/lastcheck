const placeService = require('../../services/placeService');
const checklistService = require('../../services/checklistService');
const messageService = require('../../services/messageService');

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
    mockNotif: { visible: false, title: '', content: '' },
    celebration: false,
    editMode: false,
    newItem: ''
  },

  onLoad() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] === false) {
          wx.showModal({
            title: '开启定位',
            content: '授权后，离开常去地点时才能自动提醒你检查清单。未开启也能正常使用。',
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
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    console.log('[LastCheck] index onShow');
    // 设置页触发的演示出门提醒
    if (wx.getStorageSync('lastcheck_demo_trigger')) {
      wx.removeStorageSync('lastcheck_demo_trigger');
      this.onManualLeave();
    }
    const places = placeService.list();
    if (places.length === 0) {
      this.setData({ places: [], currentPlace: null, items: [], triggerInfo: '', triggerOk: false, showLeaveCard: false, editMode: false });
      return;
    }
    let currentPlaceId = placeService.getCurrentPlaceId();
    if (!places.some(p => p.id === currentPlaceId)) {
      currentPlaceId = places[0].id;
      placeService.setCurrentPlaceId(currentPlaceId);
    }
    const currentPlace = placeService.findById(currentPlaceId);
    const cl = checklistService.getChecklist(currentPlaceId);
    this.setData({
      places,
      currentPlaceId,
      currentPlace,
      items: cl.items,
      checkedMap: cl.checkedMap,
      triggerInfo: '',
      triggerOk: false,
      showLeaveCard: false,
      editMode: false
    });
  },

  onSwitchPlace(e) {
    placeService.setCurrentPlaceId(e.currentTarget.dataset.id);
    this.onShow();
  },

  onToggleItem(e) {
    const index = e.currentTarget.dataset.index;
    const checkedMap = Object.assign({}, this.data.checkedMap);
    checkedMap[index] = !checkedMap[index];
    this.setData({ checkedMap });
    this.persist();
    this.refreshLeaveStatus();
    this.tapFeedback();
  },

  tapFeedback() {
    if (wx.vibrateShort) {
      wx.vibrateShort({ type: 'light' });
    }
  },

  onCheckAll() {
    const checkedMap = {};
    this.data.items.forEach((_, i) => { checkedMap[i] = true; });
    this.setData({ checkedMap });
    this.persist();
    this.refreshLeaveStatus();
    if (wx.vibrateShort) {
      wx.vibrateShort({ type: 'heavy' });
    }
    this.celebrate();
  },

  celebrate() {
    this.setData({ celebration: true });
    setTimeout(() => {
      this.setData({ celebration: false });
    }, 1500);
  },

  onManualLeave() {
    if (!this.data.currentPlace) return;
    this.setData({ showLeaveCard: true, triggerInfo: '', triggerOk: false });
    this.refreshLeaveStatus();
    this.showMockNotification();
  },

  showMockNotification() {
    const place = this.data.currentPlace;
    const pending = this.data.items.filter((_, i) => !this.data.checkedMap[i]);
    const content = messageService.buildLeaveMessage(place, pending);
    this.setData({ mockNotif: { visible: true, title: '出门清单', content } });
    if (wx.vibrateShort) {
      wx.vibrateShort({ type: 'heavy' });
    }
    setTimeout(() => {
      this.setData({ 'mockNotif.visible': false });
    }, 4000);
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
      const names = pending.map((_, i) => items[i]);
      this.setData({ triggerInfo: '还有未确认：' + names.join('、'), triggerOk: false });
    }
  },

  persist() {
    checklistService.setCheckedMap(this.data.currentPlaceId, this.data.checkedMap);
  },

  onToggleEdit() {
    this.setData({ editMode: !this.data.editMode, newItem: '' });
  },

  onNewItemInput(e) {
    this.setData({ newItem: e.detail.value });
  },

  onAddItem() {
    const name = (this.data.newItem || '').trim();
    if (!name) return;
    const items = checklistService.addItem(this.data.currentPlaceId, name);
    if (items) {
      this.setData({ items, newItem: '' });
    }
  },

  onRemoveItem(e) {
    const result = checklistService.removeItem(this.data.currentPlaceId, e.currentTarget.dataset.index);
    if (result) {
      this.setData({ items: result.items, checkedMap: result.checkedMap });
    }
  },

  goTemplates() {
    wx.switchTab({ url: '/pages/templates/templates' });
  },

  goPlaces() {
    wx.switchTab({ url: '/pages/places/places' });
  }
});

Component({
  data: {
    selected: 0,
    bounce: -1,
    list: [
      { pagePath: '/pages/index/index', text: '清单', iconPath: '/images/tab/checklist.png', selectedIconPath: '/images/tab/checklist-active.png' },
      { pagePath: '/pages/places/places', text: '地点', iconPath: '/images/tab/place.png', selectedIconPath: '/images/tab/place-active.png' },
      { pagePath: '/pages/templates/templates', text: '常用', iconPath: '/images/tab/common.png', selectedIconPath: '/images/tab/common-active.png' },
      { pagePath: '/pages/settings/settings', text: '设置', iconPath: '/images/tab/settings.png', selectedIconPath: '/images/tab/settings-active.png' }
    ]
  },

  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      const path = e.currentTarget.dataset.path;
      if (this.data.selected === index) return;
      // 先移除弹跳标记，切页后再添加，保证每次切换都重放果冻动画
      this.setData({ selected: index, bounce: -1 });
      wx.switchTab({
        url: path,
        success: () => {
          this.setData({ bounce: index });
        }
      });
    }
  }
});

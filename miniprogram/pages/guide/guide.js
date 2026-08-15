const placeService = require('../../services/placeService');
const subscribe = require('../../services/subscriptionService');

// 场景 → 默认物品（focus=random 时使用）
const SCENE_ITEMS = {
  home: ['钥匙', '手机', '钱包', '充电器', '雨伞'],
  office: ['工卡', '电脑', '充电器', '耳机'],
  gym: ['毛巾', '换洗衣物', '水杯', '耳机', '健身卡'],
  other: ['手机', '钱包', '钥匙']
};

const FOCUS_ITEMS = {
  essentials: ['钥匙', '手机', '钱包', '工卡', '充电器', '雨伞'],
  devices: ['手机', '充电器', '耳机', '电脑', '充电宝']
};

const QUESTIONS = [
  {
    id: 'scene',
    title: '你最常从哪出门？',
    options: [
      { key: 'home', label: '家' },
      { key: 'office', label: '公司' },
      { key: 'gym', label: '健身房' },
      { key: 'other', label: '其他' }
    ]
  },
  {
    id: 'focus',
    title: '出门最怕忘带什么？',
    options: [
      { key: 'essentials', label: '钥匙、证件这类必需品' },
      { key: 'devices', label: '充电器、耳机这类电子设备' },
      { key: 'random', label: '没准，什么都可能忘' }
    ]
  },
  {
    id: 'auto',
    title: '要不要开启自动提醒？',
    options: [
      { key: 'on', label: '开启：离开常去地点时自动提醒（推荐）' },
      { key: 'off', label: '暂不开启' }
    ]
  }
];

Page({
  data: {
    phase: 'welcome',
    current: 0,
    question: null,
    total: QUESTIONS.length,
    answers: [],
    summary: '',
    build: 'd4e0aa3'
  },

  onLoad() {
    console.log('[LastCheck] guide loaded, build d4e0aa3');
    if (wx.getStorageSync('lastcheck_guide_seen')) {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  onStart() {
    this.showQuestion(0);
  },

  showQuestion(index) {
    if (index >= QUESTIONS.length) {
      this.finish();
      return;
    }
    this.setData({ phase: 'question', current: index, question: QUESTIONS[index] });
  },

  onPickOption(e) {
    if (wx.vibrateShort) {
      wx.vibrateShort({ type: 'light' });
    }
    const key = e.currentTarget.dataset.key;
    const id = this.data.question.id;
    const answers = this.data.answers.concat([key]);

    if (id === 'scene') {
      if (key === 'other') {
        // 自定义地点：先让用户输入名称
        wx.showModal({
          title: '地点名称',
          editable: true,
          placeholderText: '如：图书馆、学校、医院',
          success: (res) => {
            const name = (res.content || '').trim();
            this.customSceneName = name || '其他';
            this.pickScene(key, answers);
          }
        });
      } else {
        this.pickScene(key, answers);
      }
    } else if (id === 'focus') {
      this.pickFocus(key, answers);
    } else {
      this.pickAuto(key, answers);
    }
  },

  // 第 1 题：创建地点。先让用户选择获取方式，不依赖定位 API 的回调，
  // 保证任何环境下点「家」都有即时反馈。
  pickScene(key, answers) {
    wx.showActionSheet({
      itemList: ['地图选点', '用示例位置'],
      success: (r) => {
        if (r.tapIndex === 1) {
          this.createPlaceWithCoords(key, answers, '示例位置（稍后可修改）', 28.228209, 112.938814);
          return;
        }
        this.tryMapPick(key, answers);
      },
      fail: () => {
        // 取消选择：弹确认，避免误触导致地点缺失
        wx.showModal({
          title: '未选择获取方式',
          content: '可用示例位置创建地点，之后可在「地点」页修改或删除。',
          confirmText: '用示例位置',
          cancelText: '跳过',
          success: (r) => {
            if (r.confirm) {
              this.createPlaceWithCoords(key, answers, '示例位置（稍后可修改）', 28.228209, 112.938814);
            } else {
              this.setData({ answers });
              this.showQuestion(this.data.current + 1);
            }
          }
        });
      }
    });
  },

  // 地图选点：8 秒无回调自动降级为演示位置
  tryMapPick(key, answers) {
    wx.showLoading({ title: '正在获取位置…', mask: true });
    let settled = false;

    const finish = (address, latitude, longitude) => {
      if (settled) return;
      settled = true;
      wx.hideLoading();
      this.createPlaceWithCoords(key, answers, address, latitude, longitude);
    };

    const useDemo = () => {
      if (settled) return;
      settled = true;
      wx.hideLoading();
      wx.showModal({
        title: '地图不可用',
        content: '当前为演示模式，已用示例位置创建地点。正式环境（登录工具或真机）会正常使用地图选点。',
        confirmText: '知道了',
        success: () => {
          this.createPlaceWithCoords(key, answers, '示例位置（稍后可修改）', 28.228209, 112.938814);
        }
      });
    };

    setTimeout(useDemo, 8000);
    wx.chooseLocation({
      success: (res) => {
        finish(res.address || res.name || '', res.latitude, res.longitude);
      },
      fail: () => useDemo()
    });
  },

  // 用坐标创建地点（地图/定位/演示位置共用）
  createPlaceWithCoords(key, answers, address, latitude, longitude) {
    const name = this.sceneLabel(key);
    // 已有同名地点则不重复创建，直接继续
    const exists = placeService.list().some(p => p.name === name);
    if (!exists) {
      placeService.add({
        id: 'p_' + Date.now(),
        name: name,
        address: address || '',
        latitude: latitude,
        longitude: longitude,
        items: []
      });
    }
    this.setData({ answers });
    this.showQuestion(this.data.current + 1);
  },

  pickFocus(key, answers) {
    const places = placeService.list();
    if (places.length) {
      const items = key === 'random'
        ? (SCENE_ITEMS[answers[0]] || ['手机', '钱包', '钥匙'])
        : FOCUS_ITEMS[key];
      placeService.update(places[places.length - 1].id, { items, checkedMap: {} });
    }
    this.setData({ answers });
    this.showQuestion(this.data.current + 1);
  },

  pickAuto(key, answers) {
    if (key === 'on') {
      // 请求订阅消息授权（正式环境弹授权框；游客模式安全降级）
      subscribe.requestReminderSubscription().then((ok) => {
        if (ok) {
          wx.showToast({ title: '提醒已开启', icon: 'success' });
        } else {
          wx.showToast({ title: '当前环境暂不支持推送提醒', icon: 'none' });
        }
      });
      wx.authorize({
        scope: 'scope.userLocation',
        fail: () => {
          wx.showModal({
            title: '定位未授权',
            content: '之后可在「设置」页开启，未开启时，出门前自己核对清单就好。',
            showCancel: false
          });
        }
      });
    }
    this.setData({ answers });

    const places = placeService.list();
    if (places.length) {
      const place = places[places.length - 1];
      this.setData({ summary: '已为你准备「' + place.name + '」的出门清单（' + place.items.length + ' 件物品），离开时会自动提醒你。' });
    } else {
      this.setData({ summary: '已记录你的偏好：' + this.sceneLabel(answers[0]) + '。地点定位未完成，可稍后在「地点」页补充。' });
    }
    this.setData({ phase: 'done' });
  },

  sceneLabel(key) {
    if (key === 'other' && this.customSceneName) {
      return this.customSceneName;
    }
    const q = QUESTIONS[0];
    const opt = q.options.find(o => o.key === key);
    return opt ? opt.label : '地点';
  },

  onDone() {
    wx.setStorageSync('lastcheck_guide_seen', true);
    wx.switchTab({ url: '/pages/index/index' });
  }
});
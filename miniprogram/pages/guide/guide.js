const store = require('../../utils/store');

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
      { key: 'other', label: '其他场所' }
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
      { key: 'on', label: '开启：离开场所时自动提醒（推荐）' },
      { key: 'off', label: '暂不开启：先手动打卡' }
    ]
  }
];

Page({
  data: {
    phase: 'welcome',   // welcome | question | done
    current: 0,
    question: null,
    total: QUESTIONS.length,
    answers: [],
    summary: ''
  },

  onLoad() {
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
    const key = e.currentTarget.dataset.key;
    const id = this.data.question.id;
    const answers = this.data.answers.concat([key]);

    if (id === 'scene') {
      this.pickScene(key, answers);
    } else if (id === 'focus') {
      this.pickFocus(key, answers);
    } else {
      this.pickAuto(key, answers);
    }
  },

  pickScene(key, answers) {
    this.ensureLocationAuth((ok) => {
      if (!ok) {
        wx.showModal({
          title: '需要定位权限',
          content: '地图选点需要定位权限。可以在弹窗中选择允许，或在「设置」页开启定位后重试。',
          confirmText: '去设置',
          cancelText: '跳过',
          success: (r) => {
            if (r.confirm) {
              wx.openSetting({
                success: (res) => {
                  if (res.authSetting['scope.userLocation']) {
                    wx.showToast({ title: '授权成功', icon: 'success' });
                    this.pickScene(key, answers);
                  } else {
                    wx.showModal({
                      title: '仍未开启定位',
                      content: '请在设置页打开「位置信息」授权（选择使用小程序期间）后重试。',
                      showCancel: false
                    });
                  }
                },
                fail: () => {
                  wx.showModal({
                    title: '无法打开设置页',
                    content: '当前环境可能不支持打开设置页。请使用「清除授权数据」后重新授权。',
                    showCancel: false
                  });
                }
              });
            } else {
              this.setData({ answers });
              this.showQuestion(this.data.current + 1);
            }
          }
        });
        return;
      }
      wx.chooseLocation({
        success: (res) => {
          const places = store.getPlaces();
          places.push({
            id: 'p_' + Date.now(),
            name: this.sceneLabel(key),
            address: res.address || res.name || '',
            latitude: res.latitude,
            longitude: res.longitude,
            radius: 100,
            items: [],
            checkedMap: {}
          });
          store.savePlaces(places);
          this.setData({ answers });
          this.showQuestion(this.data.current + 1);
        },
        fail: (err) => {
          const msg = (err && err.errMsg) || '地图选点未完成';
          wx.showModal({
            title: '选点失败',
            content: msg,
            confirmText: '重试',
            cancelText: '跳过',
            success: (r) => {
              if (r.cancel) {
                this.setData({ answers });
                this.showQuestion(this.data.current + 1);
              }
            }
          });
        }
      });
    });
  },

  // 检查并请求定位授权
  ensureLocationAuth(cb) {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          cb(true);
          return;
        }
        wx.authorize({
          scope: 'scope.userLocation',
          success: () => cb(true),
          fail: () => cb(false)
        });
      },
      fail: () => cb(false)
    });
  },

  pickFocus(key, answers) {
    // 把生成的物品写入刚才创建的场所
    const places = store.getPlaces();
    if (places.length) {
      const items = key === 'random'
        ? (SCENE_ITEMS[answers[0]] || ['手机', '钱包', '钥匙'])
        : FOCUS_ITEMS[key];
      places[places.length - 1].items = items;
      places[places.length - 1].checkedMap = {};
      store.savePlaces(places);
    }
    this.setData({ answers });
    this.showQuestion(this.data.current + 1);
  },

  pickAuto(key, answers) {
    if (key === 'on') {
      wx.authorize({
        scope: 'scope.userLocation',
        fail: () => {
          wx.showModal({
            title: '定位未授权',
            content: '之后可在「设置」页开启，未开启时使用手动打卡。',
            showCancel: false
          });
        }
      });
    }
    this.setData({ answers });

    const scene = this.sceneLabel(answers[0]);
    const places = store.getPlaces();
    if (places.length) {
      this.setData({ summary: '已为你准备「' + places[places.length - 1].name + '」的出门清单（' + places[places.length - 1].items.length + ' 件物品），定位提醒已按你的选择配置。' });
    } else {
      this.setData({ summary: '已记录你的偏好：' + scene + '。场所定位未完成，可稍后在「场所」页添加。' });
    }
    this.setData({ phase: 'done' });
  },

  sceneLabel(key) {
    const q = QUESTIONS[0];
    const opt = q.options.find(o => o.key === key);
    return opt ? opt.label : '场所';
  },

  onDone() {
    wx.setStorageSync('lastcheck_guide_seen', true);
    wx.switchTab({ url: '/pages/index/index' });
  }
});
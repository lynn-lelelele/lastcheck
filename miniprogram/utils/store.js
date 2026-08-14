// 本地存储封装：目前先本地化存储，M2 再接入云数据库同步。

const KEY_PLACES = 'lastcheck_places';
const KEY_TEMPLATES = 'lastcheck_templates';

function getPlaces() {
  return wx.getStorageSync(KEY_PLACES) || [];
}

function savePlaces(places) {
  wx.setStorageSync(KEY_PLACES, places);
}

function getTemplates() {
  return wx.getStorageSync(KEY_TEMPLATES) || [];
}

function saveTemplates(templates) {
  wx.setStorageSync(KEY_TEMPLATES, templates);
}

module.exports = {
  getPlaces,
  savePlaces,
  getTemplates,
  saveTemplates
};
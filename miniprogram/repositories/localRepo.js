// 本地存储仓库：数据读写统一入口。
// M2 新增 repositories/cloudRepo.js 实现同一接口后，可平滑切换。

const KEY_PLACES = 'lastcheck_places';
const KEY_TEMPLATES = 'lastcheck_templates';
const KEY_CURRENT_PLACE = 'lastcheck_current_place_id';

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

function getCurrentPlaceId() {
  return wx.getStorageSync(KEY_CURRENT_PLACE) || '';
}

function setCurrentPlaceId(id) {
  wx.setStorageSync(KEY_CURRENT_PLACE, id);
}

module.exports = {
  getPlaces,
  savePlaces,
  getTemplates,
  saveTemplates,
  getCurrentPlaceId,
  setCurrentPlaceId
};

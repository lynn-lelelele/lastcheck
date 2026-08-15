// 出门清单库服务：现成清单与用户自定义清单。
const repo = require('../repositories/localRepo');
const presets = require('../data/presets');

function getPresets() {
  return presets.SCENE_TYPES;
}

function getCustomList() {
  return repo.getTemplates();
}

function createCustom(name) {
  const list = repo.getTemplates();
  const item = { id: 't_' + Date.now(), name, items: [] };
  list.push(item);
  repo.saveTemplates(list);
  return item;
}

function removeCustom(id) {
  repo.saveTemplates(repo.getTemplates().filter(t => t.id !== id));
}

// 取清单内容：按 id 或预设 key
function getItemsById(id) {
  const custom = repo.getTemplates().find(t => t.id === id);
  return custom ? (custom.items || []) : null;
}

function getItemsByKey(key) {
  const preset = presets.SCENE_TYPES.find(p => p.key === key);
  return preset ? preset.items : null;
}

module.exports = {
  getPresets,
  getCustomList,
  createCustom,
  removeCustom,
  getItemsById,
  getItemsByKey
};

// 出门清单服务：清单物品的读取、添加、删除、勾选状态。
const placeService = require('./placeService');

function getChecklist(placeId) {
  const p = placeService.findById(placeId);
  if (!p) return { items: [], checkedMap: {} };
  return { items: p.items || [], checkedMap: p.checkedMap || {} };
}

function setItems(placeId, items) {
  return placeService.update(placeId, { items });
}

function setCheckedMap(placeId, checkedMap) {
  return placeService.update(placeId, { checkedMap });
}

function addItem(placeId, name) {
  const p = placeService.findById(placeId);
  if (!p) return null;
  const items = (p.items || []).concat([name]);
  placeService.update(placeId, { items });
  return items;
}

// 删除物品并重排勾选状态
function removeItem(placeId, index) {
  const p = placeService.findById(placeId);
  if (!p) return null;
  const items = (p.items || []).slice();
  const old = p.checkedMap || {};
  items.splice(index, 1);
  const checkedMap = {};
  items.forEach((_, j) => {
    checkedMap[j] = j < index ? !!old[j] : !!old[j + 1];
  });
  placeService.update(placeId, { items, checkedMap });
  return { items, checkedMap };
}

module.exports = {
  getChecklist,
  setItems,
  setCheckedMap,
  addItem,
  removeItem
};

// 常去地点服务：地点的增删改查与当前地点状态。
const repo = require('../repositories/localRepo');
const config = require('../config/index');

function list() {
  return repo.getPlaces();
}

function findById(id) {
  return list().find(p => p.id === id) || null;
}

function add(place) {
  const places = repo.getPlaces();
  const item = Object.assign({
    radius: config.defaultRadius,
    items: [],
    checkedMap: {}
  }, place);
  places.push(item);
  repo.savePlaces(places);
  return item;
}

function remove(id) {
  repo.savePlaces(repo.getPlaces().filter(p => p.id !== id));
}

function update(id, patch) {
  const places = repo.getPlaces();
  const i = places.findIndex(p => p.id === id);
  if (i === -1) return null;
  places[i] = Object.assign({}, places[i], patch);
  repo.savePlaces(places);
  return places[i];
}

function getCurrentPlaceId() {
  return repo.getCurrentPlaceId();
}

function setCurrentPlaceId(id) {
  repo.setCurrentPlaceId(id);
}

// 获取当前地点（无则回退到第一个）
function getCurrentPlace() {
  const places = list();
  if (places.length === 0) return null;
  let id = getCurrentPlaceId();
  if (!places.some(p => p.id === id)) {
    id = places[0].id;
    setCurrentPlaceId(id);
  }
  return findById(id);
}

module.exports = {
  list,
  findById,
  add,
  remove,
  update,
  getCurrentPlaceId,
  setCurrentPlaceId,
  getCurrentPlace
};

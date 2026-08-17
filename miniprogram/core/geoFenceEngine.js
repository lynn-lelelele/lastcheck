// 围栏状态机：跟踪每个地点的进出状态，检测「离开围栏」事件。
// 纯逻辑，可脱离小程序环境单测。
const geofence = require('./geofence');

function createEngine() {
  let states = {};
  let listeners = [];

  function update(places, lat, lng) {
    const events = [];
    places.forEach((place) => {
      const inside = geofence.isInside(place, lat, lng);
      const prev = states[place.id];
      if (prev === undefined) {
        states[place.id] = { inside };
      } else if (prev.inside && !inside) {
        // 从围栏内到围栏外：离开事件
        events.push({ type: 'leave', place });
        states[place.id] = { inside: false };
      } else if (!prev.inside && inside) {
        states[place.id] = { inside: true };
      }
    });
    events.forEach((ev) => listeners.forEach((fn) => fn(ev)));
  }

  function onEvent(fn) {
    listeners.push(fn);
  }

  function reset() {
    states = {};
  }

  return { update, onEvent, reset };
}

module.exports = { createEngine };

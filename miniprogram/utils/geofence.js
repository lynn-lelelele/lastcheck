// 地理围栏工具：基于 Haversine 公式计算球面距离，判断是否离开围栏。

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

// 计算两个经纬度点的距离（米）
function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 是否位于地点围栏内（place: {latitude, longitude, radius}）
function isInside(place, lat, lng) {
  if (!place || typeof lat !== 'number' || typeof lng !== 'number') {
    return false;
  }
  const dist = distanceMeters(place.latitude, place.longitude, lat, lng);
  return dist <= place.radius;
}

module.exports = {
  distanceMeters,
  isInside
};
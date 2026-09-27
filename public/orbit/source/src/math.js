// Framework-free, unit-testable surface navigation. Angles are radians unless named.
export const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
export function normalize(v) {
  const length = Math.hypot(...v);
  if (!Number.isFinite(length) || length < 1e-12) throw new RangeError('Expected a finite nonzero vector');
  return v.map((n) => n / length);
}
export function fromLatLon(lat, lon) {
  const a = lat * Math.PI / 180, b = lon * Math.PI / 180;
  return [Math.cos(a) * Math.cos(b), Math.sin(a), Math.cos(a) * Math.sin(b)];
}
export const angleBetween = (a, b) => Math.acos(clamp(dot(normalize(a), normalize(b)), -1, 1));
export function tangentToward(normal, destination) {
  const n = normalize(normal), d = normalize(destination), c = dot(n, d);
  const tangent = d.map((v, i) => v - c * n[i]);
  if (Math.hypot(...tangent) > 1e-8) return normalize(tangent);
  // Same or antipodal points need a stable fallback tangent, not division by zero.
  return normalize(cross(n, Math.abs(n[1]) < .9 ? [0, 1, 0] : [1, 0, 0]));
}
export function advanceSurface(normal, tangent, angle) {
  const n = normalize(normal), projected = tangent.map((v, i) => v - dot(tangent, n) * n[i]);
  const t = normalize(projected), c = Math.cos(angle), s = Math.sin(angle);
  return { normal: normalize(n.map((v, i) => v*c+t[i]*s)), tangent: normalize(t.map((v, i) => v*c-n[i]*s)) };
}
export function seededRandom(seed = 42) {
  let value = seed >>> 0;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
}

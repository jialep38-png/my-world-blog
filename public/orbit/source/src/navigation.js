import { clamp, cross, dot, normalize, tangentToward } from './math.js';

const rotate = (vector, axis, angle) => {
  const c = Math.cos(angle), s = Math.sin(angle), crossed = cross(axis, vector), along = dot(axis, vector) * (1 - c);
  return vector.map((value, i) => value * c + crossed[i] * s + axis[i] * along);
};

/** A free orbit frame has no fixed north pole and remains valid after a full turn. */
export function orbitFrame(outward, up) {
  const view = normalize(outward), right = normalize(cross(up, view));
  return { outward: view, up: normalize(cross(view, right)) };
}

/** Drag in camera-local axes, so neither pole clamps nor Euler flips are needed. */
export function dragOrbit(frame, dx, dy, sensitivity = .005) {
  let { outward, up } = orbitFrame(frame.outward, frame.up);
  outward = rotate(outward, up, -dx * sensitivity);
  const right = normalize(cross(up, outward));
  outward = rotate(outward, right, -dy * sensitivity);
  up = rotate(up, right, -dy * sensitivity);
  return orbitFrame(outward, up);
}

/** Plan a shortest surface step, including a deterministic route to an antipode. */
export function surfaceStep(normal, destination, maxStep, stopAngle = .008) {
  const from = normalize(normal), to = normalize(destination);
  const distance = Math.acos(clamp(dot(from, to), -1, 1));
  const remaining = Math.max(0, distance - stopAngle);
  return {
    distance,
    reached: remaining <= 1e-6,
    step: Math.min(Math.max(0, maxStep), remaining),
    tangent: tangentToward(from, to),
  };
}

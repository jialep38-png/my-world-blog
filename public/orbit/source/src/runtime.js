/** Pure runtime policy, independent of WebGL and covered at different frame rates. */
export function frameSeconds(now, previous) {
  if(!Number.isFinite(now)||!Number.isFinite(previous))return 0;
  // Geodesic movement is analytic, not a collision simulation. Ordinary slow
  // frames must not lose time. Limit only exceptional stalls; pause/resume
  // resets the timestamp separately so background time never becomes movement.
  return Math.min(1,Math.max(0,(now-previous)/1000));
}

export function shouldAnimate({paused=false,hidden=false,inViewport=true,reducedMotion=false,active=false,dirty=false}) {
  // The garden keeps moving while a route, key or drag is active. At rest it
  // follows the same on-demand policy as the sculpture viewers: one dirty
  // frame, then no battery/GPU work until the next visible change.
  return !paused&&!hidden&&(active||(inViewport&&dirty));
}

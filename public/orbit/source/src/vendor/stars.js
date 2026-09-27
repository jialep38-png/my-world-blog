/**
 * Adapted from flo-bit/tiny-planets/src/worlds/stars.ts (MIT).
 * Commit: b51aa232dff0799908eb97927381bb33f40cf2d6
 * Copyright (c) 2025 flo-bit. Full notice: ../../licenses/tiny-planets-MIT.txt
 * Changes: TS -> ES module, seeded random, configurable color/size, explicit disposal.
 */
import * as THREE from 'three';
import { seededRandom } from '../math.js';

export class Stars extends THREE.Group {
  constructor(opts = {}) {
    super();
    const count = opts.particleCount ?? 5000;
    const min = opts.minimumDistance ?? 10, max = opts.maximumDistance ?? 20;
    const random = seededRandom(opts.seed ?? 42);
    const positions = new Float32Array(count * 3), colors = new Float32Array(count * 3);
    const vector = new THREE.Vector3();
    const color = new THREE.Color(opts.color ?? '#c6b389');
    for (let i = 0; i < count; i++) {
      const distance = random() * (max - min) + min;
      const y = random() * 2 - 1, theta = random() * Math.PI * 2;
      vector.set(Math.sqrt(1-y*y)*Math.cos(theta), y, Math.sqrt(1-y*y)*Math.sin(theta)).multiplyScalar(distance);
      positions.set(vector.toArray(), i * 3);
      const brightness = random() < .2 ? .4 : 1;
      colors.set([color.r*brightness, color.g*brightness, color.b*brightness], i * 3);
    }
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.material = new THREE.PointsMaterial({ size: opts.size ?? .04, vertexColors: true, transparent: true, opacity: .65, depthWrite: false });
    this.add(new THREE.Points(this.geometry, this.material));
  }
  dispose() { this.geometry.dispose(); this.material.dispose(); }
}

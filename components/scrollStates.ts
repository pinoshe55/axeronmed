export type ScrollState = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

export const SCROLL_STATES: ScrollState[] = [
  // 0 — Hero: right side, strong 3/4, lens turned toward viewer-left.
  // The GLB's lens points along −Z by default; ry = Math.PI puts the lens
  // head-on. ry = Math.PI − 0.82 gives a strong leftward turn.
  { id: "hero",    position: [ 0.75,  0.08, 0.08], rotation: [0.08, Math.PI - 0.82, 0.03], scale: 1.7 },
  // 1 — Closeup: left and forward, larger. Rotation continues in same arc.
  { id: "closeup", position: [-0.75,  0.05, 0.75], rotation: [0.05, Math.PI - 0.35, 0.02], scale: 2.2 },
  // 2 — Front-facing centered, lens straight at viewer.
  { id: "front",   position: [-0.3,  -0.05, 0.2 ], rotation: [0.02, Math.PI,        0   ], scale: 1.42 },
  // 3 — Top/side: lens stretches horizontally, body from top.
  { id: "top",     position: [ 0.0,   0.05, 0.4 ], rotation: [Math.PI/2 - 0.1, 0.0, Math.PI/2], scale: 1.38 },
  // 4 — Back/body: diagonal, lens pointing viewer-left.
  { id: "back",    position: [ 0.6,  -0.05, 0.0 ], rotation: [-0.1, -1.45, 0.18], scale: 1.27 },
  // 5 — Final: lens-facing viewer, on the LEFT, pulled inboard so body isn't cropped.
  { id: "final",   position: [-0.95, -0.05, 0.2 ], rotation: [0.04, Math.PI - 0.45, -0.02], scale: 1.46 },
];

// Mobile/tablet multipliers (≤1023px). Compresses motion toward centre
// and scales the model up so it fills the smaller canvas band.
export const MOBILE_SCALE_FACTOR = 1.1;
export const MOBILE_POSITION_FACTOR = 0.1;

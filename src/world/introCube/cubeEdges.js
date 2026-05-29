export const CUBE_HALF = 0.5

export const CUBE_EDGES = [
  // bottom
  [
    [-CUBE_HALF, -CUBE_HALF, -CUBE_HALF],
    [CUBE_HALF, -CUBE_HALF, -CUBE_HALF],
  ],
  [
    [CUBE_HALF, -CUBE_HALF, -CUBE_HALF],
    [CUBE_HALF, -CUBE_HALF, CUBE_HALF],
  ],
  [
    [CUBE_HALF, -CUBE_HALF, CUBE_HALF],
    [-CUBE_HALF, -CUBE_HALF, CUBE_HALF],
  ],
  [
    [-CUBE_HALF, -CUBE_HALF, CUBE_HALF],
    [-CUBE_HALF, -CUBE_HALF, -CUBE_HALF],
  ],
  // top
  [
    [-CUBE_HALF, CUBE_HALF, -CUBE_HALF],
    [CUBE_HALF, CUBE_HALF, -CUBE_HALF],
  ],
  [
    [CUBE_HALF, CUBE_HALF, -CUBE_HALF],
    [CUBE_HALF, CUBE_HALF, CUBE_HALF],
  ],
  [
    [CUBE_HALF, CUBE_HALF, CUBE_HALF],
    [-CUBE_HALF, CUBE_HALF, CUBE_HALF],
  ],
  [
    [-CUBE_HALF, CUBE_HALF, CUBE_HALF],
    [-CUBE_HALF, CUBE_HALF, -CUBE_HALF],
  ],
  // vertical
  [
    [-CUBE_HALF, -CUBE_HALF, -CUBE_HALF],
    [-CUBE_HALF, CUBE_HALF, -CUBE_HALF],
  ],
  [
    [CUBE_HALF, -CUBE_HALF, -CUBE_HALF],
    [CUBE_HALF, CUBE_HALF, -CUBE_HALF],
  ],
  [
    [CUBE_HALF, -CUBE_HALF, CUBE_HALF],
    [CUBE_HALF, CUBE_HALF, CUBE_HALF],
  ],
  [
    [-CUBE_HALF, -CUBE_HALF, CUBE_HALF],
    [-CUBE_HALF, CUBE_HALF, CUBE_HALF],
  ],
]

export const CUBE_FACE_NORMALS = [
  [0, 0, 1],
  [0, 0, -1],
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
]

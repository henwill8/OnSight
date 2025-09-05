/**
 * Calculates the area of a polygon using the shoelace theorem.
 * Accepts a flat array of coordinates: [x1, y1, x2, y2, ...]
 */
export function calculatePolygonArea(coordinates: number[]): number {
  let area = 0;
  const n = coordinates.length / 2;
  for (let i = 0; i < n; i++) {
    const x1 = coordinates[2 * i];
    const y1 = coordinates[2 * i + 1];
    const x2 = coordinates[2 * ((i + 1) % n)];
    const y2 = coordinates[2 * ((i + 1) % n) + 1];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) / 2;
}

/**
 * Simplify a polygon using the Ramer-Douglas-Peucker algorithm.
 * @param coords Flat array of [x1, y1, x2, y2, ...]
 * @param tolerance Higher values = more simplified
 * @returns A new flat array of simplified coordinates.
 */
export const simplifyPolygon = (coords: number[], tolerance: number): number[] => {
  if (coords.length <= 4) return coords;

  const points = coordsToPoints(coords);
  const simplifiedPoints = simplifyPointsRecursive(points, tolerance);
  return pointsToCoords(simplifiedPoints);
};

/**
 * Create a smooth bezier curve SVG path from a coordinate array.
 * @param coords Flat array of [x1, y1, x2, y2, ...]
 * @param smoothingFactor A factor to control the smoothness of the curve. Higher values mean more smoothing.
 * @returns An SVG path string for a smooth bezier curve.
 */
export const createSmoothPath = (coords: number[], smoothingFactor: number): string => {
  if (coords.length < 6) {
    return createLinearPath(coords);
  }

  const points = coordsToPoints(coords);
  const closedPoints = ensureClosedPath(points);
  
  return createBezierPath(closedPoints, smoothingFactor);
};

/**
 * Performs a point-in-polygon test for hit detection.
 * @param point The point to test, as a tuple [x, y].
 * @param polygon A flat array of polygon coordinates: [x1, y1, x2, y2, ...].
 * @returns True if the point is inside the polygon, false otherwise.
 */
export const pointInPolygon = (point: [number, number], polygon: number[]): boolean => {
  const [x, y] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 2; i < polygon.length; i += 2) {
    const xi = polygon[i];
    const yi = polygon[i + 1];
    const xj = polygon[j];
    const yj = polygon[j + 1];
    
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) {
      inside = !inside;
    }
    j = i;
  }
  
  return inside;
};

/**
 * Calculates the perpendicular distance from a point to a line segment.
 * @param point The coordinates of the point [x, y].
 * @param lineStart The starting coordinates of the line segment [x1, y1].
 * @param lineEnd The ending coordinates of the line segment [x2, y2].
 * @returns The perpendicular distance from the point to the line segment.
 */
export const perpendicularDistance = (
  point: number[], 
  lineStart: number[], 
  lineEnd: number[]
): number => {
  const dx = lineEnd[0] - lineStart[0];
  const dy = lineEnd[1] - lineStart[1];
  
  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag === 0) return 0;
  
  const nx = dx / mag;
  const ny = dy / mag;
  
  const pvx = point[0] - lineStart[0];
  const pvy = point[1] - lineStart[1];
  
  const pvdot = nx * pvx + ny * pvy;
  const ax = pvx - pvdot * nx;
  const ay = pvy - pvdot * ny;
  
  return Math.sqrt(ax * ax + ay * ay);
};

/**
 * Converts a flat array of coordinates [x1, y1, x2, y2, ...] into an array of points [[x1, y1], [x2, y2], ...].
 * @param coords The flat array of coordinates.
 * @returns An array of point tuples.
 */
const coordsToPoints = (coords: number[]): number[][] => {
  const points: number[][] = [];
  for (let i = 0; i < coords.length; i += 2) {
    points.push([coords[i], coords[i + 1]]);
  }
  return points;
};

/**
 * Converts an array of points [[x1, y1], [x2, y2], ...] into a flat array of coordinates [x1, y1, x2, y2, ...].
 * @param points The array of point tuples.
 * @returns A flat array of coordinates.
 */
const pointsToCoords = (points: number[][]): number[] => {
  const coords: number[] = [];
  points.forEach(p => coords.push(p[0], p[1]));
  return coords;
};

/**
 * Recursively simplifies a list of points using the Ramer-Douglas-Peucker algorithm.
 * @param points An array of point tuples [[x1, y1], [x2, y2], ...].
 * @param tolerance The maximum allowed distance between the original curve and the simplified curve.
 * @returns An array of simplified point tuples.
 */
const simplifyPointsRecursive = (points: number[][], tolerance: number): number[][] => {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let maxIndex = 0;
  
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  
  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], firstPoint, lastPoint);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }
  
  if (maxDistance > tolerance) {
    const firstHalf = points.slice(0, maxIndex + 1);
    const secondHalf = points.slice(maxIndex);
    
    const simplifiedFirst = simplifyPointsRecursive(firstHalf, tolerance);
    const simplifiedSecond = simplifyPointsRecursive(secondHalf, tolerance);
    
    // Combine, avoiding duplicate points
    return [...simplifiedFirst.slice(0, -1), ...simplifiedSecond];
  }
  
  return [firstPoint, lastPoint];
};

/**
 * Creates a linear SVG path string from a flat array of coordinates.
 * @param coords The flat array of coordinates: [x1, y1, x2, y2, ...].
 * @returns An SVG path string with linear segments.
 */
const createLinearPath = (coords: number[]): string => {
  let path = `M ${coords[0]},${coords[1]}`;
  for (let i = 2; i < coords.length; i += 2) {
    path += ` L ${coords[i]},${coords[i + 1]}`;
  }
  return path;
};

/**
 * Ensures a path represented by an array of points is closed by adding the first point to the end if necessary.
 * @param points An array of point tuples [[x1, y1], [x2, y2], ...].
 * @returns A new array of points, guaranteed to be closed.
 */
const ensureClosedPath = (points: number[][]): number[][] => {
  const first = points[0];
  const last = points[points.length - 1];
  
  if (first[0] !== last[0] || first[1] !== last[1]) {
    return [...points, [...first]];
  }
  
  return points;
};

/**
 * Creates a smooth Bezier curve SVG path string from an array of points.
 * This function generates control points to create a smooth curve that passes through each given point.
 * @param points An array of point tuples [[x1, y1], [x2, y2], ...].
 * @param smoothingFactor A factor that controls the tension of the curve. A higher value results in a tighter curve.
 * @returns An SVG path string for a smooth Bezier curve.
 */
const createBezierPath = (points: number[][], smoothingFactor: number): string => {
  let path = `M ${points[0][0]},${points[0][1]}`;
  
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    const controlPointLength = smoothingFactor * Math.hypot(next[0] - curr[0], next[1] - curr[1]) / 2;
    
    const prev = i > 0 ? points[i - 1] : points[points.length - 2];
    const nextNext = i < points.length - 2 ? points[i + 2] : points[1];
    
    const tangent1 = [next[0] - prev[0], next[1] - prev[1]];
    const tangent2 = [nextNext[0] - curr[0], nextNext[1] - curr[1]];
    
    const tan1Norm = normalizeVector(tangent1);
    const tan2Norm = normalizeVector(tangent2);
    
    const cp1 = [
      curr[0] + tan1Norm[0] * controlPointLength,
      curr[1] + tan1Norm[1] * controlPointLength
    ];
    
    const cp2 = [
      next[0] - tan2Norm[0] * controlPointLength,
      next[1] - tan2Norm[1] * controlPointLength
    ];
    
    path += ` C ${cp1[0]},${cp1[1]} ${cp2[0]},${cp2[1]} ${next[0]},${next[1]}`;
  }
  
  return path;
};

/**
 * Normalizes a 2D vector.
 * @param vector The vector to normalize, as a tuple [x, y].
 * @returns The normalized vector, or [0, 0] if the magnitude is zero.
 */
const normalizeVector = (vector: number[]): number[] => {
  const mag = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
  return mag ? [vector[0] / mag, vector[1] / mag] : [0, 0];
};
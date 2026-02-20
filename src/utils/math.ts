/**
 * Utility functions for movement detection and geometry
 */

export interface Point {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

/**
 * Calculates the angle between three points (A, B, C) where B is the vertex.
 * Returns the angle in degrees.
 */
export function calculateAngle(a: Point, b: Point, c: Point): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360 - angle;
  }

  return angle;
}

/**
 * Checks if a point is within a certain distance of another point (collision detection)
 */
export function checkCollision(p1: Point, p2: Point, threshold: number = 0.1): boolean {
  const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  return dist < threshold;
}

/**
 * Estimates calories burned based on activity type and duration
 */
export function estimateCalories(mode: string, durationSeconds: number): number {
  const metValues: Record<string, number> = {
    boxing: 12.0,
    dance: 8.0,
    stretching: 2.5,
    yoga: 3.0,
  };
  
  const met = metValues[mode] || 3.0;
  const weightKg = 70; // Average weight
  return (met * 3.5 * weightKg * (durationSeconds / 60)) / 200;
}

export function distance(fromX, fromY, toX, toY) {
  let dx = Math.abs(fromX-toX);
  let dy = Math.abs(fromY-toY);

  return Math.sqrt(dx*dx + dy*dy);
}

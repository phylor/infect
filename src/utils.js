export function rand(from, to) {
  return Math.floor(Math.random() * to) + from;
}

export function distance(fromX, fromY, toX, toY) {
  let dx = Math.abs(fromX-toX);
  let dy = Math.abs(fromY-toY);

  return Math.sqrt(dx*dx + dy*dy);
}

import 'phaser';
import { Graph } from 'graphlib';
import { union, intersection, pull, difference, reverse, cloneDeep } from 'lodash';
import { distance } from 'utils';

const TILE_SIZE = 30;

export default class Pathfinder {

  constructor(game, collisionObjects) {
    this.game = game;
    this.collisionObjects = collisionObjects;
  }

  findPath(fromX, fromY, toX, toY) {
    // TODO: hack: we can't calculate the graph during Game::create() because the sprites are not 
    // positioned yet (x == y == 0). We have to wait until the rendering is done. We calculate the 
    // graph as soon as someone asks for a route (because then the rendering is done).
    if(!Pathfinder.cachedG) this.staticGraph();
    if(!Pathfinder.collisionCachedBounds) return null;

    let directPath = this.hasDirectPath(fromX, fromY, toX, toY);

    var nextWaypoint;

    if(directPath)
      nextWaypoint = [toX, toY];
    else {
      let path = this.graph(fromX, fromY, toX, toY);

      nextWaypoint = path ? path[0] : null;
    }

    if(nextWaypoint) {
      if(this.probeDebugLine)
        this.probeDebugLine.destroy();

      this.probeDebugLine = this.game.add.graphics(fromX, fromY);
      this.probeDebugLine.lineStyle(3, directPath ? 0xff0000 : 0x00ff00, 1);
      this.probeDebugLine.lineTo(nextWaypoint[0]-fromX, nextWaypoint[1]-fromY);
      this.game.world.add(this.probeDebugLine);
    }

    return nextWaypoint;
  }

  getVelocity(fromX, fromY, toX, toY, SPEED) {
    let probeLine = new Phaser.Line(fromX, fromY, toX, toY);

    return [Math.cos(probeLine.angle)*SPEED, Math.sin(probeLine.angle)*SPEED];
  }

  hasDirectPath(fromX, fromY, toX, toY) {
    this.probeLine = new Phaser.Line(fromX, fromY, toX, toY);
    let probeCoordinates = this.probeLine.coordinatesOnLine();

    let hasCollision = this.collisionBounds().some(bounds => {
      return probeCoordinates.some(coordinate => bounds.contains(coordinate[0], coordinate[1]));
    });

    return !hasCollision;
  }

  collisionBounds() {
    return Pathfinder.collisionCachedBounds;
  }

  staticGraph() {
    this.game.stage.updateTransform();
    Pathfinder.collisionCachedBounds = this.collisionObjects.map(sprite => new Phaser.Rectangle().copyFrom(sprite.getBounds()).inflate(15, 15));
    if(!Pathfinder.debugBoundsShown) {
      let boundsGroup = this.game.add.group();

      Pathfinder.collisionCachedBounds.forEach(bounds => {
        let area = this.game.add.graphics(bounds.x, bounds.y);
        area.beginFill(0xFFFF00, 0.4);
        area.drawRect(0, 0, bounds.width, bounds.height);
        boundsGroup.add(area);
      });

      console.log('# bounds: ' + Pathfinder.collisionCachedBounds.length);

      Pathfinder.debugBoundsShown = true;
    }

    var g = new Graph();
    Pathfinder.cachedG = g;

    this.collisionBounds().forEach(bounds => {
      var points = [
        [bounds.x, bounds.y],
        [bounds.x+bounds.width, bounds.y],
        [bounds.x, bounds.y+bounds.height],
        [bounds.x+bounds.width, bounds.y+bounds.height]
      ];

      // cap points to world (otherwise we find paths which go around outside the world boundaries)
      points = points.map(point => [point[0] < 0 ? 0 : point[0], point[1] < 0 ? 0 : point[1]]);

      points.forEach(point => g.setNode(point.toString(), { x: point[0], y: point[1] }));
    });

    this.findVisibleNodes(g, g.nodes());
  }

  findVisibleNodes(g, nodes) {
    nodes.forEach(sourceNode => {
      let source = g.node(sourceNode);

      let visibleNodes = g.nodes().filter(targetNode => {
        let target = g.node(targetNode);
        return sourceNode != targetNode && this.hasDirectPath(source.x, source.y, target.x, target.y);
      });

      visibleNodes.forEach(visibleNode => g.setEdge(sourceNode, visibleNode));
    });
  }

  graph(fromX, fromY, toX, toY) {
    if(!Pathfinder.cachedG) this.staticGraph();
    let g = cloneDeep(Pathfinder.cachedG);

    g.setNode([fromX, fromY].toString(), { x: fromX, y: fromY, gScore: 0 });
    g.setNode([toX, toY].toString(), { x: toX, y: toY });

    let startingNode = [fromX, fromY].toString();
    let endNode = [toX, toY].toString();

    this.findVisibleNodes(g, [startingNode, endNode]);

    var openList = [startingNode];
    var closedList = [];
    var currentNode = startingNode;

    while(closedList.indexOf(endNode) == -1) {
      pull(openList, currentNode);
      closedList.push(currentNode);
      let current = g.node(currentNode);

      if(this.hasDirectPath(current.x, current.y, toX, toY)) {
        break;
      }

      let neighbors = g.outEdges(currentNode).map(edge => edge.w).filter(node => closedList.indexOf(node) == -1);
      let nodesAlreadyOnOpenList = intersection(openList, neighbors);
      let newNeighbors = difference(neighbors, openList);

      openList = union(openList, neighbors);

      nodesAlreadyOnOpenList.forEach(oldNeighborNode => {
        let current = g.node(currentNode);
        let parent = g.node(current.parent);
        let oldNeighbor = g.node(oldNeighborNode);

        let newGScoreViaCurrent = current.gScore + distance(current.x, current.y, oldNeighbor.x, oldNeighbor.y);

        if(oldNeighbor.gScore > newGScoreViaCurrent) {
          oldNeighbor['parent'] = currentNode;
          oldNeighbor['gScore'] = newGScoreViaCurrent;
          oldNeighbor['fScore'] = oldNeighbor['gScore'] + oldNeighbor['hScore'];

          g.setNode(oldNeighborNode, oldNeighbor);
        }
      });

      newNeighbors.forEach(neighbor => {
        let content = g.node(neighbor);
        let parent = g.node(currentNode);

        content['parent'] = currentNode;
        content['gScore'] = parent.gScore + distance(parent.x, parent.y, content.x, content.y);
        content['hScore'] = distance(content.x, content.y, toX, toY);
        content['fScore'] = content['gScore'] + content['hScore'];

        g.setNode(neighbor, content);
      });

      if(neighbors.length == 0) {
        if(openList.length == 0)
          break;

        currentNode = openList[0];
      }
      else {
        currentNode = neighbors.reduce((minimumNode, neighborNode) => {
          if(g.node(minimumNode).fScore > g.node(neighborNode).fScore)
            return neighborNode;
          else
            return minimumNode;
        }, neighbors[0]);
      }
    }

    // TODO: hack: only happens if the condition here has already been checked in the while loop above
    // and we broke out of it
    let current = g.node(currentNode);
    if(this.hasDirectPath(current.x, current.y, toX, toY)) {
      // TODO: that's a really ugly hack - but we somehow have to handle the last segment
      let content = g.node(endNode);
      content.x = current.x;
      content.y = current.y;
      content.parent = currentNode;
      g.setNode(endNode, content);

      closedList.push(endNode);
    }

    if(closedList.indexOf(endNode) == -1) {
      //console.log('No path found to ' + endNode);
      return null;
    }
    else {
      let path = [];
      currentNode = endNode;

      while(currentNode != startingNode) {
        path.splice(0, 0, currentNode);
        currentNode = g.node(currentNode).parent;
      }

      return path.map(node => {
        let content = g.node(node);

        return [content.x, content.y];
      });
    }
  }

  complete() {
    if(this.probeDebugLine)
      this.probeDebugLine.destroy();
  }
}

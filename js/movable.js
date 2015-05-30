var Movable = function(x, y, direction, options, renderCallback) {
  var _options = options;
  var speed = 2;
  var direction = direction;
  var step = 0.1;
  var factor = (1 / step);
  var _x = x * factor;
  var _y = y * factor;
  var _targetX = _x;
  var _targetY = _y;
  var _renderCallback = renderCallback;
  var _moving = false;

  return {
    changeDirection: function(newDirection) {
      direction = newDirection;
    },
    move: function() {
      switch (direction) {
        case Direction.LEFT:
          return this._move(-1, 0);
        case Direction.RIGHT:
          return this._move(1, 0);
        case Direction.UP:
          return this._move(0, -1);
        case Direction.DOWN:
          return this._move(0, 1);
      }
    },
    _move: function(relativeX, relativeY) {
      if (_x != _targetX || _y != _targetY) {
        // dont allow new targets when still moving
      } else {
        var plannedTargetX = _targetX + relativeX * factor;
        var plannedTargetY = _targetY + relativeY * factor;

        if (options.collisionCallback &&
            options.collisionCallback(plannedTargetX / factor, plannedTargetY / factor)) {
          return false;
        }

        _targetX = plannedTargetX;
        _targetY = plannedTargetY;
        _moving = true;
      }
    },
    animate: function() {
      if (options.onAnimate) {
        options.onAnimate(this);
      }
      if (_moving) {
        if (_x < _targetX) { _x += speed; }
        if (_x > _targetX) { _x -= speed; }
        if (_y < _targetY) { _y += speed; }
        if (_y > _targetY) { _y -= speed; }

        if (_moving && _x == _targetX && _y == _targetY) {
          _moving = false;
          if (options.destinationCallback) {
            options.destinationCallback(_targetX / factor, _targetY / factor, this);
          }
          // TODO: nur fuer player
          if (options.getBlock) {
            var t = options.getBlock('type', _x / factor, _y / factor);
            if (Block.isPipe(t)) {
              var newDir = null;
              switch(t) {
                case Block.PIPE_LEFT_DOWN:
                  this.changeDirection(
                    direction == Direction.RIGHT ? Direction.DOWN : Direction.LEFT);
                  break;
                case Block.PIPE_LEFT_UP:
                  this.changeDirection(
                    direction == Direction.RIGHT ? Direction.UP : Direction.LEFT);
                  break;
                case Block.PIPE_RIGHT_DOWN:
                  this.changeDirection(
                    direction == Direction.LEFT ? Direction.DOWN : Direction.RIGHT);
                  break;
                case Block.PIPE_RIGHT_UP:
                  this.changeDirection(
                    direction == Direction.LEFT ? Direction.UP : Direction.RIGHT);
                  break;
              }
              this.move();
            }
          }
        }
      }
      renderCallback(_x / factor, _y / factor, options.type);
    }
  };
};
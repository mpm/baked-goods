var Level = function(level) {
  var screen = new Screen();
  var _level = level;
  var score = {
    snacks: 0,
    coins: 0,
    lifes: 0,

    redKey: false,
    greenKey: false,
    blueKey: false
  };

  var monsters = [];

  var getBlock = function(attribute, x, y) {
    return _level.blocks.current[attribute][x * 40 + y];
  };

  var setBlock = function(attribute, x, y, value) {
    _level.blocks.current[attribute][x * 40 + y] = value;
  };

  var switchBlocksById = function(flags) {
    var switchId = Flag.getSwitchId(flags);
    var currentBlocks = _level.blocks.current;
    var altBlocks = _level.blocks.alternate;
    for (blockNr = 0; blockNr < currentBlocks.type.length; blockNr++) {
      if (altBlocks.func[blockNr] == Func.SWITCHABLE &&
        Flag.getSwitchId(altBlocks.flags[blockNr]) == switchId) {
        var originalBlock = {
          flags: _.clone(currentBlocks.flags[blockNr]),
          func: _.clone(currentBlocks.func[blockNr]),
          type: _.clone(currentBlocks.type[blockNr])
        };
        currentBlocks.flags[blockNr] = altBlocks.flags[blockNr];
        currentBlocks.func[blockNr] = altBlocks.func[blockNr];
        currentBlocks.type[blockNr] = altBlocks.type[blockNr];
        altBlocks.flags[blockNr] = originalBlock.flags;
        altBlocks.func[blockNr] = originalBlock.func;
        altBlocks.type[blockNr] = originalBlock.type;
      }
    }
  };

  var triggerSwitch = function(x, y) {
    var flags = getBlock('flags', x, y);
    switchBlocksById(flags);

    var type = getBlock('type', x, y);
    switch (type) {
      case Block.SWITCH1_ON:
        type = Block.SWITCH1_OFF;
        break;
      case Block.SWITCH1_OFF:
        type = Block.SWITCH1_ON;
        break;
      case Block.SWITCH2_ON:
        type = Block.SWITCH2_OFF;
        break;
      case Block.SWITCH2_OFF:
        type = Block.SWITCH2_ON;
        break;
    }
    setBlock('type', x, y, type);
    _drawMaze();
  };

  var playerCollision = function(x, y, direction) {
    var blockType = getBlock('type', x, y);
    var blocked = Flag.isBlockedForPlayer(getBlock('flags', x, y));

    if (blocked && Block.isPipe(blockType)) {
      return !Block.isPipePassable(blockType, direction);
    }
    return blocked;
  };

  var monsterCollision = function(x, y) {
    return Flag.isBlockedForMonster(getBlock('flags', x, y));
  };

  var handleBlock = function(x, y) {
    var block = getBlock('type', x, y);
    var func = getBlock('func', x, y);

    switch (block) {
      case Block.ITEM_COIN:
        setBlock('type', x, y, Block.EMPTY);
        score.coins += 1;
        _drawMaze();
        break;
      case Block.ITEM_SNACK:
        setBlock('type', x, y, Block.EMPTY);
        score.snacks += 1;
        _drawMaze();
        break;
      case Block.ITEM_LIFE:
        setBlock('type', x, y, Block.EMPTY);
        score.lifes += 1;
        _drawMaze();
        break;
    }

    if (func == Func.EXIT) {
      console.log('exit reached');
    }

    if (func == Func.SWITCH) {
      triggerSwitch(x, y);
      _drawMaze();
    }
  };

  var player = new Movable(level.info.start.x, level.info.start.y,
                           Direction.LEFT, {type: Block.PLAYER,
                            collisionCallback: playerCollision,
                            destinationCallback: handleBlock,
                             getBlock: getBlock},
                           screen.renderMovable);

  level.info.monsters.forEach(function(monster) {
    monsters.push(new Movable(monster.x, monster.y,
                              monster.direction,
                              {
                                type: Block.MONSTER,
                                collisionCallback: monsterCollision,
                                onAnimate: MonsterBrain
                              }, screen.renderMovable)
                 );
  });

  var _drawMaze = function() {
      screen.clearLayer('maze');
      for(var y = 0; y < 40; y++) {
        for(var x = 0; x < 64; x++) {
          screen.drawBlock('maze', x, y, getBlock('type', x, y));
        }
      }
  };


  return {
    player: player,

    drawMaze: _drawMaze,

    drawMovables: function() {
      monsters.forEach(function(monster) {
        monster.animate();
      });
      player.animate();
    }
  };
};

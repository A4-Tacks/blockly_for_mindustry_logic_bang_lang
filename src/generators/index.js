/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';

export const bangGenerator = new Blockly.Generator('Bang');

const Order = {
  ATOMIC: 0,
};

function getFieldValues(block, ...names) {
  const f = name => block.getFieldValue(name);
  return names.map(f);
};
function valueToCodes(generator, block, ...names) {
  const f = name => generator.valueToCode(block, name, Order.ATOMIC);
  return names.map(f);
};
/**
 * 根据给出的参数生成一个设置器
 * @param argsmap: {*: string[]}
 */
function setLabelSerializables(block, argsmap, argslen, name) {
  const f = text => {
    const args = argsmap[text];
    let i = 0;
    for (; i < args.length; i++)
      block.setFieldValue(args[i], name(i));
    for (; i < argslen; i++)
      block.setFieldValue('', name(i));
  };
  return f;
}

/**
 * fmt
 * %% => 字面量百分号
 * %s => 原样写入
 * %v => 单引号包裹
 * %r => 反引号包裹
 * %R => 反引号加单引号包裹
 * %a => 原样写入, 但是如果为空则填入0
 * %A => 原样写入, 但是如果为空则填入反引号包裹的0
 */
function logic_fmt(fmtter, ...args) {
  const f = name => `${name}`.replace(RegExp("'", 'g'), '"');
  let id = 0;
  const result = fmtter.replace(/%[svrR%aA]/g, s => {
    switch (s[1]) {
      case 's':
        return `${args[id++]}`;
      case 'v':
        return `'${f(args[id++])}'`;
      case 'r':
        return `\`${args[id++]}\``;
      case 'R':
        return `\`'${f(args[id++])}'\``;
      case '%':
        return '%';
      case 'a':
        return `${args[id++]}` || '0';
      case 'A':
        return `${args[id++]}` || '`0`';
    }
  });
  if (id != args.length)
    throw new RangeError(`fmtter.argc != args.length (${id} != ${args.length})`);
  return result;
}

bangGenerator.scrub_ = function(block, code, thisOnly) {
  const nextBlock =
      block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock && !thisOnly) {
    return code + '\n' + bangGenerator.blockToCode(nextBlock);
  }
  return code;
};

bangGenerator.forBlock['LogicLineOther'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const MAX_VALUE_ID = 14;
  let args = [];
  for (let i = 0; i <= MAX_VALUE_ID; i++) {
    const NAME = 'ARG' + i;
    const arg = generator.valueToCode(block, NAME, Order.ATOMIC);
    if (arg)
      args.push(arg);
  }
  return args.join(" ") + ';';
};

bangGenerator.forBlock['Var'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const reg = src => RegExp(src, 'g');
  const field = block.getField('NAME');
  let name = field.getValue();
  field.setValue(name.replace(reg('"'), "'"));
  name = field.getValue();
  if (!name) {
    field.setValue('0');
    return bangGenerator.forBlock['Var'](block, generator);
  }
  return [logic_fmt('%v', name), Order.ATOMIC];
};

bangGenerator.forBlock['String'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const reg = src => RegExp(src, 'g');
  const field = block.getField('TEXT');
  const name = field.getValue().replace(reg('"'), "'");
  field.setValue(name);
  return [`"${name}"`, Order.ATOMIC];
};

bangGenerator.forBlock['MultilineString'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const reg = src => RegExp(src, 'g');
  const field = block.getField('TEXT');
  const name = field.getValue().replace(reg('"'), "'");
  field.setValue(name);
  return [`"${name.replace(reg('\n'), '\\n')}"`, Order.ATOMIC];
};

bangGenerator.forBlock['ToValue'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const code = block.getFieldValue('VALUE');
  return [code, Order.ATOMIC];
};

bangGenerator.forBlock['Block'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const code = generator.statementToCode(block, 'LINES');
  return `{\n${code}\n}`;
};

bangGenerator.forBlock['Arg1Control'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const name = block.getFieldValue('TYPE');
  const code = generator.valueToCode(block, 'VALUE', Order.ATOMIC);
  const next_stmts = generator.statementToCode(block, 'LINES');
  return `${name} ${code} {\n${next_stmts}\n}`;
};

bangGenerator.forBlock['LogicRead'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [result, memory, address] = valueToCodes(
    generator,
    block,
    'RESULT',
    'MEMORY',
    'ADDRESS',
  );
  return logic_fmt('%r %A %A %A;', 'read', result, memory, address);
};

bangGenerator.forBlock['LogicWrite'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [value, memory, address] = valueToCodes(
    generator,
    block,
    'VALUE',
    'MEMORY',
    'ADDRESS',
  );
  return logic_fmt('%r %A %A %A;', 'write', value, memory, address);
};

bangGenerator.forBlock['LogicDraw'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const type = block.getFieldValue('TYPE');
  const [arg1, arg2, arg3, arg4, arg5, arg6] = valueToCodes(
    generator,
    block,
    'ARG1',
    'ARG2',
    'ARG3',
    'ARG4',
    'ARG5',
    'ARG6',
  );
  const set_texts = texts => {
    for (let num = 1; num <= 6; num++) {
      const name = `ARG${num}S`;
      block.setFieldValue(`${texts[num - 1]}`, name);
    }
  };
  switch (type) {
    case 'clear':
      set_texts(['r', 'g', 'b', '', '', '']);
      break;
    case 'color':
      set_texts(['r', 'g', 'b', 'a', '', '']);
      break;
    case 'col':
      set_texts(['color', '', '', '', '', '']);
      break;
    case 'stroke':
      set_texts(['', '', '', '', '', '']);
      break;
    case 'line':
      set_texts(['x', 'y', 'x2', 'y2', '', '']);
      break;
    case 'rect':
    case 'lineRect':
      set_texts(['x', 'y', 'width', 'height', '', '']);
      break;
    case 'poly':
    case 'linePoly':
      set_texts(['x', 'y', 'sides', 'radius', 'rotation', '']);
      break;
    case 'triangle':
      set_texts(['x', 'y', 'x2', 'y2', 'x3', 'y3']);
      break;
    case 'image':
      set_texts(['x', 'y', 'image', 'size', 'rotation', '']);
      break;
  }
  return logic_fmt('%r %r %A %A %A %A %A %A;',
    'draw', type, arg1, arg2, arg3, arg4, arg5, arg6);
};

bangGenerator.forBlock['LogicPrint'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [value] = valueToCodes(
    generator,
    block,
    'VALUE',
  );
  return logic_fmt('%R %A;', 'print', value);
};

bangGenerator.forBlock['LogicDrawFlush'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [value] = valueToCodes(
    generator,
    block,
    'VALUE',
  );
  return logic_fmt('%r %A;', 'drawflush', value);
};

bangGenerator.forBlock['LogicPrintFlush'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [value] = valueToCodes(
    generator,
    block,
    'VALUE',
  );
  return logic_fmt('%r %A;', 'printflush', value);
};

bangGenerator.forBlock['LogicGetLink'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [result, value] = valueToCodes(
    generator,
    block,
    'RESULT',
    'VALUE',
  );
  return logic_fmt('%r %A %A;', 'getlink', result, value);
};

bangGenerator.forBlock['LogicControl'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const type = block.getFieldValue('TYPE');
  const [arg1, arg2, arg3, arg4, arg5] = valueToCodes(
    generator,
    block,
    'ARG1',
    'ARG2',
    'ARG3',
    'ARG4',
    'ARG5',
  );
  const set_texts = texts => {
    for (let num = 2; num <= 5; num++) {
      const name = `ARG${num}S`;
      block.setFieldValue(`${texts[num - 2]}`, name);
    }
  };
  switch (type) {
    case 'enabled':
    case 'config':
    case 'color': // 旧逻辑为[r, g, b]
      set_texts(['to', '', '', '']);
      break;
    case 'shoot':
      set_texts(['x', 'y', 'shoot', '']);
      break;
    case 'shootp':
      set_texts(['unit', 'shoot', '', '']);
      break;
  }
  return logic_fmt('%r %r %A %A %A %A %A;',
    'control', type, arg1, arg2, arg3, arg4, arg5);
};

bangGenerator.forBlock['LogicRadar'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [tg1, tg2, tg3, sort] = getFieldValues(
    block,
    'TARGET1',
    'TARGET2',
    'TARGET3',
    'SORT',
  );
  const [from, ord, out] = valueToCodes(
    generator,
    block,
    'FROM',
    'ORDER',
    'OUTPUT',
  );
  return logic_fmt('%r %r %r %r %r %A %A %A;', 'radar', tg1, tg2, tg3, sort, from, ord, out);
};

bangGenerator.forBlock['SensorOptions'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const opt = block.getFieldValue('OPTION');
  return [`@${opt}`, Order.ATOMIC];
};

bangGenerator.forBlock['LogicSensor'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [result, option, target] = valueToCodes(
    generator,
    block,
    'RESULT',
    'OPTION',
    'TARGET',
  );
  return logic_fmt('%r %A %A %A;', 'sensor', result, target, option);
};

bangGenerator.forBlock['LogicSet'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [result, target] = valueToCodes(
    generator,
    block,
    'RESULT',
    'TARGET',
  );
  return logic_fmt('%R %A %A;', 'set', result, target);
};

bangGenerator.forBlock['LogicOp'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const oper = block.getFieldValue('OPER');
  const [result, arg1, arg2] = valueToCodes(
    generator,
    block,
    'RESULT',
    'ARG1',
    'ARG2',
  );
  return logic_fmt('%R %R %A %A %A;', 'op', oper, result, arg1, arg2);
};

bangGenerator.forBlock['LogicLookup'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const type = block.getFieldValue('TYPE');
  const [result, id] = valueToCodes(
    generator,
    block,
    'RESULT',
    'ID',
  );
  return logic_fmt('%r %r %A %A;', 'lookup', type, result, id);
};

bangGenerator.forBlock['LogicPackColor'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [result, r, g, b, a] = valueToCodes(
    generator,
    block,
    'RESULT',
    'R',
    'G',
    'B',
    'A',
  );
  return logic_fmt('%r %A %A %A %A %A;', 'packcolor', result, r, g, b, a);
};

bangGenerator.forBlock['LogicWait'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [time] = valueToCodes(
    generator,
    block,
    'TIME',
  );
  return logic_fmt('%r %A;', 'wait', time);
};

bangGenerator.forBlock['LogicStop'] = function(_block, _generator) {
  return '`stop`;';
};

bangGenerator.forBlock['LogicEnd'] = function(_block, _generator) {
  return '`end`;';
};

bangGenerator.forBlock['Label'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [label] = valueToCodes(
    generator,
    block,
    'LABEL',
  );
  return logic_fmt(':%a', label);
};

bangGenerator.forBlock['CmpNot'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [value] = valueToCodes(
    generator,
    block,
    'VALUE',
  );
  return [`goto(!${value})`, Order.ATOMIC];
};

bangGenerator.forBlock['Cmper'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const cmper = block.getFieldValue("CMPER");
  const [arg1, arg2] = valueToCodes(
    generator,
    block,
    'ARG1',
    'ARG2',
  );
  return [`goto(${arg1} ${cmper} ${arg2})`, Order.ATOMIC];
};

bangGenerator.forBlock['CmpAlways'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  return [`goto(_)`, Order.ATOMIC];
};

bangGenerator.forBlock['ItemVar'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const name = block.getFieldValue('ITEM');
  return [`@${name}`, Order.ATOMIC];
};

bangGenerator.forBlock['UnitVar'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const name = block.getFieldValue('UNIT');
  return [`@${name}`, Order.ATOMIC];
};

bangGenerator.forBlock['BlockVar'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const name = block.getFieldValue('BLOCK');
  return [`@${name}`, Order.ATOMIC];
};

bangGenerator.forBlock['LiquidVar'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const name = block.getFieldValue('LIQUID');
  return [`@${name}`, Order.ATOMIC];
};

bangGenerator.forBlock['LogicUnitBind'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [value] = valueToCodes(
    generator,
    block,
    'VALUE',
  );
  return logic_fmt('%r %A;', 'ubind', value);
};

bangGenerator.forBlock['LogicUnitControl'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const type = block.getFieldValue('TYPE');
  const [arg1, arg2, arg3, arg4, arg5] = valueToCodes(
    generator,
    block,
    'ARG1',
    'ARG2',
    'ARG3',
    'ARG4',
    'ARG5',
  );
  const arg_texts = {
    idle: [],
    stop: [],
    move: ["x", "y"],
    approach: ["x", "y", "radius"],
    pathfind: ["x", "y"],
    autoPathfind: [],
    boost: ["enable"],
    target: ["x", "y", "shoot"],
    targetp: ["unit", "shoot"],
    itemDrop: ["to", "amount"],
    itemTake: ["from", "item", "amount"],
    payDrop: [],
    payTake: ["takeUnits"],
    payEnter: [],
    mine: ["x", "y"],
    flag: ["value"],
    build: ["x", "y", "block", "rotation", "config"],
    getBlock: ["x", "y", "type", "building", "floor"],
    within: ["x", "y", "radius", "result"],
    unbind: [],
  };
  const set_texts = setLabelSerializables(
    block,
    arg_texts,
    5,
    i => `ARG${i+1}S`,
  );
  set_texts(type);
  return logic_fmt('%r %r %A %A %A %A %A;',
    'ucontrol', type, arg1, arg2, arg3, arg4, arg5);
};

bangGenerator.forBlock['LogicUnitRadar'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [tg1, tg2, tg3, sort] = getFieldValues(
    block,
    'TARGET1',
    'TARGET2',
    'TARGET3',
    'SORT',
  );
  const [ord, out] = valueToCodes(
    generator,
    block,
    'ORDER',
    'OUTPUT',
  );
  return logic_fmt('%r %r %r %r %r %r %A %A;', 'uradar', tg1, tg2, tg3, sort, 0, ord, out);
};

bangGenerator.forBlock['LogicUnitLocate'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [type, group] = getFieldValues(block, 'TYPE', 'ARG1');
  const [arg2, arg3, arg4, arg5, arg6, arg7] = valueToCodes(
    generator,
    block,
    'ARG2',
    'ARG3',
    'ARG4',
    'ARG5',
    'ARG6',
    'ARG7',
  );
  const arg_texts = {
    building: ['group', 'enemy', '', 'outX', 'outY', 'found', 'building'],
    ore: ['', '', 'ore', 'outX', 'outY', 'found'],
    spawn: ['', '', '', 'outX', 'outY', 'found', 'building'],
    damaged: ['', '', '', 'outX', 'outY', 'found', 'building'],
  };
  const set_texts = setLabelSerializables(
    block,
    arg_texts,
    7,
    i => `ARG${i+1}S`,
  );
  set_texts(type);
  return logic_fmt('%r %r %r %A %A %A %A %A %A;',
    'ulocate', type, group,
    arg2, arg3, arg4,
    arg5, arg6, arg7
  );
}

bangGenerator.forBlock['DoWhile'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const next_stmts = generator.statementToCode(block, 'LINES');
  const code = generator.valueToCode(block, 'VALUE', Order.ATOMIC);
  return `do {\n${next_stmts}\n} while ${code};`;
};

bangGenerator.forBlock['Goto'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [label, value] = valueToCodes(generator, block, 'LABEL', 'VALUE');
  return logic_fmt('goto :%a %A;', label, value);
};

bangGenerator.forBlock['Source'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const source = block.getFieldValue('SOURCE');
  return source;
};

bangGenerator.forBlock['Else'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const next_stmts = generator.statementToCode(block, 'LINES');
  return `else {\n${next_stmts}\n}`;
};

bangGenerator.forBlock['DExp'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const lines = generator.statementToCode(block, 'LINES');
  const result = generator.valueToCode(block, 'RESULT', Order.ATOMIC);
  const result_text = result ? result + ': ' : '';
  return [`(${result_text}\n${lines}\n)`, Order.ATOMIC];
};

bangGenerator.forBlock['ResultHandle'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  return ['$', Order.ATOMIC];
};

bangGenerator.forBlock['Else'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const next_stmts = generator.statementToCode(block, 'LINES');
  return `else {\n${next_stmts}\n}`;
};

bangGenerator.forBlock['DExp'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const lines = generator.statementToCode(block, 'LINES');
  const result = generator.valueToCode(block, 'RESULT', Order.ATOMIC);
  const result_text = result ? result + ': ' : '';
  return [`(${result_text}\n${lines}\n)`, Order.ATOMIC];
};

bangGenerator.forBlock['Const'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [name, value] = valueToCodes(generator, block, 'NAME', 'VALUE');
  return `const ${name} = ${value};`;
};

bangGenerator.forBlock['Take'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [name, value] = valueToCodes(generator, block, 'NAME', 'VALUE');
  return `take ${name} = ${value};`;
};

bangGenerator.forBlock['QuickTake'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const [name] = valueToCodes(generator, block, 'VAR');
  const args = [];
  for (let i = 0; i < 10; i++) {
    const name = `ARG${i}`;
    const code = generator.valueToCode(block, name, Order.ATOMIC);
    if (code) args.push(code);
  }
  return [`${name}[${args.join(' ')}]`, Order.ATOMIC];
};

bangGenerator.forBlock['SwitchCase'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const id = block.getFieldValue('ID');
  return `case ${id}:`
};

bangGenerator.forBlock['ControlPlus'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const type = block.getFieldValue('TYPE');
  const [cmp] = valueToCodes(generator, block, 'VALUE');
  return `${type} ${cmp};`
};

bangGenerator.forBlock['ControlBlock'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  while (true) {
    const [break_val, continue_val] = getFieldValues(
      block, 'BREAK_TYPE', 'CONTINUE_TYPE'
    );
    if (! (break_val || continue_val)) {
      block.setFieldValue('break', 'BREAK_TYPE');
      continue;
    }
    const f = str => str ? str + ' ' : str;
    const lines = generator.statementToCode(block, 'LINES');
    return `${f(break_val)}${f(continue_val)}{\n${lines}\n}`
  }
};

bangGenerator.forBlock['InlineBlock'] = function(block, generator) {
  if (! (block instanceof Blockly.Block && generator instanceof Blockly.CodeGenerator)) return;
  const lines = generator.statementToCode(block, 'LINES');
  return `inline {\n${lines}\n}`
};

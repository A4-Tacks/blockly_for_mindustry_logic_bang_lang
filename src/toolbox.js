/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Bang',
      contents: [
        {
          kind: 'block',
          type: 'LogicLineOther',
        },
        {
          kind: 'block',
          type: 'Block',
        },
        {
          kind: 'block',
          type: 'Arg1Control',
        },
        {
          kind: 'block',
          type: 'Else',
        },
        {
          kind: 'block',
          type: 'SwitchCase',
        },
        {
          kind: 'block',
          type: 'Goto',
        },
        {
          kind: 'block',
          type: 'ControlPlus',
        },
        {
          kind: 'block',
          type: 'DoWhile',
        },
        {
          kind: 'block',
          type: 'Label',
        },
        {
          kind: 'block',
          type: 'Const',
        },
        {
          kind: 'block',
          type: 'Take',
        },
        {
          kind: 'block',
          type: 'ControlBlock',
        },
        {
          kind: 'block',
          type: 'InlineBlock',
        },
        {
          kind: 'block',
          type: 'Source',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Value',
      contents: [
        {
          kind: 'block',
          type: 'Var',
        },
        {
          kind: 'block',
          type: 'String',
        },
        {
          kind: 'block',
          type: 'DExp',
        },
        {
          kind: 'block',
          type: 'ResultHandle',
        },
        {
          kind: 'block',
          type: 'Cmper',
        },
        {
          kind: 'block',
          type: 'CmpNot',
        },
        {
          kind: 'block',
          type: 'CmpAlways',
        },
        {
          kind: 'block',
          type: 'QuickTake',
        },
        {
          kind: 'block',
          type: 'MultilineString',
        },
        {
          kind: 'block',
          type: 'ToValue',
        },
        {
          kind: 'block',
          type: 'SensorOptions',
        },
        {
          kind: 'block',
          type: 'BlockVar',
        },
        {
          kind: 'block',
          type: 'UnitVar',
        },
        {
          kind: 'block',
          type: 'ItemVar',
        },
        {
          kind: 'block',
          type: 'LiquidVar',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Logic 输入 & 输出',
      contents: [
        {
          kind: 'block',
          type: 'LogicRead',
        },
        {
          kind: 'block',
          type: 'LogicWrite',
        },
        {
          kind: 'block',
          type: 'LogicDraw',
        },
        {
          kind: 'block',
          type: 'LogicPrint',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Logic 方块控制',
      contents: [
        {
          kind: 'block',
          type: 'LogicDrawFlush',
        },
        {
          kind: 'block',
          type: 'LogicPrintFlush',
        },
        {
          kind: 'block',
          type: 'LogicGetLink',
        },
        {
          kind: 'block',
          type: 'LogicControl',
        },
        {
          kind: 'block',
          type: 'LogicRadar',
        },
        {
          kind: 'block',
          type: 'LogicSensor',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Logic 操作',
      contents: [
        {
          kind: 'block',
          type: 'LogicSet',
        },
        {
          kind: 'block',
          type: 'LogicOp',
        },
        {
          kind: 'block',
          type: 'LogicLookup',
        },
        {
          kind: 'block',
          type: 'LogicPackColor',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Logic 流程控制',
      contents: [
        {
          kind: 'block',
          type: 'LogicWait',
        },
        {
          kind: 'block',
          type: 'LogicStop',
        },
        {
          kind: 'block',
          type: 'LogicEnd',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Logic 单位控制',
      contents: [
        {
          kind: 'block',
          type: 'LogicUnitBind',
        },
        {
          kind: 'block',
          type: 'LogicUnitControl',
        },
        {
          kind: 'block',
          type: 'LogicUnitRadar',
        },
        {
          kind: 'block',
          type: 'LogicUnitLocate',
        },
      ],
    },
  ],
};

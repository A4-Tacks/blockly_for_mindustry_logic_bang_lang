/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import * as BlocklyCore from 'blockly/core';
import {blocks} from './blocks';
import {bangGenerator} from './generators';
import {save, load} from './serialization';
import {toolbox} from './toolbox';
import './index.css';

// Register the blocks with Blockly
Blockly.common.defineBlocks(blocks);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
const blocklyDiv = document.getElementById('blocklyDiv');
const importDataButton = document.getElementById('importData');
const exportDataButton = document.getElementById('exportData');
const dataInputBox = document.getElementById('dataInputBox');
const workspace = Blockly.inject(blocklyDiv, {toolbox});

const theme = workspace.getTheme();
theme.fontStyle.family = "monospace";
workspace.setTheme(theme);

// This function resets the code div and shows the
// generated code from the workspace.
const runCode = () => {
  const code = bangGenerator.workspaceToCode(workspace);
  codeDiv.innerText = code;
};

importDataButton.addEventListener('click', function() {
  const jsonText = dataInputBox.value;
  let obj;
  try {
    obj = JSON.parse(jsonText)
  } catch (e) {
    alert(`JSON解析失败: ${e}`);
    return;
  }
  if (!confirm("是否确认导入数据?")) return;
  try {
    BlocklyCore.serialization.workspaces.load(obj, workspace, false);
  } catch (e) {
    alert(`导入失败: ${e}`);
  }
});

exportDataButton.addEventListener('click', function() {
  const data = BlocklyCore.serialization.workspaces.save(workspace);
  const jsonText = JSON.stringify(data);
  dataInputBox.value = jsonText;
});

// Load the initial state from storage and run the code.
load(workspace);
runCode();

// Every time the workspace changes state, save the changes to storage.
workspace.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(workspace);
});


// Whenever the workspace changes meaningfully, run the code again.
workspace.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING ||
    workspace.isDragging()) {
    return;
  }
  runCode();
});

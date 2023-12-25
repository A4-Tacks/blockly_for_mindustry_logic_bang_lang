/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

// Use a unique storage key for this codelab
const storageKey = 'bangGeneratorWorkspace';

/**
 * Saves the state of the workspace to browser's local storage.
 * @param {Blockly.Workspace} workspace Blockly workspace to save.
 */
export const save = function(workspace) {
  const data = Blockly.serialization.workspaces.save(workspace);
  window.localStorage?.setItem(storageKey, JSON.stringify(data));
};

/**
 * Loads saved state from local storage into the given workspace.
 * @param {Blockly.Workspace} workspace Blockly workspace to load into.
 */
export const load = function(workspace) {
  const data = window.localStorage?.getItem(storageKey);
  if (!data) return;

  loadObj(JSON.parse(data), workspace)
};

export const loadObj = function(obj, workspace) {
  // Don't emit events during loading.
  Blockly.Events.disable();
  Blockly.serialization.workspaces.load(obj, workspace, false);
  Blockly.Events.enable();
};

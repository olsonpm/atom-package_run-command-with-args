'use babel';

//---------//
// Imports //
//---------//

import _ from 'lodash';
import fp from 'lodash/fp';
import AtomSelectList from 'atom-select-list';
import createRunView from './run-view';

//
//------//
// Main //
//------//

export default function createSearchView(commandsWithArgsInitialized) {
  const state = initializeState();

  return {
    destroy,
    hide,
    show
  };

  // scoped helper functions

  function initializeState() {
    const initialState = {
      selectList: createSelectList()
    };

    initialState.modalPanel = atom.workspace.addModalPanel({
      item: initialState.selectList
    });

    return initialState;
  }

  function destroy() {
    state.selectList.destroy();
    state.modalPanel.destroy();
    _.invoke(state, ['runView', 'destroy']);

    if (state.previouslyFocusedElement) {
      state.previouslyFocusedElement.focus();
      delete state.previouslyFocusedElement;
    }
  }

  function hide() {
    state.modalPanel.hide();
    if (state.previouslyFocusedElement) {
      state.previouslyFocusedElement.focus();
      delete state.previouslyFocusedElement;
    }
  }

  async function show() {
    const items = await commandsWithArgsInitialized;
    state.previouslyFocusedElement = document.activeElement;
    state.selectList.reset();
    state.selectList.update({ items });
    state.modalPanel.show();
    state.selectList.focus();
  }

  function didConfirmSelection(cmd) {
    hide();
    state.runView = createRunView(cmd);
  }

  function createSelectList() {
    return new AtomSelectList({
      didCancelSelection: hide,
      didConfirmSelection: didConfirmSelection,
      elementForItem: item => {
        const li = document.createElement('li'),
          liContent = document.createTextNode(item.displayName);

        li.appendChild(liContent);

        return li;
      },
      emptyMessage: 'No commands with args exist',
      filterKeyForItem: fp.get('displayName'),
      initiallyVisibleItemCount: 10,
      items: []
    });
  }
}

'use babel';

//---------//
// Imports //
//---------//

import _ from 'lodash';
import fp from 'lodash/fp';
import { CompositeDisposable, Disposable } from 'atom';

//
//------//
// Main //
//------//

export default function createRunView(_cmd) {
  const state = initializeState();
  state.modalPanel = atom.workspace.addModalPanel({
    item: createForm()
  });
  initializeFocus();

  return {
    destroy
  };

  // scoped helper functions

  function initializeFocus() {
    const firstInput = state.modalPanel.getItem().querySelector('.args input');
    firstInput.focus();
  }

  function initializeState() {
    return {
      cmd: _cmd,
      disposables: new CompositeDisposable(),
      previouslyFocusedElement: document.activeElement
    };
  }

  function addDisposableEventListener(node, name, fn, ...otherArgs) {
    node.addEventListener(name, fn, ...otherArgs);
    state.disposables.add(
      new Disposable(() => {
        node.removeEventListener(name, fn, ...otherArgs);
      })
    );
  }

  function createForm() {
    const form = document.createElement('form');
    form.classList.add('run-command-with-args', 'run-view');
    form.setAttribute('action', 'javascript:undefined');
    addDisposableEventListener(form, 'submit', submit);
    addDisposableEventListener(form, 'keyup', formKeyup);

    const title = document.createElement('h3'),
      titleContent = document.createTextNode(state.cmd.displayName);

    title.appendChild(titleContent);
    form.appendChild(title);

    form.appendChild(createArgList());
    form.appendChild(createActions());

    return form;
  }

  function submit() {
    const argInputs = state.modalPanel
        .getItem()
        .querySelectorAll('.args input'),
      args = _.map(argInputs, fp.get('value'));

    state.cmd.function(...args);
    destroy();
  }

  function createActions() {
    const actions = document.createElement('div');
    actions.classList.add('actions');

    const run = document.createElement('button'),
      runContent = document.createTextNode('Run');
    run.appendChild(runContent);
    actions.appendChild(run);

    const cancel = document.createElement('button'),
      cancelContent = document.createTextNode('Cancel');
    cancel.appendChild(cancelContent);
    cancel.setAttribute('type', 'button');
    addDisposableEventListener(cancel, 'click', destroy);
    actions.appendChild(cancel);

    return actions;
  }

  function createArgList() {
    const argList = document.createElement('ol');
    argList.classList.add('args');

    _.each(state.cmd.args, (name, idx) => {
      const arg = document.createElement('li'),
        inputId = `run-command-with-args_arg-${idx}`,
        label = document.createElement('label'),
        labelContent = document.createTextNode(name),
        input = document.createElement('input');

      label.setAttribute('for', inputId);
      label.appendChild(labelContent);
      input.id = inputId;
      input.setAttribute('type', 'text');
      input.classList.add('native-key-bindings');
      arg.appendChild(label);
      arg.appendChild(input);

      argList.appendChild(arg);
    });

    return argList;
  }

  function formKeyup(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      destroy();
    }
  }

  function destroy() {
    state.disposables.dispose();
    state.modalPanel.destroy();
    _.invoke(state, 'previouslyFocusedElement.focus');
    delete state.previouslyFocusedElement;
  }
}

'use babel';

//---------//
// Imports //
//---------//

import _ from 'lodash';
import fp from 'lodash/fp';
import createSearchView from './create/search-view';
import { CompositeDisposable } from 'atom';

//
//------//
// Init //
//------//

const commandsWithArgsInitialized = createDeferred();

//
//------//
// Main //
//------//

export default {
  activate() {
    this.searchView = createSearchView(commandsWithArgsInitialized.promise);
    const show = this.searchView.show;

    this.disposables = new CompositeDisposable();
    this.disposables.add(
      atom.commands.add('atom-workspace', {
        'run-command-with-args:search': show
      })
    );
  },

  deactivate() {
    this.disposables.dispose();
    this.searchView.destroy();
  },

  initializeCommands(commands) {
    return fp.flow(fp.map(sanitize), commandsWithArgsInitialized.resolve)(
      commands
    );
  }
};

//
//------------------//
// Helper Functions //
//------------------//

function sanitize(aCommand) {
  return _.defaults(aCommand, { opts: {} });
}

function createDeferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    resolve,
    reject,
    promise
  };
}

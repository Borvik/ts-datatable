import React, { useCallback, useEffect } from 'react';
import { initializeDB, SQLDatabase } from './db';
import type { RefMethods, RefState } from '../library/';

import 'setimmediate';

import { AsyncDataExample } from './async-data';
import { ManualDataExample } from './manual-data';
import { FullFeaturedExample } from './full';

import './style.scss';

interface ExampleChooser { [x: string]: React.ElementType<any> }

const Examples: ExampleChooser = {
  AsyncData: AsyncDataExample,
  ManualData: ManualDataExample,
  Full: FullFeaturedExample,
}

// function notEmpty<T>(value: T | null | undefined): value is T {
//   return (value !== null && typeof value !== 'undefined');
// }

const addBodyClass = (className: string) => document.body.classList.add(className);
const removeBodyClass = (className: string) => document.body.classList.remove(className);

let testData: RefState | null = null;

function App() {
  const [theme, setTheme] = React.useState('dark');
  const [theDb, setDB] = React.useState<SQLDatabase | null>(null);
  const [selectedExample, setExample] = React.useState('ManualData');
  const tableRef = React.useRef<RefMethods | null>(null);

  useEffect(() => {
    addBodyClass(theme);
    return () => removeBodyClass(theme);
  }, [theme]);

  useEffect(() => {
    initializeDB(setDB);
  }, []);

  const saveFilter = useCallback(() => {
    testData = tableRef.current.getState();
    debugger;
  }, []);

  const loadFilter = useCallback(() => {
    if (!testData) return;
    tableRef.current.setState(testData);
  }, []);

  if (!theDb) return <></>;

  const examples = Object.keys(Examples);
  const ExampleTag = Examples[selectedExample];
  return (
    <div className={`App`}>
      <header className="App-header">
        <button type='button' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle Theme</button>
        <button type='button' onClick={saveFilter}>Save Filter</button>
        <button type='button' onClick={loadFilter}>Restore Filter</button>
        <span> Note: Because Type/Weakness are actually stored as a comma separated list - the filter is there as an example only and doesn't work as expected.  Also "View" button does nothing.</span>
        <select style={{marginLeft: 'auto'}} value={selectedExample} onChange={(e) => {
          testData = null;
          setExample(e.target.value)
        }}>
          {examples.map(exampleKey => (<option key={exampleKey} value={exampleKey}>{exampleKey} Example</option>))}
        </select>
      </header>
      <div>
        <ExampleTag tableRef={tableRef} />
      </div>
    </div>
  );
}

export default App;
import React, { useEffect } from 'react';
import './App.css';
import { initializeDB, SQLDatabase } from './db';

import { AsyncDataExample } from './async-data';
import { ManualDataExample } from './manual-data';
import { FullFeaturedExample } from './full';

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

function App() {
  const [theme, setTheme] = React.useState('dark');
  const [theDb, setDB] = React.useState<SQLDatabase | null>(null);
  const [selectedExample, setExample] = React.useState('ManualData');

  useEffect(() => {
    addBodyClass(theme);
    return () => removeBodyClass(theme);
  }, [theme]);

  useEffect(() => {
    initializeDB(setDB);
  }, []);

  if (!theDb) return <></>;

  const examples = Object.keys(Examples);
  const ExampleTag = Examples[selectedExample];
  return (
    <div className={`App`}>
      <header className="App-header">
        <button type='button' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle Theme</button>
        <span> Note: Because Type/Weakness are actually stored as a comma separated list - the filter is there as an example only and doesn't work as expected.</span>
        <select style={{marginLeft: 'auto'}} value={selectedExample} onChange={(e) => setExample(e.target.value)}>
          {examples.map(exampleKey => (<option key={exampleKey} value={exampleKey}>{exampleKey} Example</option>))}
        </select>
      </header>
      <div>
        <ExampleTag />
      </div>
    </div>
  );
}

export default App;
import React from 'react';
import { DataTable } from './lib';
import './App.css';

const pokemon = require('./dataset.json').pokemon;

function App() {
  const [theme, setTheme] = React.useState('dark');

  return (
    <div className={`App ${theme}`}>
      <header className="App-header">
        <button type='button' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle Theme</button>
      </header>
      <div>
        <DataTable<any>
          id='pokemon'
          data={pokemon}
          columns={[
            {
              header: 'ID',
              accessor: 'id'
            },
            {
              header: 'Num',
              accessor: 'num'
            },
            {
              header: 'Image',
              accessor: 'img',
              render: (value: any) => <img alt='' src={value} style={{maxHeight: '50px'}} />
            },
            {
              header: 'Name',
              accessor: 'name'
            },
            {
              header: 'Type',
              accessor: 'type',
              render: (value: any) => {
                if (!value) return null;
                if (!Array.isArray(value)) return value;
                return value.join(', ');
              }
            },
            {
              header: 'Size',
              columns: [
                {
                  header: 'Height',
                  accessor: 'height'
                },
                {
                  header: 'Weight',
                  accessor: 'weight'
                }
              ]
            },
            {
              header: 'Weaknesses',
              accessor: 'weaknesses',
              render: (value: any) => {
                if (!value) return null;
                if (!Array.isArray(value)) return value;
                return value.join(', ');
              }
            },
            {
              header: 'Candy',
              accessor: 'candy'
            },
            {
              header: 'Candy Count',
              accessor: 'candy_count'
            },
            {
              header: 'Egg',
              accessor: 'egg'
            },
            {
              header: 'Evolves To',
              accessor: 'next_evolution',
              render: (value: any) => {
                if (!value) return null;
                if (!Array.isArray(value)) return value;
                return value.map(v => v.name).join(' => ');
              }
            },
            {
              header: 'Evolves From',
              accessor: 'prev_evolution',
              render: (value: any) => {
                if (!value) return null;
                if (!Array.isArray(value)) return value;
                return value.map(v => v.name).join(' => ');
              }
            },
            {
              header: 'Spawn Chance',
              accessor: 'spawn_chance',
              render: (value: any) => `${(value * 100).toPrecision(3)}%`
            },
            {
              header: 'Avg. Spawns',
              accessor: 'avg_spawns',
              fixed: 'right',
            },
            {
              header: 'Spawn Time',
              accessor: 'spawn_time',
              fixed: 'right'
            },
          ]}
        />
      </div>
    </div>
  );
}

export default App;

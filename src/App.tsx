import React from 'react';
import { DataTable } from './lib';
import './App.css';

const pokemon: any[] = require('./dataset.json').pokemon;

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
          // data={pokemon}
          data={async ({ pagination }) => {
            return await new Promise((resolve) => {
              setTimeout(() => {
                // do fake filters

                let offset = (pagination.page - 1) * pagination.limit;
                let len = (pagination.page * pagination.limit);
                resolve({
                  total: pokemon.length,
                  data: pokemon.slice(offset, len),
                });
              }, 750);
            });

            // let offset = (pagination.page - 1) * pagination.limit;
            // let len = (pagination.page * pagination.limit);
                
            // return {
            //   total: pokemon.length,
            //   data: pokemon.slice(offset, len),
            // };
          }}
          fixedColBg='var(--dt-fixed-bg, white)'
          paginateOptions={{
            buttonPosition: 'split',
            showFirstLast: true,
          }}
          columns={[
            {
              header: 'ID',
              accessor: 'id',
              fixed: 'left',
            },
            {
              header: 'Num',
              accessor: 'num'
            },
            {
              header: 'Image',
              accessor: 'img',
              sortable: false,
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
              accessor: 'candy',
              className: 'no-wrap fw',
            },
            {
              header: 'Candy Count',
              className: 'no-wrap',
              accessor: 'candy_count'
            },
            {
              header: 'Egg',
              accessor: 'egg'
            },
            {
              header: 'Evolves To',
              accessor: 'next_evolution',
              className: 'no-wrap',
              render: (value: any) => {
                if (!value) return null;
                if (!Array.isArray(value)) return value;
                return value.map(v => v.name).join(' => ');
              }
            },
            {
              header: 'Evolves From',
              accessor: 'prev_evolution',
              className: 'no-wrap',
              render: (value: any) => {
                if (!value) return null;
                if (!Array.isArray(value)) return value;
                return value.map(v => v.name).join(' => ');
              }
            },
            {
              header: 'Spawn Chance',
              accessor: 'spawn_chance',
              className: 'no-wrap',
              render: (value: any) => `${(value * 100).toPrecision(3)}%`
            },
            {
              header: 'Avg. Spawns',
              accessor: 'avg_spawns',
              className: 'no-wrap',
            },
            {
              header: 'Spawn Time',
              accessor: 'spawn_time',
              className: 'no-wrap',
              fixed: 'right'
            },
          ]}
        />
      </div>
    </div>
  );
}

export default App;

import React from 'react';
import { DataTable } from './lib';
import './App.css';

import { useDialog } from './lib/components/dialog';
import { EditDialog } from './lib/components/dialog/test';

const pokemon: any[] = require('./dataset.json').pokemon;

const userData: any[] = [
  {first_name: 'Chris', last_name: 'Kolkman'},
  {first_name: 'Ash', last_name: 'Ketchum'},
];

function App() {
  const [theme, setTheme] = React.useState('dark');
  const [dataIdx, setDataIdx] = React.useState<number | null>(null);
  const {dialog: EditUserDialog, showDialog} = useDialog(<EditDialog data={userData[dataIdx]} />);

  return (
    <div className={`App ${theme}`}>
      {EditUserDialog}
      <header className="App-header">
        <button type='button' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle Theme</button>
        <button type='button' onClick={async () => {
          if (dataIdx === null) setDataIdx(0);
          else setDataIdx(1 - dataIdx);

          let result = await showDialog();
          console.log('Dialog Result:', result);
        }}>Dialog?</button>
      </header>
      <div>
        <DataTable<any>
          id='pokemon'
          
          // data={pokemon} // Pass Data in directly
          // totalCount={5} // Total count to enable pagination

          // Async data loading (recommended way)
          data={async ({ pagination, search }) => {
            // This promise, timeout, and filter is all to
            // simulate an API call.
            return await new Promise((resolve) => {
              setTimeout(() => {
                // do fake filters
                let filteredPokemon = pokemon.filter(p => {
                  if (!search) return true;

                  let matched: boolean = false;
                  if (search && p.type) {
                    let re = new RegExp(`${search.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'i');
                    let type: string = Array.isArray(p.type) ? p.type.join(', ') : p.type;
                    matched = !!type.match(re);
                  }

                  return matched;
                });

                let offset = (pagination.page - 1) * pagination.perPage;
                let len = (pagination.page * pagination.perPage);

                // Can return either just the array, or
                // an object containing the total number of items
                // for pagination
                resolve({
                  total: filteredPokemon.length,
                  data: filteredPokemon.slice(offset, len),
                });
              }, 750);
            });

            // Function doesn't _need_ to be async, could
            // be synchronous, though wouldn't really be an api call

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
            perPageOptions: 'any',
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

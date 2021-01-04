import React from 'react';
import { DataColumnProp } from "../lib";
import { CustomInputWrapper, CustomTypeColumnEditor, CustomTypeSelectEditor } from "./custom-editors";
import { Pokemon } from "./db";

export const CommonColumns: Partial<DataColumnProp<Pokemon>>[] = [
  {
    header: 'ID',
    accessor: 'id',
    fixed: 'left',
    canToggleVisibility: false,
    filter: {
      type: 'number',
      parseAsType: 'number',
    },
    isPrimaryKey: true,
  },
  {
    header: 'Num',
    accessor: 'num',
    defaultSortDir: 'desc',
    filter: {
      type: 'string',
    },
  },
  {
    header: 'Image',
    accessor: 'img',
    sortable: false,
    render: (value: any) => <img alt='' src={value} style={{maxHeight: '50px'}} />,
    filter: {
      type: 'boolean'
    }
  },
  {
    header: 'Name',
    accessor: 'name',
    editor: { type: 'text' },
    EditorWrapper: CustomInputWrapper,
    canEdit: (row) => row.id !== 3,
    filter: {
      type: 'string',
    },
  },
  {
    header: 'Type',
    accessor: 'type',
    sortable: false,
    render: (value: any) => {
      if (!value) return null;
      if (!Array.isArray(value)) return value;
      return value.join(', ');
    },
    filter: {
      type: 'custom',
      toDisplay: (value: any) => value,
      Editor: CustomTypeSelectEditor,
    },
    editor: {
      type: 'custom',
      Editor: CustomTypeColumnEditor,
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
        header: 'Length',
        accessor: 'length', // doesn't exist in dataset
      }
    ]
  },
  {
    header: 'Weight',
    accessor: 'weight'
  },
  {
    header: 'Weaknesses',
    accessor: 'weaknesses',
    sortable: false,
    render: (value: any) => {
      if (!value) return null;
      if (!Array.isArray(value)) return value;
      return value.join(', ');
    },
    filter: {
      type: 'custom',
      toDisplay: (value: any) => value,
      Editor: CustomTypeSelectEditor
    }
  },
  {
    header: 'Candy',
    accessor: 'candy',
    className: 'no-wrap fw',
    filter: {
      type: 'string',
    }
  },
  {
    header: 'Candy Count',
    className: 'no-wrap',
    accessor: 'candy_count',
    filter: {
      type: 'number',
      parseAsType: 'number',
    }
  },
  {
    header: 'Egg',
    accessor: 'egg'
  },
  {
    header: 'Evolves To',
    accessor: 'next_evolution',
    className: 'no-wrap',
    sortable: false,
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
    sortable: false,
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
  },
  {
    header: 'Collected',
    accessor: 'collected',
    className: 'no-wrap',
    fixed: 'right',
    render: (value: any) => value ? 'Yes' : 'No',
    editor: {
      type: 'checkbox',
    }
  }
]
import React from 'react';
import { DataTable, RowSelectorCheckboxProps, TableActionButtonsProps } from '../../library';
import { CommonColumns } from '../columns';
import { DataState, onQueryChange, Pokemon, query, sqliteParams } from '../db';

export function FullFeaturedExample({tableRef}) {
  const [staticData, setStaticData] = React.useState<DataState>({list: [], total: 0, loading: true});
  
  return <DataTable<Pokemon>
    id='pokemon'
    editMode='show'
    methodRef={tableRef}
    filters={[
      {
        filterKey: 'who_knows',
        label: 'WhoKnows',
        type: 'string',
      }
    ]}
    filterSettings={{
      allowOr: true,
      allowNested: true,
      limitOneColumnUse: true,
    }}
    fixedColBg='var(--dt-fixed-bg, white)'
    defaultSort={[
      {column: 'id', direction: 'asc'}
    ]}
    multiColumnSorts={true}
    canReorderColumns={true}
    paginateOptions={{
      buttonPosition: 'split',
      showFirstLast: true,
      perPageOptions: 'any',
      defaultPerPage: 50,
    }}
    classNames={{
      dialogButton: 'btn',
      dialogApplyButton: 'btn-apply',
      dialogCloseButton: 'btn-close',
      actionButton: 'btn',
      actionButtonDiscard: 'btn-discard',
      actionButtonEdit: 'btn-edit',
      actionButtonFilter: 'btn-filter',
      actionButtonSave: 'btn-save',
      actionButtonSettings: 'btn-settings',
    }}
    labels={{
      search: 'Search',
      perPage: 'Per Page',
      page: 'Page',
      pageOf: 'of',
      first: 'First',
      previous: 'Previous',
      next: 'Next',
      last: 'Last',
      close: 'Close',
      apply: 'Apply',
      columns: 'Columns',
      settings: 'Settings',
      quickEdit: 'Quick Edit',
      saveChanges: 'Save Changes',
      discardChanges: 'Discard Changes',
      filter: 'Filter',
    }}
    quickEditPosition='top'
    onSaveQuickEdit={async (data) => {
      // loop through and save or craft single update
      for (let primaryKey of Object.keys(data)) {
        let updateSqls = Object.keys(data[primaryKey]).map(field => `${field} = :${field}`);
        let sql = `UPDATE pokemon SET ${updateSqls.join(', ')} WHERE id = :id;`;
        query(sql, sqliteParams({
          ...data[primaryKey],
          id: primaryKey,
        }));
      }
    }}
    canEditRow={(data) => data.id !== 7}
    DetailRow={({parentRow}) => <div>Detail row for {parentRow.name} goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisis commodo purus eget vehicula. Duis sodales sem orci, et pulvinar neque lacinia ut. Fusce in massa vel lorem consequat maximus nec ac lectus. In in elementum nulla. Quisque odio purus, euismod sed ullamcorper commodo, ullamcorper in ligula. Fusce sollicitudin pretium diam a facilisis. In fermentum, lectus quis efficitur suscipit, justo elit fermentum velit, in aliquet massa nisi suscipit ligula. Etiam volutpat id nulla at eleifend. Nulla tristique tellus ipsum, in gravida mauris ornare et. Mauris aliquet blandit risus ac ornare.</div>}
    canRowShowDetail={(data) => data.id !== 4}
    getTableRowProps={(row) => {
      if(row.id === 1){
        return {style: { backgroundColor: 'gray'}}
      }
    }}
    getTableCellProps={(_value, row, column) => {
      if(column.accessor === "id" && row.id === 1) {
        return {
          className: 'gold-border',
          style: {
            textAlign: 'center',
          }
        }
      }
    }}
    canGroupBy={true}
    canSelectRows={true}
    canSelectRow={(data) => data.id !== 3}
    onSelectionChange={(ids, rows) => {
      // Probably store the selected in a state somewhere for use in an API call
      console.log('Selected:', ids, rows);
    }}

    columns={CommonColumns}

    onQueryChange={(queryProps) => onQueryChange(queryProps, setStaticData)} // Notifies of filter/pagination/search/sort changes
    footerData={staticData.footerData}
    data={staticData.list} // Pass Data in directly
    totalCount={staticData.total} // Total count to enable pagination
    isLoading={staticData.loading} // Allows external to show loading indicator
    defaultGroupBy={[{column: 'candy', direction: 'asc'}]}

    components={{
      Buttons: {
        ColumnPicker: CustomColPicker,
        Filter: CustomFilterBtn,
      },
      ActionButtons: CustomActionButtons,
      RowCheckbox: CustomCheckbox,
    }}

    // preMDRColumn={{
    //   accessor: '',
    //   render: (_, _row) => {
    //     return 'Qwerty'
    //   },
    //   preMDRColumnWidth: 15
    // }}
  />
}

type PartialRequire<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>
type ButtonOnClick = PartialRequire<React.HTMLProps<HTMLButtonElement>, 'onClick'>;

export class CustomColPicker extends React.Component<ButtonOnClick> {

  render() {
    const { onClick } = this.props;

    return <button type='button' title='Custom Settings' onClick={onClick}>
      Settings
    </button>
  }

}


type FilterProps = PartialRequire<React.HTMLProps<HTMLButtonElement>, 'onClick' | 'disabled'>;
export class CustomFilterBtn extends React.Component<FilterProps> {

  render() {
    const { onClick, disabled } = this.props;

    return <button type='button' title='Filter Test' disabled={disabled} onClick={onClick}>
      Filter
    </button>
  }

}

export class CustomActionButtons extends React.Component<TableActionButtonsProps> {

  render() {
    const { buttons: { quickEdit, filter, columnPicker }} = this.props;

    return <>
      {columnPicker}
      <button>test</button>
      {filter}
      {quickEdit}
    </>
  }
}

export class CustomCheckbox extends React.Component<RowSelectorCheckboxProps<any>> {
  
  render() {
    const { checked, indeterminate, onChange } = this.props;
    return <input
      type='checkbox'
      ref={(el) => el && (el.indeterminate = indeterminate)}
      checked={checked}
      onChange={onChange}
      // inspect checkbox to see that custom is working
      data-test={'custom-working'}
    />;
  }
}
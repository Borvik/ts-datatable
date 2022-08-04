import React, { useContext } from 'react';
import { SearchProps } from './types';
import { useDerivedState } from '../../utils/useDerivedState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { ColumnContext, useTableSelector } from '../table/contexts';
import isEqual from 'lodash/isEqual';

export const SearchForm: React.FC<SearchProps> = function SearchForm(props) {
  const { labels } = useContext(ColumnContext);
  const [searchQuery, setSearchQuery] = useDerivedState(() => props.searchQuery, [props.searchQuery]);
  const [{
    isEditing,
    editMode,
  }] = useTableSelector(c => ({
    isEditing: c.isEditing,
    editMode: c.editMode,
  }), isEqual);

  return (
    <form className='ts-datatable-search-form' onSubmit={ isEditing && editMode === 'default' ? undefined : (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      props.onSearch(searchQuery)
    }}>
      <input
        type='search'
        value={searchQuery}
        placeholder={labels?.search ?? 'Search'}
        disabled={isEditing && editMode === 'default'}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button type='submit' title={labels?.search ?? 'Search'} disabled={isEditing && editMode === 'default'}>
        <FontAwesomeIcon icon={faSearch} />
      </button>
    </form>
  );
}
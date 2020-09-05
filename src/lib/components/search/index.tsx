import React, { useContext } from 'react';
import { SearchProps } from './types';
import { useDerivedState } from '../../utils/useDerivedState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { ColumnContext } from '../table/contexts';

export const SearchForm: React.FC<SearchProps> = (props) => {
  const { isEditing } = useContext(ColumnContext);
  const [searchQuery, setSearchQuery] = useDerivedState(() => props.searchQuery, [props.searchQuery]);

  return (
    <form className='ts-datatable-search-form' onSubmit={ isEditing ? undefined : (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      props.onSearch(searchQuery)
    }}>
      <input
        type='search'
        value={searchQuery}
        placeholder='Search'
        disabled={isEditing}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button type='submit' title='Search' disabled={isEditing}>
        <FontAwesomeIcon icon={faSearch} />
      </button>
    </form>
  );
}
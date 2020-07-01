import React from 'react';
import { SearchProps } from './types';
import { useDerivedState } from '../../utils/useDerivedState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';

export const SearchForm: React.FC<SearchProps> = (props) => {
  const [searchQuery, setSearchQuery] = useDerivedState(() => props.searchQuery, [props.searchQuery]);

  return (
    <form className='ts-datatable-search-form' onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      
      props.onSearch(searchQuery)
    }}>
      <input
        type='search'
        value={searchQuery}
        placeholder='Search'
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button type='submit' title='Search'>
        <FontAwesomeIcon icon={faSearch} />
      </button>
    </form>
  );
}
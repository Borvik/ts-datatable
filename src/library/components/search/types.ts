export interface SearchRequiredProps {
  searchQuery: string;
  filter: any;

  onSearch: (query: string) => void | Promise<void>;
  applyFilter: (filter: any) => void | Promise<void>;
}

export type SearchProps = SearchRequiredProps;
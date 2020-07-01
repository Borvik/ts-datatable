export interface SearchRequiredProps {
  searchQuery: string;

  onSearch: (query: string) => void | Promise<void>;
}

export type SearchProps = SearchRequiredProps;
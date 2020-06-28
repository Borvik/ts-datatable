export type ButtonPosition = 'before' | 'after';

export interface PageChange {
  page: number;
  limit: number;
}

export interface PaginateOptions {
  /**
   * When true, shows the total number of records
   */
  totalVisible?: boolean;

  /**
   * Singular/Plural forms for when displaying the total
   * When `false` disables the label
   */
  totalLabel?: false | string | {
    singular: string;
    plural: string;
  }

  /**
   * Determines where to put the page navigation buttons
   */
  buttonPosition?: ButtonPosition | 'split';

  /**
   * Determines whether to show the first/last buttons
   */
  showFirstLast?: boolean;

  /**
   * The className to add to the next/prev buttons
   */
  buttonClass?: string;
}

export interface PaginateRequiredProps {
  /**
   * Current page
   */
  page: number;

  /**
   * Limit per page
   */
  limit: number;

  /**
   * Total number of records, without this paging doesn't work
   */
  total?: number;

  /**
   * Function to enable changing the page
   */
  changePage: (pageNum: number) => void | Promise<void>;
}

export type PaginateProps = PaginateOptions & PaginateRequiredProps;

export interface PaginateButtonProps extends PaginateProps {
  position: ButtonPosition;
  buttonPosition: ButtonPosition | 'split';
  totalPages: number;
}
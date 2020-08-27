import { Spec } from 'immutability-helper';
import { QueryFilterGroup, OperatorMap, AllFilterOperators } from '../table/types';

// export type FilterStyle = 'simple' | 'advanced';

export interface FilterSettings {
  // style?: FilterStyle
  allowNested?: boolean;
  allowOr?: boolean;
  /**
   * Limits column use for once per query
   * Only works when `allowNested` is false
   */
  limitOneColumnUse?: boolean;
  operatorLabels?: Partial<OperatorMap<AllFilterOperators>>;
}

export type SetEditorStateFn = (path: number[], $spec: Spec<QueryFilterGroup>) => void;


/*
req  max
35 - 100 = -65
35 - 30  = 5


width: calc(.5 * (35em + 100vw + abs(35em - 100vw)))
*/
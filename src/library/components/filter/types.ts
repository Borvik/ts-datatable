import { MouseEventHandler } from 'react';
import { Spec } from '../../utils/immutable';
import { QueryFilterGroup, OperatorMap, AllFilterOperators } from '../table/types';

export interface FilterSettings {
  allowNested?: boolean;
  allowOr?: boolean;
  /**
   * Limits column use for once per query
   * Only works when `allowNested` is false
   */
  limitOneColumnUse?: boolean;
  operatorLabels?: Partial<OperatorMap<AllFilterOperators>>;
  quickOperatorLabels?: Partial<OperatorMap<AllFilterOperators>>;
}

export type SetEditorStateFn = (path: number[], $spec: Spec<QueryFilterGroup>) => void;

export interface CustomFilterButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>
  disabled: boolean
}
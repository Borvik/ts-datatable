import { QueryStateOptions } from "@borvik/use-querystate";
import { DeepPartial } from "@borvik/use-querystate/dist/types";
import { useCallback } from "react";
import { notEmpty } from "../../../utils/comparators";
import { ConvertFn, useParsedQs } from "../../../utils/useParsedQS";
import { ColumnSort, GroupBy, QSGroupBy } from "../types";

export function useGroupBy(defaultGroupBy?: ColumnSort[], qsOptions?: QueryStateOptions) {
  const parseQS = useCallback<ConvertFn<DeepPartial<QSGroupBy>, GroupBy>>((qsSort) => ({
    group: (qsSort?.group ?? []).map(v => {
      let parts = v!.split(' ').filter(a => !!a);
      if (parts.length !== 2) return null;
      return {
        column: parts[0],
        direction: (parts[1].toLowerCase() === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'
      }
    })
    .filter(notEmpty)
  }), []);

  const encodeQS = useCallback<ConvertFn<GroupBy, DeepPartial<QSGroupBy>>>((state) => {
    if (!state.group.length && defaultGroupBy?.length) {
      return { group: [''] };
    }

    return {
      group: state.group.map(v => `${v.column} ${v.direction}`)
    };
  }, [defaultGroupBy]);

  return useParsedQs<GroupBy, QSGroupBy>(
    { group: defaultGroupBy ?? [] },
    parseQS,
    encodeQS,
    {
      ...qsOptions,
      types: {
        group: 'string[]'
      }
    }
  );
}
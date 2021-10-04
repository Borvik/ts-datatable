import { QueryStateOptions } from "@borvik/use-querystate";
import { DeepPartial } from "@borvik/use-querystate/dist/types";
import { useCallback } from "react";
import { notEmpty } from "../../../utils/comparators";
import { ConvertFn, useParsedQs } from "../../../utils/useParsedQS";
import { ColumnSort, ColumnSorts, QSColumnSorts } from "../types";

export function useColumnSort(defaultSort?: ColumnSort[], qsOptions?: QueryStateOptions) {
  const parseQS = useCallback<ConvertFn<DeepPartial<QSColumnSorts>, ColumnSorts>>((qsSort) => ({ // parse
    sort: (qsSort?.sort ?? []).map(v => {
      let parts = v!.split(' ').filter(a => !!a);
      if (parts.length !== 2) return null;
      return {
        column: parts[0],
        direction: (parts[1].toLowerCase() === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'
      }
    })
    .filter(notEmpty)
  }), []);

  const encodeQS = useCallback<ConvertFn<ColumnSorts, DeepPartial<QSColumnSorts>>>((state) => ({ // encode
    sort: state.sort.map(v => `${v.column} ${v.direction}`)
  }), []);

  return useParsedQs<ColumnSorts, QSColumnSorts>(
    { sort: defaultSort ?? [] },
    parseQS,
    encodeQS,
    {
      ...qsOptions,
      types: {
        sort: 'string[]'
      }
    }
  );
}
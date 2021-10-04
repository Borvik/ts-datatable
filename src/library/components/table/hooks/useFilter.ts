import { QueryStateOptions } from "@borvik/use-querystate";
import { DeepPartial } from "@borvik/use-querystate/dist/types";
import { useCallback } from "react";
import { convertFromQS, convertToQS } from "../../../utils/transformFilter";
import { ConvertFn, useParsedQs } from "../../../utils/useParsedQS";
import { DataColumn, QueryFilterGroup } from "../types";

export function useFilter<T>(defaultConvertedFilter: QueryFilterGroup, filterColumns: DataColumn<T>[], qsOptions?: QueryStateOptions) {
  const parseQS = useCallback<ConvertFn<DeepPartial<{filter?: any}>, QueryFilterGroup>>((qsFilter) => {
    return convertFromQS(qsFilter, filterColumns);
  }, [ filterColumns ]);

  const encodeQS = useCallback<ConvertFn<QueryFilterGroup, DeepPartial<{filter?: any}>>>((state) => {
    return convertToQS(state, filterColumns);
  }, [ filterColumns ]);

  return useParsedQs<QueryFilterGroup, {filter?: any}>(
    defaultConvertedFilter,
    parseQS,
    encodeQS,
    {
      ...qsOptions,
      types: {
        filter: 'any'
      },
      filterToTypeDef: true,
    }
  )
}
import { QueryStateOptions } from "@borvik/use-querystate";
import { DeepPartial } from "@borvik/use-querystate/dist/types";
import { useCallback } from "react";
import { ConvertFn, useParsedQs } from "../../../utils/useParsedQS";
import { Pagination } from "../types";

export function usePagination(defaultPerPage?: number, qsOptions?: QueryStateOptions) {
  const parseQS = useCallback<ConvertFn<DeepPartial<Pagination>, Pagination>>((qsPagination) => ({
    page: qsPagination.page ?? 1,
    perPage: qsPagination.perPage ?? defaultPerPage ?? 10,
  }), [ defaultPerPage ]);

  const encodeQS = useCallback<ConvertFn<Pagination, DeepPartial<Pagination>>>((state) => {
    return state;
  }, []);

  return useParsedQs<Pagination, DeepPartial<Pagination>>(
    {page: 1, perPage: defaultPerPage ?? 10},
    parseQS,
    encodeQS,
    {
      ...qsOptions
    }
  );
}
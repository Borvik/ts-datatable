import { PartialColumnFilter, AllFilterOperators, StringOperators, NumberOperators, BooleanOperators } from "../table/types";

export function getAvailableOperators(filter?: PartialColumnFilter): AllFilterOperators[] {
  if (!filter) return [];
  if (filter.operators?.length)
    return filter.operators;

  switch (filter.type) {
    case 'string':
    case 'email':
      return [...StringOperators];
    case 'number':
      return [...NumberOperators];
    case 'boolean':
      return [...BooleanOperators];
    case 'custom':
      return Array.from(new Set([...StringOperators, ...NumberOperators, ...BooleanOperators]));
  }
}

export function getDefaultOperator(filter?: PartialColumnFilter): AllFilterOperators {
  let available = getAvailableOperators(filter);
  return filter?.defaultOperator ?? available?.[0] ?? 'eq';
}

export function getDefaultValue(op: AllFilterOperators, filter?: PartialColumnFilter): any {
  if (!filter) return null;
  if (filter.type === 'custom') {
    return filter.defaultValue ?? null;
  }

  switch (filter.type) {
    case 'string':
    case 'email':
      return convertDefaultValueToArray(op, '');
    case 'number':
      return convertDefaultValueToArray(op, Number.NaN);
    case 'boolean':
      return convertDefaultValueToArray(op, false);
  }
  return null;
}

export enum ValueCount {
  SingleValue,
  DualValue,
  ManyValue,
  NoValue,
}

export function valueShouldBeArray(operator: AllFilterOperators): ValueCount {
  switch (operator) {
    case 'nul':
    case 'nnul':
      return ValueCount.NoValue;
    case 'bet':
    case 'nbet':
      return ValueCount.DualValue;
    case 'any':
    case 'none':
      return ValueCount.ManyValue;
    default:
      return ValueCount.SingleValue;
  }
}

function convertDefaultValueToArray(operator: AllFilterOperators, value: unknown): unknown {
  const arrayType = valueShouldBeArray(operator);
  if (arrayType === ValueCount.NoValue) return null;
  else if (arrayType === ValueCount.ManyValue) return [null];
  else if (arrayType === ValueCount.DualValue) return [null, null];
  return value;
}
import updateFn, { extend, Spec as HelperSpec, CustomCommands } from 'immutability-helper';

extend('$auto', function(value, object) {
  return object
    ? updateFn(object, value)
    : updateFn({}, value);
});

interface AutoObject<T> {
  $auto: Spec<T>;
}

export type Spec<T> = HelperSpec<T, CustomCommands<AutoObject<T>>>;

export function update<T>(object: T, $spec: Spec<T>): T {
  return updateFn<T, CustomCommands<AutoObject<T>>>(object, $spec);
}
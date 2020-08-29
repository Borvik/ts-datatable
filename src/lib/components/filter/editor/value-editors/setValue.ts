import { SetEditorStateFn } from "../../types";
import { QueryFilterItem } from "../../../table/types";

interface setValueProps {
  filter: QueryFilterItem
  setState: SetEditorStateFn
  path: number[]
  index: number
  valuePath: number | null
  value: any
}

export function setValue({filter, setState, path, index, valuePath, value}: setValueProps) {
  let valueSpec: any = { $set: value };

  if (typeof valuePath === 'number') {
    // check if exists in filteritem.value
    // may or may not need to convert to/from array
    if (!Array.isArray(filter.value)) {
      let newArray = [filter.value];
      newArray[valuePath] = value;
      valueSpec = { $set: newArray };
    } else {
      valueSpec = {
        [valuePath]: { $set: value }
      }
    }
  }
  // no need for else - default action will suffice

  setState(path, {
    filters: {
      [index]: {
        value: valueSpec
      }
    }
  });
}
import React, { FC } from "react";
import { CustomColumnSearchInputProps } from "../../types";

export const CustomInput: FC<CustomColumnSearchInputProps> = function CustomInput(props) {
  const { columnSearch } = props;
  return <>{columnSearch.CustomInputComponent(props)}</>;
}
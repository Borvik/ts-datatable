import React, { FC } from "react";
import { CustomColumnSearchInputProps } from "../../types";

export const CustomInput: FC<CustomColumnSearchInputProps> = function CustomInput(props) {
  const Editor = props.columnSearch.CustomInputComponent;
  return <Editor {...props} />;
}
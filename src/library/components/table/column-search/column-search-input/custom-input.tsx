import React, { FC } from "react";
import { CustomColumnSearch, GenericColumnSearchInputProps } from "../../types";

interface Props extends GenericColumnSearchInputProps {
  columnSearch: CustomColumnSearch
}

export const CustomInput: FC<Props> = function CustomInput(props) {
  const { columnSearch } = props;
  return <>{columnSearch.CustomInputComponent(props)}</>;
}
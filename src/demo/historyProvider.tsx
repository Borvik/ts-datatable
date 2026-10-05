import React, { type FC, type ReactNode } from 'react';
import { useHistory, useLocation } from 'react-router';
import { HistoryContextProvider } from '@borvik/use-querystate';

interface Props {
  children?: ReactNode
}

const HISTORY_VALUE = {
  useLocation,
  useHistory
};

export const HistoryProvider: FC<Props> = function HistoryProvider({ children }) {
  return (
    <HistoryContextProvider value={HISTORY_VALUE}>
      {children}
    </HistoryContextProvider>
  );
};
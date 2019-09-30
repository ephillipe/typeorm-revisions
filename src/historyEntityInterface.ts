import { HistoryActionType } from './historyActionType';
export interface HistoryEntityInterface {
  id: number | string;
  makeActionAt: Date;
  originalID: number | string;
  action: HistoryActionType;
}

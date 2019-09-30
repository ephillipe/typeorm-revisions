import { Column } from 'typeorm';
import { HistoryActionType } from './historyActionType';
// tslint:disable-next-line: ban-types
export function HistoryActionColumn(): Function {
  return Column({
    default: HistoryActionType.CREATED,
    enum: Object.values(HistoryActionType),
    type: 'simple-enum',
  });
}

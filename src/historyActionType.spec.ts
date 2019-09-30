import { HistoryActionType } from './historyActionType';

describe('HistoryType', () => {
  it('should get history action names', () => {
    expect(Object.values(HistoryActionType)).toStrictEqual([
      HistoryActionType.CREATED,
      HistoryActionType.UPDATED,
      HistoryActionType.DELETED,
    ]);
  });
});

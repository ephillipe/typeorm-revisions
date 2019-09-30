import { HistoryType } from './commom-types';

describe('HistoryType', () => {
  it('should get history action names', () => {
    expect(Object.values(HistoryType)).toStrictEqual([
      HistoryType.CREATED,
      HistoryType.UPDATED,
      HistoryType.DELETED,
    ]);
  });
});

export type HistoryEvent<HistoryEntity> = (history: HistoryEntity) => void | Promise<void>;

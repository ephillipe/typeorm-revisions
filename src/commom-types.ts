import { EntitySubscriberInterface, EntityManager, Column } from 'typeorm';

export enum HistoryType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

// tslint:disable-next-line: ban-types
export function HistoryActionColumn(): Function {
  return Column({
    default: HistoryType.CREATED,
    enum: Object.values(HistoryType),
    type: 'simple-enum',
  });
}

export interface HistoryEntityInterface {
  id: number | string;
  makeActionAt: Date;
  originalID: number | string;
  action: HistoryType;
}

export type HistoryEvent<HistoryEntity> = (history: HistoryEntity) => void | Promise<void>

export interface HistorySubscriberInterface<Entity, HistoryEntity>
  extends EntitySubscriberInterface<Entity> {
  // tslint:disable-next-line: ban-types
  entity: Function;
  // tslint:disable-next-line: ban-types
  historyEntity: Function;

  createHistoryEntity(manager: EntityManager, entity: Entity): HistoryEntity | Promise<HistoryEntity>;
  beforeInsertHistory(history: HistoryEntity):  void | Promise<void>;
  afterInsertHistory(history: HistoryEntity): void | Promise<void>;
  beforeUpdateHistory(history: HistoryEntity):  void | Promise<void>;
  afterUpdateHistory(history: HistoryEntity): void | Promise<void>;
  beforeRemoveHistory(history: HistoryEntity):  void | Promise<void>;
  afterRemoveHistory(history: HistoryEntity): void | Promise<void>;
}

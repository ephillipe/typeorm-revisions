import { EntitySubscriberInterface, EntityManager, Column } from 'typeorm';

export enum HistoryActionType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

// tslint:disable-next-line: ban-types
export function HistoryActionColumn(): Function {
  return Column({
    default: HistoryActionType.CREATED,
    enum: Object.values(HistoryActionType),
    type: 'simple-enum',
  });
}

export interface HistoryEntityInterface {
  id: number | string;
  makeActionAt: Date;
  originalID: number | string;
  action: HistoryActionType;
}

export type HistoryEvent<HistoryEntity> = (history: HistoryEntity) => void | Promise<void>

export interface HistorySubscriberInterface<Entity, HistoryEntity>
  extends EntitySubscriberInterface<Entity> {
  // tslint:disable-next-line: ban-types
  entity: Function;
  // tslint:disable-next-line: ban-types
  historyEntity: Function;

  createHistoryEntity(manager: EntityManager, entity: Entity): HistoryEntity | Promise<HistoryEntity>;
  
  beforeHistory(action: HistoryActionType, history: HistoryEntity):  void | Promise<void>;
  afterHistory(action: HistoryActionType, history: HistoryEntity): void | Promise<void>;
}

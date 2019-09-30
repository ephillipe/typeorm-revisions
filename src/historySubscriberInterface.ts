import { EntitySubscriberInterface, EntityManager } from 'typeorm';
import { HistoryActionType } from './historyActionType';
export interface HistorySubscriberInterface<Entity, HistoryEntity> extends EntitySubscriberInterface<Entity> {
  // tslint:disable-next-line: ban-types
  entity: Function;
  // tslint:disable-next-line: ban-types
  historyEntity: Function;
  createHistoryEntity(manager: EntityManager, entity: Entity): HistoryEntity | Promise<HistoryEntity>;
  beforeHistory(action: HistoryActionType, history: HistoryEntity): void | Promise<void>;
  afterHistory(action: HistoryActionType, history: HistoryEntity): void | Promise<void>;
}

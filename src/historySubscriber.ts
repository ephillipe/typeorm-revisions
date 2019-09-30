import { Column, EntityManager, EntityMetadata, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { HistoryActionType } from './historyActionType';
import { HistoryEntityInterface } from './historyEntityInterface';
import { HistoryEvent } from './historyEvent';
import { HistorySubscriberInterface } from './historySubscriberInterface';

export abstract class HistorySubscriber<Entity, HistoryEntity extends HistoryEntityInterface & Entity>
  implements HistorySubscriberInterface<Entity, HistoryEntity> {
  // tslint:disable-next-line: no-empty
  public beforeHistory(action: HistoryActionType, history: HistoryEntity): void | Promise<void> {}
  // tslint:disable-next-line: no-empty
  public afterHistory(action: HistoryActionType, history: HistoryEntity): void | Promise<void> {}

  // tslint:disable-next-line: ban-types
  public abstract get entity(): Function;
  // tslint:disable-next-line: ban-types
  public abstract get historyEntity(): Function;

  // tslint:disable-next-line: ban-types
  public listenTo(): Function {
    return this.entity;
  }
  public createHistoryEntity(manager: Readonly<EntityManager>, entity: Entity): HistoryEntity | Promise<HistoryEntity> {
    return manager.create(this.historyEntity, entity);
  }

  public async afterInsert(event: InsertEvent<Entity>): Promise<void> {
    await this.createHistory(event.manager, event.metadata, HistoryActionType.CREATED, event.entity);
  }

  public async afterUpdate(event: UpdateEvent<Entity>): Promise<void> {
    await this.createHistory(event.manager, event.metadata, HistoryActionType.UPDATED, event.entity);
  }

  public async beforeRemove(event: RemoveEvent<Entity>): Promise<void> {
    await this.createHistory(event.manager, event.metadata, HistoryActionType.DELETED, event.entity);
  }

  private async createHistory(
    manager: Readonly<EntityManager>,
    metadata: Readonly<EntityMetadata>,
    action: Readonly<HistoryActionType>,
    entity?: Entity,
  ): Promise<void> {
    if (!entity || Object.keys(metadata.propertiesMap).includes('action')) {
      return;
    }

    const history = await this.createHistoryEntity(manager, entity);
    history.action = action;

    for (const primaryColumn of metadata.primaryColumns) {
      history.originalID = Reflect.get(history, primaryColumn.propertyName);
      Reflect.deleteProperty(history, primaryColumn.propertyName);
    }

    await this.beforeHistory(history.action, history);
    await manager.save(history);
    await this.afterHistory(history.action, history);
  }
}

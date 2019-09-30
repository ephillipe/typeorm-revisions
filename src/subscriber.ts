import { Column, EntityManager, EntityMetadata, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { HistoryType, HistoryEntityInterface, HistorySubscriberInterface, HistoryEvent } from './commom-types';

export abstract class HistorySubscriber<Entity, HistoryEntity extends HistoryEntityInterface & Entity>
  implements HistorySubscriberInterface<Entity, HistoryEntity> {
  // tslint:disable-next-line: no-empty
  public beforeInsertHistory(history: HistoryEntity): void | Promise<void> {}
  // tslint:disable-next-line: no-empty
  public afterInsertHistory(history: HistoryEntity): void | Promise<void> {}
  // tslint:disable-next-line: no-empty
  public beforeUpdateHistory(history: HistoryEntity): void | Promise<void> {}
  // tslint:disable-next-line: no-empty
  public afterUpdateHistory(history: HistoryEntity): void | Promise<void> {}
  // tslint:disable-next-line: no-empty
  public beforeRemoveHistory(history: HistoryEntity): void | Promise<void> {}
  // tslint:disable-next-line: no-empty
  public afterRemoveHistory(history: HistoryEntity): void | Promise<void> {}

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
    await this.createHistory(
      event.manager,
      event.metadata,
      this.beforeInsertHistory,
      this.afterInsertHistory,
      HistoryType.CREATED,
      event.entity,
    );
  }

  public async afterUpdate(event: UpdateEvent<Entity>): Promise<void> {
    await this.createHistory(
      event.manager,
      event.metadata,
      this.beforeUpdateHistory,
      this.afterUpdateHistory,
      HistoryType.UPDATED,
      event.entity,
    );
  }

  public async beforeRemove(event: RemoveEvent<Entity>): Promise<void> {
    await this.createHistory(
      event.manager,
      event.metadata,
      this.beforeRemoveHistory,
      this.afterRemoveHistory,
      HistoryType.DELETED,
      event.entity,
    );
  }

  private async createHistory(
    manager: Readonly<EntityManager>,
    metadata: Readonly<EntityMetadata>,
    beforeHistoryFn: HistoryEvent<HistoryEntity>,
    afterHistoryFn: HistoryEvent<HistoryEntity>,
    action: Readonly<HistoryType>,
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

    await beforeHistoryFn(history);
    await manager.save(history);
    await afterHistoryFn(history);
  }
}

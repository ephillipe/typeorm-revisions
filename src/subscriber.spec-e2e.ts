import {
  BaseEntity,
  Column,
  createConnection,
  Entity,
  EventSubscriber,
  getConnection,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ulid } from 'ulid';
import { HistoryType, HistoryEntityInterface, HistoryActionColumn } from './commom-types';
import { HistorySubscriber } from './subscriber';

describe('e2e test', () => {
  @Entity()
  class TestEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public test!: string;
  }

  // tslint:disable-next-line: max-classes-per-file
  @Entity()
  class TestHistoryEntity extends TestEntity implements HistoryEntityInterface {
    @Column()
    public originalID!: number;

    @HistoryActionColumn()
    public action!: HistoryType;
    @PrimaryGeneratedColumn()
    public id!: number;
  }

  // tslint:disable-next-line: max-classes-per-file
  @EventSubscriber()
  class TestHistorySubscriber extends HistorySubscriber<TestEntity, TestHistoryEntity> {
    public entity = TestEntity;
    public historyEntity = TestHistoryEntity;
  }

  // tslint:disable-next-line: max-classes-per-file
  @Entity()
  class TestEntity2 extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({
      default: false,
    })
    public deleted!: boolean;

    @Column()
    public test!: string;
  }

  // tslint:disable-next-line: max-classes-per-file
  @Entity()
  class TestHistoryEntity2 extends TestEntity2 implements HistoryEntityInterface {
    @Column()
    public originalID!: number;

    @HistoryActionColumn()
    public action!: HistoryType;
    @PrimaryGeneratedColumn()
    public id!: number;
  }

  // tslint:disable-next-line: max-classes-per-file
  @EventSubscriber()
  class TestHistorySubscriber2 extends HistorySubscriber<TestEntity2, TestHistoryEntity2> {
    public entity = TestEntity2;
    public historyEntity = TestHistoryEntity2;

    public beforeUpdateHistory(history: TestHistoryEntity2): TestHistoryEntity2 {
      if (history.deleted) {
        history.action = HistoryType.DELETED;
      }
      return history;
    }
  }
  beforeEach(async () => {
    const connection = await createConnection({
      database: 'test',
      dropSchema: true,
      entities: [TestEntity, TestHistoryEntity, TestEntity2, TestHistoryEntity2],
      host: process.env.DB_HOST || 'localhost',
      password: 'root',
      subscribers: [TestHistorySubscriber, TestHistorySubscriber2],
      synchronize: true,
      type: (process.env.DB_TYPE || 'mysql') as any,
      username: 'root',
    });
    expect(connection).toBeDefined();
    expect(connection.isConnected).toBeTruthy();
  });

  it('create history', async () => {
    const testEntity = await TestEntity.create({ test: 'test' }).save();

    const histories = await TestHistoryEntity.find();
    expect(histories).toHaveLength(1);
    expect(histories[0].originalID).toBe(testEntity.id);
    expect(histories[0].action).toBe(HistoryType.CREATED);
    expect(histories[0].test).toBe('test');
  });

  it('update history', async () => {
    const testEntity = await TestEntity.create({ test: 'test' }).save();
    testEntity.test = 'updated';
    await testEntity.save();

    const histories = await TestHistoryEntity.find();
    expect(histories).toHaveLength(2);
    expect(histories[0].action).toBe(HistoryType.CREATED);
    expect(histories[0].test).toBe('test');

    expect(histories[1].action).toBe(HistoryType.UPDATED);
    expect(histories[1].test).toBe('updated');
  });
  it('delete history', async () => {
    const testEntity = await TestEntity.create({ test: 'test' }).save();
    await testEntity.remove();

    const histories = await TestHistoryEntity.find();
    expect(histories).toHaveLength(2);
    expect(histories[0].action).toBe(HistoryType.CREATED);
    expect(histories[1].action).toBe(HistoryType.DELETED);
  });
  it('should be delete action when deleted column is true', async () => {
    const testEntity = await TestEntity2.create({ test: 'test' }).save();
    testEntity.deleted = true;
    await testEntity.save();

    const histories = await TestHistoryEntity2.find();
    expect(histories).toHaveLength(2);
    expect(histories[0].action).toBe(HistoryType.CREATED);
    expect(histories[0].deleted).toBeFalsy();

    expect(histories[1].action).toBe(HistoryType.DELETED);
    expect(histories[1].deleted).toBeTruthy();
  });

  it('create many histories', async () => {
    let entities = Array(100)
      .fill(0)
      .map(() => TestEntity.create({ test: ulid() }));
    entities = await TestEntity.save(entities);

    await expect(TestHistoryEntity.count()).resolves.toBe(100);
    entities.forEach(e => (e.test = ulid()));
    await TestEntity.save(entities);
    await expect(TestHistoryEntity.count()).resolves.toBe(200);
    await TestEntity.remove(entities);
    await expect(TestHistoryEntity.count()).resolves.toBe(300);
  });

  it('a', async () => {
    // Insert
    const testEntity = await TestEntity.create({ test: 'test' }).save();

    // Update
    testEntity.test = 'updated';
    await testEntity.save();

    // Remove
    await testEntity.remove();
  });

  afterEach(() => getConnection().close());
});

# typeorm-revisions

![npm](https://img.shields.io/npm/v/typeorm-revisions.svg)
![NPM](https://img.shields.io/npm/l/typeorm-revisions.svg)

## Description

Provides a Revision History Subscriber for [TypeORM](http://typeorm.io) Entities

Tested: sqlite, mysql5, mysql8 and postgres.

## Installation

```bash
$ npm i --save typeorm typeorm-revisions
```

## Quick Start

### 1. Create your own Entity

```ts
@Entity()
class MyModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;
  @Column()
  public name!: string;
  @Column()
  public email!: string;
}
```

### 2. Create an Entity to mantain a Revision History 

```ts
@Entity()
class MyModelHistory extends MyModel implements HistoryEntityInterface {
  @Column()
  public originalID!: number;
  @HistoryActionColumn()
  public action!: HistoryActionType;
}
```

### 3. Create a Entity Subscriber for monitor your Entity and persist a Revison History

```ts
@EventSubscriber()
class MyModelHistorySubscriber extends HistorySubscriber<MyModel, MyModelHistory> {
  public get entity() {
    return MyModel;
  }
  public get historyEntity() {
    return MyModelHistory;
  }
}
```

### 4. Create connection

```ts
await createConnection({
  type: "sqlite",
  entities: [MyModel, MyModelHistory],
  subscribers: [MyModelHistorySubscriber],
  database: "db.sql",
});
```

### 5. Insert/Update/Remove entity

```ts
// Insert
const testEntity = await MyModel.create({ test: "test" }).save();

// Update
testEntity.test = "updated";
await testEntity.save();

// Remove
await testEntity.remove();
```

## Advanced

You can hook before/after insert/update/remove history.

```ts
@EventSubscriber()
class MyModelHistorySubscriber extends HistorySubscriber<MyModel, MyModelHistory> {
  public get entity() {
    return MyModel;
  }

  public get historyEntity() {
    return MyModelHistory;
  }

  public beforeHistory(action: HistoryActionType, history: MyModelHistory): void | Promise<void> {
      
  }

  public beforeHistory(action: HistoryActionType, history: MyModelHistory): void | Promise<void> {

  }
}
```

## License

[MIT](LICENSE)
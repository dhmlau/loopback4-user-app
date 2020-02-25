import {DefaultCrudRepository} from '@loopback/repository';
import {User, UserRelations} from '../models';
import {DsDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.email,
  UserRelations
> {
  constructor(@inject('datasources.ds') dataSource: DsDataSource) {
    super(User, dataSource);
  }
}

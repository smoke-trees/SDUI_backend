import { Dao, Database } from '@smoke-trees/postgres-backend'
import { inject } from 'inversify'
import { User } from './User.entity'

export class UserDao extends Dao<User> {
	constructor(
		@inject('database')
		db: Database
	) {
		super(db, User, 'user')
	}
}

import { Dao, Database } from '@smoke-trees/postgres-backend'
import { inject } from 'inversify'
import { ToDo } from './ToDo.entity'

export class ToDoDao extends Dao<ToDo> {
	constructor(
		@inject('database')
		db: Database
	) {
		super(db, ToDo, 'to_do')
	}
}

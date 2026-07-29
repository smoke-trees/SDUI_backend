import { BaseEntity, Documentation } from '@smoke-trees/postgres-backend'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IToDo } from './IToDo'

@Documentation.addSchema()
@Entity({ name: 'to_do' })
export class ToDo extends BaseEntity implements IToDo {
	@Documentation.addField({ type: 'string' })
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'user_id', type: 'uuid' })
	userId!: string

	@Documentation.addField({ type: 'number' })
	@Column({ name: 'serial_number', type: 'float8' })
	serialNumber!: number

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'title', type: 'varchar' })
	title!: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'description', type: 'varchar' })
	description!: string

	@Documentation.addField({ type: 'boolean' })
	@Column({ name: 'completed', type: 'boolean', default: false })
	completed!: boolean

	constructor(data?: IToDo) {
		super()
		if (data) {
			if (data.id) this.id = data.id
			this.userId = data.userId
			this.serialNumber = data.serialNumber
			this.title = data.title
			this.description = data.description
			this.completed = data.completed
		}
	}
}

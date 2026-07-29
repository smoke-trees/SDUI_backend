import { BaseEntity, Documentation } from '@smoke-trees/postgres-backend'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IUser } from './IUser'

@Documentation.addSchema()
@Entity({ name: 'user' })
export class User extends BaseEntity implements IUser {
	@Documentation.addField({ type: 'string' })
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'email', type: 'varchar'})
	email!: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'first_name', type: 'varchar'})
	firstName!: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'last_name', type: 'varchar'})
	lastName!: string

	@Documentation.addField({ type: 'string' })
	@Column({ name: 'password', type: 'varchar'})	
	password!: string

	constructor(data?: IUser) {
		super()
		if (data) {
			if (data.id) this.id = data.id
			this.email = data.email
			this.firstName = data.firstName
			this.lastName = data.lastName
			this.password = data.password
		}
	}
}

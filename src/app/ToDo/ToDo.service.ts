import { ErrorCode, log, Result, Service } from '@smoke-trees/postgres-backend'
import { inject } from 'inversify'
import { Between } from 'typeorm'
import { ToDoDao } from './ToDo.dao'
import { ToDo } from './ToDo.entity'

export class ToDoService extends Service<ToDo> {
	dao: ToDoDao
	constructor(
		@inject(ToDoDao)
		dao: ToDoDao
	) {
		super(dao)
		this.dao = dao
	}

	async createToDo(userId: string, title: string, description: string, completed: boolean) {
		const usersTodo = await this.dao.readMany({
			where: { userId },
			field: 'serialNumber',
			order: 'DESC'
		})
		let serialNumber = 1
		if (!usersTodo.status.error && usersTodo.result && (usersTodo.result.length ?? 0) > 0) {
			log.debug('serial number check', 'ToDoService/createToDo', { usersTodo, serialNumber })
			serialNumber = usersTodo.result[0].serialNumber + 1
		}

		return await this.dao.create({
			userId,
			serialNumber,
			title,
			description,
			completed
		})
	}

	async reshuffleToDo(id: string, newSerialNumber: number, userId: string) {
		if (newSerialNumber < 1) {
			return new Result(true, ErrorCode.BadRequest, 'new serial number must be greater than 0')
		}
		const todo = await this.dao.read({ where: { id, userId } })

		if (todo.status.error || !todo.result) {
			return todo
		}

		const currentSerialNumber = todo.result.serialNumber
		if (currentSerialNumber === newSerialNumber) {
			return todo
		}

		if (currentSerialNumber > newSerialNumber) {
			await this.dao.update(
				{
					userId: userId,
					serialNumber: Between(newSerialNumber, currentSerialNumber - 1)
				},
				{ serialNumber: () => '"serial_number" + 1' }
			)
		} else {
			await this.dao.update(
				{
					userId: userId,
					serialNumber: Between(currentSerialNumber + 1, newSerialNumber)
				},
				{ serialNumber: () => '"serial_number" - 1' }
			)
		}

		return await this.dao.update(id, { serialNumber: newSerialNumber })
	}
}

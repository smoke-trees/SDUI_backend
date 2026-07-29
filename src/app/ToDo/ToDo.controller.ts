import {
	Application,
	Controller,
	Documentation,
	ErrorCode,
	Methods,
	Result,
	ServiceController
} from '@smoke-trees/postgres-backend'
import { Request, RequestHandler, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { inject } from 'inversify'
import { ParsedQs } from 'qs'
import { ToDo } from './ToDo.entity'
import { ToDoService } from './ToDo.service'

export class ToDoController extends ServiceController<ToDo> {
	path: string = '/to-do'
	protected controllers: Controller[] = []
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[] = []
	service: ToDoService
	constructor(
		@inject(Application)
		app: Application,
		@inject(ToDoService)
		service: ToDoService
	) {
		super(app, ToDo, service, { paths: { create: false, read: true, update: true, delete: true } })
		this.service = service
		this.addRoutes(
			{
				handler: this.createToDo.bind(this),
				method: Methods.POST,
				path: '/create',
				localMiddleware: []
			},
			{
				handler: this.reshuffleToDo.bind(this),
				method: Methods.POST,
				path: '/reshuffle',
				localMiddleware: []
			}
		)
		this.loadDocumentation()
		this.loadMiddleware()
	}

	@Documentation.addRoute({
		method: Methods.POST,
		path: '/create',
		description: 'create a new to do item',
		requestBody: {
			type: 'object',
			properties: {
				userId: {
					type: 'string'
				},
				title: {
					type: 'string'
				},
				description: {
					type: 'string'
				},
				completed: {
					type: 'boolean'
				}
			}
		},
		responses: {
			400: {
				description: 'Invalid Request',
				value: {
					$ref: Documentation.getRef(ToDo)
				}
			},
			200: {
				description: 'To Do Item Created',
				value: {
					$ref: Documentation.getRef(ToDo)
				}
			}
		}
	})
	async createToDo(req: Request, res: Response) {
		const { userId, title, description, completed } = req.body
		if (!userId || !title || !description) {
			return res
				.status(400)
				.json(new Result(true, ErrorCode.BadRequest, 'userId, title, and description are required'))
		}
		const result = await this.service.createToDo(userId, title, description, completed)

		return res.status(result.getStatus()).json(result)
	}

	@Documentation.addRoute({
		method: Methods.POST,
		path: '/reshuffle',
		description: 'Reshuffle To Do Items',
		requestBody: {
			type: 'object',
			properties: {
				id: {
					type: 'string'
				},
				serialNumber: {
					type: 'number'
				}
			}
		},
		responses: {
			400: {
				description: 'Invalid Request',
				value: {
					$ref: Documentation.getRef(ToDo)
				}
			},
			200: {
				description: 'To Do Items Reshuffled',
				value: {
					$ref: Documentation.getRef(ToDo)
				}
			}
		}
	})
	async reshuffleToDo(req: Request, res: Response) {
		const { id, serialNumber, userId } = req.body
		if (!id || !serialNumber || !userId) {
			return res
				.status(400)
				.json(new Result(true, ErrorCode.BadRequest, 'id and serialNumber are required'))
		}
		const result = await this.service.reshuffleToDo(id, serialNumber, userId)

		return res.status(result.getStatus()).json(result)
	}
}

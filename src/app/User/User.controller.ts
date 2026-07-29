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
import { User } from './User.entity'
import { UserService } from './User.service'

export class UserController extends ServiceController<User> {
	path: string = '/user'
	protected controllers: Controller[] = []
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[] = []
	service: UserService
	constructor(
		@inject(Application)
		app: Application,
		@inject(UserService)
		service: UserService
	) {
		super(app, User, service, { paths: { create: false, update: false, delete: false } })
		this.service = service
		this.addRoutes(
			{
				handler: this.signUp.bind(this),
				method: Methods.POST,
				path: '/sign-up',
				localMiddleware: []
			},
			{
				handler: this.signIn.bind(this),
				method: Methods.POST,
				path: '/sign-in',
				localMiddleware: []
			}
		)
		this.loadDocumentation()
		this.loadMiddleware()
	}

	@Documentation.addRoute({
		method: Methods.POST,
		path: '/sign-up',
		description: 'Sign Up',
		requestBody: {
			type: 'object',
			properties: {
				email: {
					type: 'string'
				},
				password: {
					type: 'string'
				},
				firstName: {
					type: 'string'
				},
				lastName: {
					type: 'string'
				}
			}
		},
		responses: {
			400: {
				description: 'Invalid Request',
				value: {
					$ref: Documentation.getRef(User)
				}
			},
			200: {
				description: 'User Created',
				value: {
					$ref: Documentation.getRef(User)
				}
			}
		}
	})
	async signUp(req: Request, res: Response) {
		const { email, password, firstName, lastName } = req.body

		if (!email || !password || !firstName || !lastName) {
			res
				.status(400)
				.json(
					new Result(
						true,
						ErrorCode.BadRequest,
						'email, password, firstName, and lastName are required'
					)
				)
			return
		}

		const result = await this.service.signUp(email, password, firstName, lastName)
		res.status(result.getStatus()).json(result)
	}

	@Documentation.addRoute({
		method: Methods.POST,
		path: '/sign-in',
		description: 'Sign In',
		requestBody: {
			type: 'object',
			properties: {
				email: {
					type: 'string'
				},
				password: {
					type: 'string'
				}
			}
		},
		responses: {
			400: {
				description: 'Invalid Request',
				value: {
					$ref: Documentation.getRef(User)
				}
			},
			200: {
				description: 'User Created',
				value: {
					$ref: Documentation.getRef(User)
				}
			}
		}
	})
	async signIn(req: Request, res: Response) {
		const { email, password } = req.body

		if (!email || !password) {
			res
				.status(400)
				.json(new Result(true, ErrorCode.BadRequest, 'email and password are required'))
			return
		}

		const result = await this.service.signIn(email, password)
		res.status(result.getStatus()).json(result)
	}
}

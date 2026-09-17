import {
	Application,
	Controller,
	Documentation,
	ErrorCode,
	Methods,
	Result,
	ServiceController
} from '@smoke-trees/postgres-backend'
import compression from 'compression'
import { Request, RequestHandler, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { inject } from 'inversify'
import { ParsedQs } from 'qs'
import { AppScreens } from './AppScreens.entity'
import { AppScreensService } from './AppScreens.service'

export class AppScreensController extends ServiceController<AppScreens> {
	path: string = '/app-screens'
	protected controllers: Controller[] = []
	protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[] = []
	service: AppScreensService
	constructor(
		@inject(Application)
		app: Application,
		@inject(AppScreensService)
		service: AppScreensService
	) {
		super(
			app,
			AppScreens,
			service,
			{
				paths: {
					create: false,
					read: true,
					update: false
				}
			},
			{
				read: [
					compression()
					// TODO: App routes auth
				],
				readMany: [
					compression()
					// TODO: App routes auth
				]
			}
		)
		this.service = service
		this.addRoutes(
			{
				handler: this.deployScreen.bind(this),
				method: Methods.POST,
				path: '/deploy',
				localMiddleware: [
					// TODO: App routes auth
				]
			},
			{
				handler: this.scheduleDeployScreen.bind(this),
				method: Methods.POST,
				path: '/schedule-deploy',
				localMiddleware: [
					// TODO: App routes auth
				]
			},
			{
				handler: this.revertScreen.bind(this),
				method: Methods.POST,
				path: '/revert',
				localMiddleware: [
					// TODO: App routes auth
				]
			},
			{
				handler: this.scheduleCron.bind(this),
				method: Methods.POST,
				path: '/schedule-cron',
				localMiddleware: [
					// TODO: App routes auth
				]
			}
		)
		this.loadDocumentation()
		this.loadMiddleware()
	}

	@Documentation.addRoute({
		method: Methods.POST,
		path: '/screens/deploy',
		description: 'Deploy a new screen',
		requestBody: {
			type: 'object',
			properties: {
				screenName: {
					type: 'string'
				},
				screenJson: {
					type: 'string'
				}
			}
		},
		responses: {
			400: {
				description: 'Invalid Request',
				value: {
					$ref: Documentation.getRef(Result)
				}
			},
			200: {
				description: 'Screen Deployed',
				value: {
					$ref: Documentation.getRef(Result)
				}
			}
		}
	})
	async deployScreen(req: Request, res: Response) {
		const { screenName, screenJson } = req.body
		const result = await this.service.deployScreen(screenName, screenJson)
		res.status(200).json(result)
	}

	@Documentation.addRoute({
		method: Methods.POST,
		path: '/screens/schedule-deploy',
		description: 'Schedule a new screen',
		requestBody: {
			type: 'object',
			properties: {
				screenName: {
					type: 'string'
				},
				screenJson: {
					type: 'string'
				},
				scheduleStartDate: {
					type: 'string'
				},
				scheduleEndDate: {
					type: 'string'
				},
				makeLatest: {
					type: 'boolean'
				}
			}
		},
		responses: {
			400: {
				description: 'Invalid Request',
				value: {
					$ref: Documentation.getRef(Result)
				}
			},
			200: {
				description: 'Screen Deployed',
				value: {
					$ref: Documentation.getRef(Result)
				}
			}
		}
	})
	async scheduleDeployScreen(req: Request, res: Response) {
		const { screenName, screenJson, scheduleStartDate, scheduleEndDate, makeLatest } = req.body
		const result = await this.service.scheduleDeployScreen(
			screenName,
			screenJson,
			scheduleStartDate,
			scheduleEndDate,
			makeLatest
		)
		res.status(200).json(result)
	}

	@Documentation.addRoute({
		method: Methods.POST,
		path: '/screens/revert',
		description: 'Revert to latest version',
		requestBody: {
			type: 'object',
			properties: {
				screenName: {
					type: 'string'
				},
				version: {
					type: 'number'
				}
			}
		},
		responses: {
			400: {
				description: 'Invalid Request',
				value: {
					$ref: Documentation.getRef(Result)
				}
			},
			200: {
				description: 'Screen Reverted',
				value: {
					$ref: Documentation.getRef(Result)
				}
			}
		}
	})
	async revertScreen(req: Request, res: Response) {
		const { screenName, version } = req.body
		const result = await this.service.revertLatest(screenName, version)
		res.status(200).json(result)
	}

	@Documentation.addRoute({
		method: Methods.POST,
		path: '/screens/schedule-cron',
		description: 'Run the schedule cron for screens (activate due schedules, expire ended ones)',
		requestBody: {
			type: 'object',
			properties: {
				date: {
					type: 'string'
				}
			}
		},
		responses: {
			400: {
				description: 'Invalid Request',
				value: {
					$ref: Documentation.getRef(Result)
				}
			},
			200: {
				description: 'Schedule Cron Completed',
				value: {
					$ref: Documentation.getRef(Result)
				}
			}
		}
	})
	async scheduleCron(req: Request, res: Response) {
		const { date } = req.body ?? {}
		const activated = await this.service.activateScheduled(date)
		const expired = await this.service.expireScheduled(date)
		const hasError = activated.status.error || expired.status.error
		res
			.status(200)
			.json(
				new Result(
					hasError,
					hasError ? ErrorCode.InternalServerError : ErrorCode.Success,
					'Schedule cron completed',
					{ activated: activated.result, expired: expired.result }
				)
			)
	}
}

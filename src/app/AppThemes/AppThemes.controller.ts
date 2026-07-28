import {
	Application,
	Controller,
	Documentation,
	Methods,
	Result,
	ServiceController
} from '@smoke-trees/postgres-backend'
import compression from 'compression'
import { Request, RequestHandler, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { inject } from 'inversify'
import { ParsedQs } from 'qs'
import { AppThemes } from './AppThemes.entity'
import { AppThemesService } from './AppThemes.service'

export class AppThemesController extends ServiceController<AppThemes> {
	path: string = '/app-themes'
	protected controllers: Controller[] = []
	protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[] = []
	service: AppThemesService
	constructor(
		@inject(Application)
		app: Application,
		@inject(AppThemesService)
		service: AppThemesService
	) {
		super(
			app,
			AppThemes,
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
				handler: this.deployTheme.bind(this),
				method: Methods.POST,
				path: '/deploy',
				localMiddleware: [
					// TODO: App routes auth
				]
			},
			{
				handler: this.revertTheme.bind(this),
				method: Methods.POST,
				path: '/revert',
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
		path: '/themes/deploy',
		description: 'Deploy a new theme',
		requestBody: {
			type: 'object',
			properties: {
				themeName: {
					type: 'string'
				},
				themeJson: {
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
				description: 'Theme Deployed',
				value: {
					$ref: Documentation.getRef(Result)
				}
			}
		}
	})
	async deployTheme(req: Request, res: Response) {
		const { themeName, themeJson } = req.body
		const result = await this.service.deployTheme(themeName, themeJson)
		res.status(200).json(result)
	}

	@Documentation.addRoute({
		method: Methods.POST,
		path: '/themes/revert',
		description: 'Revert to latest version',
		requestBody: {
			type: 'object',
			properties: {
				themeName: {
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
				description: 'Theme Reverted',
				value: {
					$ref: Documentation.getRef(Result)
				}
			}
		}
	})
	async revertTheme(req: Request, res: Response) {
		const { themeName, version } = req.body
		const result = await this.service.revertLatest(themeName, version)
		res.status(200).json(result)
	}
}

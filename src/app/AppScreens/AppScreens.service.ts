import { ErrorCode, log, Result, Service } from '@smoke-trees/postgres-backend'
import { inject } from 'inversify'
import { AppScreensDao } from './AppScreens.dao'
import { AppScreens } from './AppScreens.entity'

export class AppScreensService extends Service<AppScreens> {
	dao: AppScreensDao
	constructor(
		@inject(AppScreensDao)
		dao: AppScreensDao
	) {
		super(dao)
		this.dao = dao
	}

	async deployScreen(screenName: string, screenJson: string) {
		if (!screenName || !screenJson) return

		const lastDeployed = await this.dao.readMany({
			where: { screenName },
			page: 1,
			count: 3,
			field: 'version',
			order: 'DESC'
		})

		log.debug('last deployed', 'AppScreensService/deployScreen', lastDeployed)

		let newVersion = 1

		if (!lastDeployed.status.error && lastDeployed.result && lastDeployed.result.length > 0) {
			newVersion = lastDeployed.result[0].version + 1
			const existingLatest = await this.dao.read({ where: { screenName, isLatest: true } })

			if (!existingLatest.status.error && existingLatest.result) {
				log.debug('updating last latest app screen version', 'AppScreensService/deployScreen', {
					screenName,
					id: existingLatest.result.id
				})
				await this.dao.update(existingLatest.result.id, {
					isLatest: false
				})
			}
		}

		log.debug('creating new app screen version', 'AppScreensService/deployScreen', {
			screenName,
			version: newVersion
		})

		return await this.dao.create({
			screenName,
			screenJson,
			version: newVersion,
			isLatest: true,
			lastDeployed: new Date().toISOString()
		})
	}

	async revertLatest(screenName: string, version?: number) {
		if (!screenName) {
			return new Result(true, ErrorCode.BadRequest, 'screenName is required')
		}

		const latest = await this.dao.read({ where: { screenName, isLatest: true } })

		if (latest.status.error || !latest.result) {
			return new Result(true, ErrorCode.NotFound, 'screen not found')
		}

		await this.dao.update(latest.result.id, {
			isLatest: false
		})
		return await this.dao.update(
			{ screenName, version: version ?? latest.result.version - 1 },
			{ isLatest: true }
		)
	}
}

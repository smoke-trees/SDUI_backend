import { ErrorCode, log, Result, Service } from '@smoke-trees/postgres-backend'
import { inject } from 'inversify'
import { AppThemesDao } from './AppThemes.dao'
import { AppThemes } from './AppThemes.entity'

export class AppThemesService extends Service<AppThemes> {
	dao: AppThemesDao
	constructor(
		@inject(AppThemesDao)
		dao: AppThemesDao
	) {
		super(dao)
		this.dao = dao
	}

	async deployTheme(themeName: string, themeJson: string) {
		if (!themeName || !themeJson) return

		const lastDeployed = await this.dao.readMany({
			where: { themeName },
			page: 1,
			count: 3,
			field: 'version',
			order: 'DESC'
		})

		let newVersion = 1

		if (!lastDeployed.status.error && lastDeployed.result) {
			newVersion = lastDeployed.result[0].version + 1
			const existingLatest = await this.dao.read({ where: { themeName, isLatest: true } })

			if (!existingLatest.status.error && existingLatest.result) {
				log.debug('updating last latest app screen version', 'AppThemesService/deployScreen', {
					themeName,
					id: existingLatest.result.id
				})
				await this.dao.update(existingLatest.result.id, {
					isLatest: false
				})
			}
		}

		log.debug('creating new app screen version', 'AppThemesService/deployScreen', {
			themeName,
			version: newVersion
		})

		return await this.dao.create({
			themeName,
			themeJson,
			version: newVersion,
			isLatest: true,
			lastDeployed: new Date().toISOString()
		})
	}

	async revertLatest(themeName: string, version?: number) {
		if (!themeName) {
			return new Result(true, ErrorCode.BadRequest, 'themeName is required')
		}

		const latest = await this.dao.read({ where: { themeName, isLatest: true } })

		if (latest.status.error || !latest.result) {
			log.debug('screen not found', 'AppThemesService/revertLatest', latest)
			return new Result(true, ErrorCode.NotFound, 'screen not found')
		}

		if (latest.result.version === (version ?? 1)) {
			log.debug('version is already latest', 'AppThemesService/revertLatest', latest)
			return new Result(true, ErrorCode.BadRequest, 'version is already latest')
		}
		const updateResult = await this.dao.update(
			{ themeName, version: version ?? latest.result.version - 1 },
			{ isLatest: true }
		)
		log.debug('updateResult', 'AppThemesService/revertLatest', {
			themeName,
			version: version ?? latest.result.version - 1,
			isLatest: true
		})
		if (!updateResult.status.error) {
			await this.dao.update(latest.result.id, {
				isLatest: false
			})
		}

		return updateResult
	}
}

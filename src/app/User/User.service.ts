import { ErrorCode, log, Result, Service } from '@smoke-trees/postgres-backend'
import * as bcrypt from 'bcrypt'
import { inject } from 'inversify'
import jwt from 'jsonwebtoken'
import RedisDatabaseObject from '../../redis/redis-connection'
import settings from '../../settings'
import { UserDao } from './User.dao'
import { User } from './User.entity'

export class UserService extends Service<User> {
	dao: UserDao
	constructor(
		@inject(UserDao)
		dao: UserDao
	) {
		super(dao)
		this.dao = dao
	}

	async signUp(email: string, password: string, firstName: string, lastName: string) {
		const user = await this.dao.read({ where: { email } })
		if (!user.status.error && user.result) {
			return new Result(true, ErrorCode.BadRequest, 'user already exists')
		}

		const hashedPassword = await this.hashPassword(password)

		const userId = await this.dao.create({
			email,
			firstName,
			lastName,
			password: hashedPassword
		})

		if (!userId.result || userId.status.error) {
			return new Result(true, ErrorCode.NotAuthorized, 'Error Creating User')
		}

		const userRead = await this.dao.read(userId.result!.toString())
		if (!userRead.result) {
			return new Result(true, ErrorCode.NotAuthorized, 'Error Reading User')
		}
		return this.generateToken(userRead.result)
	}

	async signIn(email: string, password: string) {
		const user = await this.dao.read({ where: { email } })
		if (user.status.error || !user.result) {
			return new Result(true, ErrorCode.NotFound, 'user not found')
		}

		const isPasswordCorrect = await this.checkPassword(password, user.result.password)

		if (!isPasswordCorrect) {
			return new Result(true, ErrorCode.BadRequest, 'invalid password')
		}

		return this.generateToken(user.result)
	}

	private async generateToken(user: User) {
		const tid = crypto.randomUUID()
		const refreshTokenId = crypto.randomUUID()
		const tokenExpiry = 2 * 3600
		const refreshExpiry = 30 * 24 * 60 * 60

		const token = jwt.sign({ sub: user.id, userId: user.id, ...user, tid }, settings.jwtSecretKey, {
			algorithm: 'HS256',
			expiresIn: tokenExpiry
		})

		const refreshToken = jwt.sign(
			{ tid: refreshTokenId, userId: user.id },
			settings.refreshSecretKey,
			{ algorithm: 'HS256', expiresIn: refreshExpiry }
		)

		const { connection } = await RedisDatabaseObject

		connection.set(
			`refresh-token:${refreshTokenId}`,
			JSON.stringify({ userId: user.id }),
			'EX',
			refreshExpiry
		)

		return new Result(false, ErrorCode.Success, 'Success!', {
			accessToken: token,
			refreshToken: refreshToken,
			expiresIn: tokenExpiry,
			refreshExpiry: refreshExpiry,
			type: 'Bearer'
		})
	}

	async invalidateToken(refreshToken: string): Promise<Result<boolean>> {
		try {
			const { connection } = await RedisDatabaseObject

			const decoded = jwt.verify(refreshToken, settings.refreshSecretKey, {
				algorithms: ['HS256']
			}) as { tid: string; user_id: string }

			const token = await connection.get(`refresh-token:${decoded.tid}`)
			if (!token) {
				return new Result(true, ErrorCode.NotAuthorized, 'Invalid refresh token')
			}
			await connection.del(`refresh-token:${decoded.tid}`)

			return new Result(false, ErrorCode.Success, 'Token invalidated', true)
		} catch (error) {
			log.error('Error in invalidating token', 'invalidateToken', error, {
				refreshToken
			})
			return new Result(true, ErrorCode.InternalServerError, 'Error in invalidating token')
		}
	}

	async hashPassword(password: string) {
		return await bcrypt.hash(password, 10)
	}

	async checkPassword(inputPassword: string, checkPassword: string) {
		return await bcrypt.compare(inputPassword, checkPassword)
	}
}

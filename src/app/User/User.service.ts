import { ErrorCode, Result, Service } from '@smoke-trees/postgres-backend'
import * as bcrypt from 'bcrypt'
import { inject } from 'inversify'
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

		return await this.dao.create({
			email,
			firstName,
			lastName,
			password: hashedPassword
		})
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

		return new Result(false, ErrorCode.Success, user.message, user.result.id)
	}

	async hashPassword(password: string) {
		return await bcrypt.hash(password, 10)
	}

	async checkPassword(inputPassword: string, checkPassword: string) {
		return await bcrypt.compare(inputPassword, checkPassword)
	}
}

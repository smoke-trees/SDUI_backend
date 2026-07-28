import { Settings } from '@smoke-trees/postgres-backend'
import dotenv from 'dotenv'
dotenv.config()

export class ApplicationSettings extends Settings {
	databaseType: 'postgres' | 'mysql'
	dbPassword: string
	dbUser: string
	dbHost: string
	dbPort: string | undefined
	database: string
	jwtSecretKey: string
	refreshSecretKey: string
	//redis configuartion

	redisHost: string
	redisport: number
	redisUsename: string
	redisPassword: string
	redisdb: number

	constructor() {
		super()
		this.databaseType = 'postgres'
		this.dbPassword = this.getValue('PGPASSWORD', 'mysecretpassword')
		this.dbUser = this.getValue('PGUSER', 'postgres')
		this.dbHost = this.getValue('PGHOST', 'localhost')
		this.dbPort = this.getValue('PGPORT', '5432')
		this.database = this.getValue('PGDATABASE', 'postgres')

		this.redisHost = this.getValue('REDIS_HOST', 'localhost')
		this.redisport = parseInt(this.getValue('REDIS_PORT', '6379'), 10)
		this.redisUsename = this.getValue('REDIS_USENAME', '')
		this.redisPassword = this.getValue('REDIS_PASSWORD', '')
		this.redisdb = parseInt(this.getValue('REDIS_DB', '0'), 10)
		this.jwtSecretKey = this.getValue('JWT_SECRETKEY', 'a$3f7K9wL!mP@x2j9Q&z4V5c^t8N#h2b')
		this.refreshSecretKey = this.getValue('REFRESH_SECRET_KEY', 'RefershSecretKey@123')

		// eslint-disable-next-line no-console
		console.log(this)
	}
}

const settings = new ApplicationSettings()

export default settings

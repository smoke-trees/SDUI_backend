import { RedisConnectionObjectInterface } from './types'
import RedisPool from './redis-client'
import { RedisPoolOptions } from '../redis/types'
import { log } from '@smoke-trees/postgres-backend'
import settings from '../settings'

const dbOptions: RedisPoolOptions = {
	host: settings.redisHost,
	port: settings.redisport,
	username: settings.redisUsename,
	password: settings.redisPassword,
	db: settings.redisdb
}

const connect = async (): Promise<RedisConnectionObjectInterface> => {
	try {
		const pool = new RedisPool(dbOptions)
		log.info('Connected  to redis Database', 'connect redis')
		return { connection: pool }
	} catch (error) {
		log.error('Error in connecting to redis db', 'connect redis', error)
		process.exit(1)
	}
}

export const RedisDatabaseObject = connect()

export class RediConnectionClass {
	public async getConnection(): Promise<RedisPool | null> {
		try {
			const { connection } = await RedisDatabaseObject
			if (!connection) {
				log.error('Error in connecting to redis db', 'connect redis')
				return null
			}
			return connection
		} catch (error) {
			return null
		}
	}
}

export default RedisDatabaseObject

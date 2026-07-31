import { RedisOptions } from 'ioredis'
import GenericPool from 'generic-pool'
import RedisPool from './redis-client'

/**
 * Redis Pool options extends both IORedis connection options and GenericPool options
 */
export interface RedisPoolOptions extends RedisOptions, GenericPool.Options {}

export type BooleanResponse = 1 | 0
export type KeyType = string | Buffer
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValueType = string | Buffer | number | any

export interface RedisConnectionObjectInterface {
	connection: RedisPool
}

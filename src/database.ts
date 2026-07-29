import { Database } from '@smoke-trees/postgres-backend'
import { ApplicationSettings } from './app/ApplicationSettings/ApplicationSettings.entity'
import { AppScreens } from './app/AppScreens/AppScreens.entity'
import { AppThemes } from './app/AppThemes/AppThemes.entity'
import settings from './settings'
import { User } from './app/User/User.entity'
import { ToDo } from './app/ToDo/ToDo.entity'

const database = new Database(settings)

// Add Entities
database.addEntity(User)
database.addEntity(ToDo)
database.addEntity(ApplicationSettings)
database.addEntity(AppThemes)
database.addEntity(AppScreens)
database.addEntity(ApplicationSettings)
database.addEntity(AppScreens)
database.addEntity(AppThemes)

// Add Migrations

export default database

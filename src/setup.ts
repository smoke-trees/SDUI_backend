import { Application } from '@smoke-trees/postgres-backend'
import cors from 'cors'
import { json } from 'express'
import { Container } from 'inversify'
import { ApplicationSettingsController } from './app/ApplicationSettings/ApplicationSettings.controller'
import { ApplicationSettingsDao } from './app/ApplicationSettings/ApplicationSettings.dao'
import { ApplicationSettingsService } from './app/ApplicationSettings/ApplicationSettings.service'
import { AppScreensController } from './app/AppScreens/AppScreens.controller'
import { AppScreensDao } from './app/AppScreens/AppScreens.dao'
import { AppScreensService } from './app/AppScreens/AppScreens.service'
import { AppThemesController } from './app/AppThemes/AppThemes.controller'
import { AppThemesDao } from './app/AppThemes/AppThemes.dao'
import { AppThemesService } from './app/AppThemes/AppThemes.service'
import { ToDoController } from './app/ToDo/ToDo.controller'
import { ToDoDao } from './app/ToDo/ToDo.dao'
import { ToDoService } from './app/ToDo/ToDo.service'
import { UserController } from './app/User/User.controller'
import { UserDao } from './app/User/User.dao'
import { UserService } from './app/User/User.service'
import database from './database'
import settings from './settings'

export const container: Container = new Container()

const app = new Application(settings, database)

app.getApp().set('query parser', 'extended')

container.bind('database').toConstantValue(database)
container.bind(Application).toConstantValue(app)

container.bind(UserDao).toSelf()
container.bind(UserService).toSelf()
container.bind(UserController).toSelf()

container.bind(ToDoDao).toSelf()
container.bind(ToDoService).toSelf()
container.bind(ToDoController).toSelf()

container.bind(ApplicationSettingsDao).toSelf()
container.bind(ApplicationSettingsService).toSelf()
container.bind(ApplicationSettingsController).toSelf()

container.bind(AppThemesDao).toSelf()
container.bind(AppThemesService).toSelf()
container.bind(AppThemesController).toSelf()

container.bind(AppScreensDao).toSelf()
container.bind(AppScreensService).toSelf()
container.bind(AppScreensController).toSelf()

app.addController(container.get(ApplicationSettingsController))
app.addController(container.get(AppThemesController))
app.addController(container.get(AppScreensController))
app.addController(container.get(UserController))
app.addController(container.get(ToDoController))

app.addMiddleWare(cors())
app.addMiddleWare(json())

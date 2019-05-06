import express, { Request, Response, NextFunction, Router } from 'express';
import http, { Server } from 'http';

import { Exception, NotFound } from 'ts-httpexceptions';

import { IServerSettings } from '../interfaces';
import { SERVER_SETTINGS, getClass } from '../utils';

import assert from 'assert';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import globby from 'globby';
import path from 'path';
import chalk from 'chalk';

import { EventEmitter } from 'events';

export abstract class ServerLoader extends EventEmitter {

  protected readonly settings: IServerSettings;

  get httpServer(): Server { return this._httpServer; }
  get expressApp(): express.Application { return this._expressApp; }

  private _httpServer: Server;
  private _expressApp: express.Application;

  constructor() {
    super();

    this.settings = Reflect.getOwnMetadata(SERVER_SETTINGS, getClass(this));
    assert.ok(this.settings, new Error('Settings not defined'));

    this._initialize();
  }

  protected startHttpServer(callback?: () => void) {
    const port = this.settings.httpPort;

    this._httpServer
      .listen(port, callback ? callback : () => console.info(`Server listening on port ${port}`));
  }

  private async _initialize() {
    this._expressApp = express();
    this._httpServer = new http.Server(this._expressApp);

    this._configureDefaultMiddlewares();
    await this._setupControllers();

    this._expressApp.use((req: Request, res: Response) => {
      throw new NotFound('Resource not found');
    });

    this._configureDefaultErrorHandler();
  }

  private _configureDefaultMiddlewares() {
    if (process.env.NODE_ENV === 'development') {
      this._expressApp.use(morgan('dev'));
    }

    if (this.settings.cors) {
      this._expressApp.use(cors());
    }

    this._expressApp.use(bodyParser.json({ limit: '1mb' }));
    this._expressApp.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
  }

  private async _setupControllers() {
    if (!this.settings.controllersPath) return console.log(chalk.red('Warning! Path to controllers not defined...'));

    const files = globby.sync(`${path.resolve(this.settings.controllersPath)}/*`);
    const ctrlInstances: any[] = [];

    for (const file of files) {
      const ctrls = await import(file);

      for (const name in ctrls) {
        if (!ctrls.hasOwnProperty(name)) break;

        const ctrl = (ctrls as any)[name];
        ctrlInstances.push(new ctrl());
      }
    }

    this._loadControllers(ctrlInstances);
    this.emit('routesMounted');
  }

  private _loadControllers(controllers: InstanceType<any> | Array<InstanceType<any>>): void {
    const ctrls = controllers instanceof Array ? controllers : [controllers];
    const mainRouter = express.Router();

    for (const ctrl of ctrls) {
      if (ctrl && ctrl.basePath) {
        mainRouter.use(ctrl.basePath, this._getRouter(ctrl));
      }
    }

    const prefix = `/${this.settings.apiPrefix || '/'}`.replace('//', '/');
    this._expressApp.use(prefix, mainRouter);
  }

  private _getRouter(controller: InstanceType<any>): Router {
    const router = express.Router();
    const prototype = Reflect.getPrototypeOf(Reflect.getPrototypeOf(controller));

    for (const member in prototype) {
      if (!prototype.hasOwnProperty(member)) continue;
      const route = controller[member];

      if (route && route.ntsRouteProps) {
        const { httpVerb, path } = route.ntsRouteProps;

        const callback = (req: Request, res: Response, next: NextFunction) => {
          return controller[member](req, res, next);
        }

        router[httpVerb](path, callback);
      }
    }

    return router;
  }

  private _configureDefaultErrorHandler() {
    this._expressApp.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof Exception) {
        res.status(err.status).send(err.message);
      } else throw new Exception(err);
    });
  }

}

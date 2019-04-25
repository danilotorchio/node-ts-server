# node-ts-server
Simple and minimalist Express.js server made with Typescript and a collection of decorators.

## Installation

```bash
$ npm install --save @danilotorchio/node-ts-server
```

and in your tsconfig.json:

```json
{
  "module": "commonjs",
  "moduleResolution": "node",
  "target": "es5",
  "emitDecoratorMetadata": true,
  "experimentalDecorators": true,
  "lib": [
    "dom",
    "es2018"
  ],
}
```

## Usage

Create a server extending ServerLoader component and use de ServerSettings decorator to configure the server:

```javascript
import { ServerSettings, ServerLoader } from '@danilotorchio/node-ts-server';

@ServerSettings({
  httpPort: 5001,
  apiPrefix: 'api',
  cors: true,
  controllersPath: 'src/controllers'
})
export class Server extends ServerLoader {

  start() {
    super.startHttpServer(); // You can optionally pass a callback function.
  }
}
```

and create a controller like this:

```javascript
import { Controller, Get, Post } from '@danilotorchio/node-ts-server';
import { Request, Response } from 'express';

@Controller('sample')
export class SampleController {

  @Get(':id')
  getById(req: Request, res: Response) {
    res.status(200).json({ status: 'OK', id: req.params.id });
  }
  
  @Post()
  create(req: Request, res: Response) {
    res.status(200).json(req.body);
  }
}
```

Now, just create an instance of your Server and you are ready to go

```javascript
import { Server } from './Server';

const server = new Server():
server.start();
```

Simple like that, enjoy! xD

## Documentation

For now, the following class decorators are available:
* ServerSettings
* Controller

And the methods decorators:
* Get
* Post
* Put
* Patch
* Delete


Thank's.

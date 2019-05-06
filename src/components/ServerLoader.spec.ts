import 'reflect-metadata';

import 'mocha';
import { expect } from 'chai';

import { ServerLoader } from './ServerLoader';
import { SERVER_SETTINGS } from '../utils';

describe('ServerLoader', () => {
  before(() => {
    class TestServer extends ServerLoader {
      start(): Promise<boolean> {
        return new Promise((resolve => super.startHttpServer(() => resolve(true))));
      }

      stop(): Promise<boolean> {
        return new Promise(resolve => this.httpServer.close(() => resolve(true)));
      }
    }

    Reflect.defineMetadata(SERVER_SETTINGS, { httpPort: 8085 }, TestServer);
    this.server = new TestServer();
  });

  after(async () => await this.server.stop());

  it('should server have been created', () => expect(this.server.httpServer).to.exist);

  it('should server have been started', async () => {
    expect(await this.server.start()).to.be.true;
  });

  it('should server have been listening on port 8085', () => {
    expect(this.server.httpServer.address().port).to.be.equal(8085);
  });

});

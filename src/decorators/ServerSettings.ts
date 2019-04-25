import { IServerSettings, Type } from '../interfaces';
import { SERVER_SETTINGS } from '../utils';

export function ServerSettings(settings: IServerSettings): Function {
  return (target: Type<object>) => {
    Reflect.defineMetadata(SERVER_SETTINGS, settings, target);
  }
}

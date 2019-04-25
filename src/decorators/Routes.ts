import { Type } from 'src/interfaces';

export function Get(path?: string): MethodDecorator {
  return addRoute('get', path);
}

export function Post(path?: string): MethodDecorator {
  return addRoute('post', path);
}

export function Put(path?: string): MethodDecorator {
  return addRoute('put', path);
}

export function Patch(path?: string): MethodDecorator {
  return addRoute('patch', path);
}

export function Delete(path?: string): MethodDecorator {
  return addRoute('delete', path);
}

function addRoute(httpVerb: string, path?: string): MethodDecorator {
  return (target: Type<object>, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return originalMethod.apply(this, args);
    }

    descriptor.value.ntsRouteProps = {
      httpVerb,
      path: path ? `/${path}`.replace('//', '/') : ''
    };

    return descriptor;
  };
}

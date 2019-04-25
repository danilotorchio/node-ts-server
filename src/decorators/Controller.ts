export function Controller(path?: string) {
  return <T extends { new(...args: any[]): {} }>(constructor: T) => {
    let controllerPath = '';

    if (!path && constructor.hasOwnProperty['name']) {
      const name: string = (constructor as any)['name'];
      controllerPath = name.substr(0, name.indexOf('Controller') > 0 ? name.indexOf('Controller') : name.length).toLowerCase();
    } else controllerPath = path || '/';

    return class extends constructor {
      public basePath = `/${controllerPath}`.replace('//', '/');
    };
  };
}

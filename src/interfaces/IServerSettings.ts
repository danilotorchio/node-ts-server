export interface IServerSettings {
  httpPort: number | string;
  cors?: boolean;
  apiPrefix?: string;
  controllersPath?: string;
}

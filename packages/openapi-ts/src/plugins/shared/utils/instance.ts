import type { IR } from '../../../ir/types';
import type { OpenApi } from '../../../openApi/types';
import type { Config } from '../../../types/config';
import type { BaseConfig, Plugin } from '../../types';

export class PluginInstance<PluginConfig extends BaseConfig = BaseConfig> {
  public config: Plugin.Config<PluginConfig>['config'];
  public context: IR.Context;
  public dependencies: Required<Plugin.Config<PluginConfig>>['dependencies'] =
    [];
  private handler: Plugin.Config<PluginConfig>['handler'];
  public name: Plugin.Config<PluginConfig>['name'];
  public output: Required<PluginConfig>['output'];

  public constructor(
    props: Pick<
      Required<Plugin.Config<PluginConfig>>,
      'config' | 'dependencies' | 'handler'
    > &
      Pick<Required<PluginConfig>, 'output'> & {
        context: IR.Context<OpenApi.V2_0_X | OpenApi.V3_0_X | OpenApi.V3_1_X>;
        name: string;
      },
  ) {
    this.config = props.config;
    this.context = props.context;
    this.dependencies = props.dependencies;
    this.handler = props.handler;
    this.name = props.name;
    this.output = props.output;
  }

  public createFile(file: IR.ContextFile) {
    return this.context.createFile({
      exportFromIndex: this.config.exportFromIndex,
      ...file,
    });
  }

  /**
   * Retrieves a registered plugin instance by its name from the context. This
   * allows plugins to access other plugins that have been registered in the
   * same context, enabling cross-plugin communication and dependencies.
   *
   * @param name Plugin name as defined in the configuration.
   * @returns The plugin instance if found, undefined otherwise.
   */
  public getPlugin<T extends keyof Config['plugins']>(
    name: T,
  ): IR.Context['plugins'][T] {
    return this.context.plugins[name];
  }

  /**
   * Executes plugin's handler function.
   */
  public async run() {
    await this.handler({ plugin: this });
  }

  /**
   * Subscribe to an input parser event.
   *
   * @param event Event type from the parser.
   * @param callbackFn Function to execute on event.
   * @returns void
   */
  public subscribe<T extends keyof IR.ContextEvents>(
    event: T,
    callbackFn: IR.ContextEvents[T],
  ) {
    return this.context.subscribe(event, callbackFn, this.name);
  }
}

import type { Config } from '~/types/config';

export const transformClassName = ({
  config,
  name,
}: {
  config: Config;
  name: string;
}) => {
  const plugin = config.plugins['@hey-api/sdk'];
  if (plugin?.config.classNameBuilder) {
    let customName = '';

    if (typeof plugin.config.classNameBuilder === 'function') {
      customName = plugin.config.classNameBuilder(name);
    } else {
      customName = plugin.config.classNameBuilder.replace('{{name}}', name);
    }

    return customName;
  }

  return name;
};

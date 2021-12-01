import { Context } from '@semantic-release-plus/core';
import { dockerLogin } from './docker-utils';
import { normalizeConfig } from './normalize-config';
import { PluginConfig } from './plugin-config.interface';

export async function verifyConditions(
  pluginConfig: PluginConfig,
  context: Context
) {
  const { logger, env } = context;
  const {
    skipLogin,
    user,
    password,
    image: { registry },
  } = normalizeConfig(pluginConfig);

  if (skipLogin) {
    logger.log('Skipping docker login because skipLogin was set to true');
    return;
  }

  for (const envVar of [user, password]) {
    if (!env || !env[envVar]) {
      throw new Error(`Environment variable ${envVar} is not set`);
    }
  }
  try {
    await dockerLogin(
      {
        userName: env[user],
        password: env[password],
        registry: registry,
      },
      context
    );
  } catch (err) {
    logger.error(err);
    throw new Error('docker login failed');
  }
}

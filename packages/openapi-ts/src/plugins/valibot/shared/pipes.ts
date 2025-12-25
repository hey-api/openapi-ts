import { $ } from '~/ts-dsl';

import type { ValibotPlugin } from '../types';
import { identifiers } from '../v1/constants';

export type Pipe = ReturnType<typeof $.call | typeof $.expr>;
export type Pipes = Array<Pipe>;
export type PipeResult = Pipes | Pipe;

type PushPipes = (target: Pipes, pipes: PipeResult) => Pipes;
type PipesToNode = (
  pipes: PipeResult,
  plugin: ValibotPlugin['Instance'],
) => Pipe;

export const pipesToNode: PipesToNode = (pipes, plugin) => {
  if (!(pipes instanceof Array)) return pipes;
  if (pipes.length === 1) return pipes[0]!;

  const v = plugin.external('valibot.v');
  return $(v)
    .attr(identifiers.methods.pipe)
    .call(...pipes);
};

export const pushPipes: PushPipes = (target, pipes) => {
  if (pipes instanceof Array) {
    target.push(...pipes);
  } else {
    target.push(pipes);
  }
  return target;
};

export interface PipesUtils {
  push: PushPipes;
  toNode: PipesToNode;
}

/**
 * Functions for working with pipes.
 */
export const pipes: PipesUtils = {
  /**
   * Push pipes into target array.
   */
  push: pushPipes,
  /**
   * Convert pipes to a single node.
   */
  toNode: pipesToNode,
};

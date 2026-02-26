import { $ } from '../../../ts-dsl';
import type { ValibotPlugin } from '../types';
import { identifiers } from '../v1/constants';

export type Pipe = ReturnType<typeof $.call | typeof $.expr>;
export type Pipes = Array<Pipe>;
export type PipeResult = Pipes | Pipe | undefined;

export interface PipesUtils {
  /**
   * Pushes a pipe result onto a pipes array.
   *
   * Handles single pipes, arrays of pipes, and undefined.
   */
  push: (target: Pipes, result: PipeResult) => Pipes;
  /**
   * Converts a pipes array to a single node expression.
   */
  toNode: (pipes: Pipes | Pipe, plugin: ValibotPlugin['Instance']) => Pipe;
}

function push(target: Pipes, result: PipeResult): Pipes {
  if (result === undefined) {
    return target;
  }
  if (result instanceof Array) {
    target.push(...result);
  } else {
    target.push(result);
  }
  return target;
}

function toNode(pipes: Pipes | Pipe, plugin: ValibotPlugin['Instance']): Pipe {
  if (!(pipes instanceof Array)) {
    return pipes;
  }
  if (pipes.length === 0) {
    const v = plugin.external('valibot.v');
    return $(v).attr(identifiers.schemas.unknown).call();
  }
  if (pipes.length === 1) {
    return pipes[0]!;
  }
  const v = plugin.external('valibot.v');
  return $(v)
    .attr(identifiers.methods.pipe)
    .call(...pipes);
}

/**
 * Functions for working with pipes.
 */
export const pipes: PipesUtils = {
  push,
  toNode,
};

/**
 * Convenience function for converting pipes to a node.
 *
 * Re-exported for backward compatibility.
 */
export function pipesToNode(p: Pipes, plugin: ValibotPlugin['Instance']): Pipe {
  return toNode(p, plugin);
}

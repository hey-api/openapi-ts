import { $ } from '../../index';
import { astToString } from '../../utils/render-utils';

describe('CallTsDsl', () => {
  it('renders a basic call expression', () => {
    const node = $.call('fn', $.literal('hello'));
    const result = astToString(node.toAst());
    expect(result).toBe("fn('hello')");
  });

  it('renders a call with no arguments', () => {
    const node = $.call('fn');
    const result = astToString(node.toAst());
    expect(result).toBe('fn()');
  });

  it('renders a call with multiple arguments', () => {
    const node = $.call('fn', $.literal(1), $.literal(2));
    const result = astToString(node.toAst());
    expect(result).toBe('fn(1, 2)');
  });

  it('attaches a leading comment via hint()', () => {
    const node = $.call('fn', $.literal('x')).hint('@ts-ignore');
    const result = astToString(node.toAst());
    expect(result).toContain('// @ts-ignore');
    expect(result).toContain("fn('x')");
  });

  it('renders without comment when hint() is not called', () => {
    const node = $.call('fn');
    const result = astToString(node.toAst());
    expect(result).not.toContain('//');
  });
});

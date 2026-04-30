import { describe, it, expect } from 'vitest';
import { fillTemplate } from './fillTemplate';

describe('fillTemplate', () => {
  it('replaces a single placeholder', () => {
    expect(fillTemplate('Hello {name}!', { name: 'world' })).toBe('Hello world!');
  });

  it('replaces multiple placeholders regardless of order', () => {
    const tpl = 'A={a}, B={b}, C={c}';
    expect(fillTemplate(tpl, { c: '3', a: '1', b: '2' })).toBe('A=1, B=2, C=3');
  });

  it('replaces the same placeholder appearing twice', () => {
    expect(fillTemplate('{x}+{x}', { x: '1' })).toBe('1+1');
  });

  it('leaves unknown placeholders intact', () => {
    expect(fillTemplate('{a}-{missing}', { a: 'A' })).toBe('A-{missing}');
  });

  it('substitutes empty string when value is empty', () => {
    expect(fillTemplate('[{x}]', { x: '' })).toBe('[]');
  });

  it('does not recursively expand placeholders that appear inside replacement values', () => {
    expect(fillTemplate('{a}', { a: '{b}', b: 'B' })).toBe('{b}');
  });

  it('does not match braces with no key inside', () => {
    expect(fillTemplate('{}{a}', { a: 'A' })).toBe('{}A');
  });
});

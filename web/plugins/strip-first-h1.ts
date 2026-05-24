import type { RehypePlugin } from '@astrojs/markdown-remark';
import type { Root, RootContent } from 'hast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';

function isH1(node: Root | RootContent | MdxJsxFlowElement): boolean {
  if (node.type === 'element' && node.tagName === 'h1') return true;
  if (node.type === 'mdxJsxFlowElement' && node.name === 'h1') return true;
  if (node.type === 'mdxJsxTextElement' && node.name === 'h1') return true;
  return false;
}

export function stripFirstH1Plugin() {
  const plugin: RehypePlugin = () => (tree) => {
    function findAndRemoveH1(node: Root | RootContent): boolean {
      if ('children' in node && node.children) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (isH1(child)) {
            node.children.splice(i, 1);
            return true;
          }
          if (findAndRemoveH1(child)) {
            return true;
          }
        }
      }
      return false;
    }

    findAndRemoveH1(tree);
  };
  return plugin;
}

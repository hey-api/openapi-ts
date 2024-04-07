import en from './en';
import shared from './shared';

import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid({
    ...shared,
    locales: {
        root: { label: 'English', ...en },
    },
    /**
     * mermaid fix
     * {@link https://github.com/mermaid-js/mermaid/issues/4320}
     */
    vite: {
        optimizeDeps: {
            include: [
                'mermaid'
            ]
        }
    }
});

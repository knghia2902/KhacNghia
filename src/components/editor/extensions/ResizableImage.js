import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import ResizableImageComponent from './ResizableImageComponent';

/**
 * ResizableImage - Custom TipTap Image extension
 * Hỗ trợ resize inline và trigger crop modal
 */
const ResizableImage = Image.extend({
    name: 'resizableImage',

    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                parseHTML: element => element.getAttribute('width') || element.style.width?.replace('px', ''),
                renderHTML: attributes => {
                    if (!attributes.width) return {};
                    return {
                        width: attributes.width,
                        style: `width: ${attributes.width}px; max-width: 100%;${attributes.height ? ` height: ${attributes.height}px;` : ''}`
                    };
                },
            },
            height: {
                default: null,
                parseHTML: element => element.getAttribute('height') || element.style.height?.replace('px', ''),
                renderHTML: attributes => {
                    if (!attributes.height) return {};
                    return { height: attributes.height };
                },
            },
            // Store original src before crop for undo/restore
            originalSrc: {
                default: null,
                parseHTML: element => element.getAttribute('data-original-src'),
                renderHTML: attributes => {
                    if (!attributes.originalSrc) return {};
                    return { 'data-original-src': attributes.originalSrc };
                },
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageComponent);
    },
});

export default ResizableImage;

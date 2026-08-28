import { getContent } from '/lib/xp/portal';
import type { Response } from '@enonic-types/core';

export function GET(): Response {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content = getContent() as any;
    const handle = content?.data?.medusaHandle || '(not set)';
    return {
        body: `<div style="padding:1rem;background:#f8f9fa;border:1px dashed #ccc;border-radius:4px;font-family:sans-serif;font-size:14px">
            <strong style="display:block;margin-bottom:6px;color:#333">&#128221; Product Info</strong>
            <div style="color:#555">Handle: <code style="background:#e9ecef;padding:2px 6px;border-radius:3px">${handle}</code></div>
        </div>`,
        contentType: 'text/html',
    };
}

import * as contentLib from '/lib/xp/content';
import * as contextLib from '/lib/xp/context';
import * as nodeLib from '/lib/xp/node';

const REPO = 'com.enonic.cms.hmdb';
const APP = 'com.enonic.app.hmdb';
const APP_DASHED = 'com-enonic-app-hmdb';
const SUPPORTS = `${APP}:collection`;
const PAGE_DESCRIPTOR = `${APP}:collection`;
const PART_DESCRIPTOR = `${APP}:collection-detail`;
const TEMPLATE_QUERY = `type = 'portal:page-template' AND data.supports = '${SUPPORTS}'`;

function runAs<T>(branch: 'draft' | 'master', fn: () => T): T {
    return contextLib.run(
        { user: { login: 'su', idProvider: 'system' }, repository: REPO, branch },
        fn,
    );
}

function connectNode(branch: 'draft' | 'master') {
    return nodeLib.connect({
        repoId: REPO,
        branch,
        user: { login: 'su', idProvider: 'system' },
        principals: ['role:system.admin'],
    });
}

export function ensureCollectionPageTemplate(): void {
    log.info('[ensure-collection-page-template] checking…');

    const onMaster = runAs('master', () =>
    contentLib.query({ query: TEMPLATE_QUERY, count: 1 }),
    );
    if (onMaster.total > 0) {
        log.info('[ensure-collection-page-template] template already published on master, skipping');
        return;
    }

    const onDraft = runAs('draft', () =>
    contentLib.query({ query: TEMPLATE_QUERY, count: 1 }),
    );
    const draftConn = connectNode('draft');
    let nodePath: string;

    if (onDraft.total > 0) {
        const hit = onDraft.hits[0];
        nodePath = '/content' + hit._path;
        log.info(`[ensure-collection-page-template] found on draft only, will push: ${hit._path}`);
        draftConn.modify({
            key: hit._id,
            editor: (node) => {
                (node as unknown as Record<string, unknown>)['components'] = buildComponents();
                return node;
            },
        });
    } else {
        const folderResult = runAs('draft', () =>
        contentLib.query({ query: "type = 'portal:template-folder'", count: 1 }),
        );
        if (folderResult.total === 0) {
            log.warning('[ensure-collection-page-template] no template folder found, skipping');
            return;
        }
        const folderPath = folderResult.hits[0]._path;
        log.info(`[ensure-collection-page-template] using template folder: ${folderPath}`);

        const created = runAs('draft', () =>
        contentLib.create({
            parentPath: folderPath,
            name: 'collection-page',
            displayName: 'Collection Page',
            contentType: 'portal:page-template',
            data: { supports: SUPPORTS } as unknown as Parameters<typeof contentLib.create>[0]['data'],
        }),
        );
        if (!created) {
            log.error('[ensure-collection-page-template] contentLib.create returned null');
            return;
        }
        nodePath = '/content' + created._path;
        log.info(`[ensure-collection-page-template] created template node: ${created._path}`);
        draftConn.modify({
            key: created._id,
            editor: (node) => {
                (node as unknown as Record<string, unknown>)['components'] = buildComponents();
                return node;
            },
        });
        log.info('[ensure-collection-page-template] components set on draft');
    }

    const pushResult = draftConn.push({
        keys: [nodePath],
        target: 'master',
        resolve: true,
    });
    const ok = (pushResult.success || []).length;
    const ko = (pushResult.failed || []).length;
    log.info(`[ensure-collection-page-template] pushed to master: success=${ok} failed=${ko}`);
    log.info('[ensure-collection-page-template] done');
}

function buildComponents(): unknown[] {
    return [
        {
            type: 'page',
            path: '/',
            page: {
                descriptor: PAGE_DESCRIPTOR,
                customized: false,
                config: { [APP_DASHED]: { collection: {} } },
            },
        },
        {
            type: 'part',
            path: '/main/0',
            part: { descriptor: PART_DESCRIPTOR },
        },
    ];
}

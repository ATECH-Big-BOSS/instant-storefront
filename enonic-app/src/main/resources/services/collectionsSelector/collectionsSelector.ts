import * as contentLib from '/lib/xp/content';
import * as portalLib from '/lib/xp/portal';

type Hit = { id: string; displayName: string; description?: string; iconUrl?: string };

function toIdArray(idsParam: string | string[] | undefined): string[] {
  if (!idsParam) return [];
  if (Array.isArray(idsParam)) return idsParam;
  try {
    const parsed = JSON.parse(idsParam);
    return Array.isArray(parsed) ? parsed : [idsParam];
  } catch {
    return [idsParam];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toHit(c: any): Hit {
  const bannerImageId = c.data?.bannerImage as string | undefined;
  let iconUrl: string | undefined;
  if (bannerImageId) {
    try {
      iconUrl = portalLib.imageUrl({ id: bannerImageId, scale: 'width(100)' });
    } catch {
      iconUrl = undefined;
    }
  }
  return {
    id: c._id,
    displayName: c.displayName,
    description: c.data?.description,
    iconUrl,
  };
}

export function GET(request: {
  params: { query?: string; start?: string; count?: string; ids?: string | string[] };
}) {
  const query = request.params.query || '';
  const start = parseInt(request.params.start || '0', 10);
  const count = parseInt(request.params.count || '10', 10);
  const ids = toIdArray(request.params.ids);

  try {
    if (ids.length > 0) {
      const result = contentLib.query({
        contentTypes: ['com.enonic.app.hmdb:collection'],
        query: ids.map((id) => `_id = '${id}'`).join(' OR '),
        count: ids.length,
      });
      const hits = result.hits.map(toHit);
      return {
        status: 200,
        body: JSON.stringify({ hits, count: hits.length, total: hits.length }),
        contentType: 'application/json',
      };
    }

    const result = contentLib.query({
      contentTypes: ['com.enonic.app.hmdb:collection'],
      query: query ? `displayName LIKE '*${query}*'` : undefined,
      start,
      count,
    });

    const hits = result.hits.map(toHit);
    return {
      status: 200,
      body: JSON.stringify({ hits, count: hits.length, total: result.total }),
      contentType: 'application/json',
    };
  } catch (e) {
    return {
      status: 500,
      body: JSON.stringify({ error: String(e) }),
      contentType: 'application/json',
    };
  }
}
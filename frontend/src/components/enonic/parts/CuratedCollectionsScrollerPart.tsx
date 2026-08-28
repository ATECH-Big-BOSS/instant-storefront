import { PartProps } from "@enonic/nextjs-adapter";
import { fetchCollectionsByIds, resolveMediaUrl } from "@lib/enonic/collections";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import ScrollerWithArrows from "../ScrollerWithArrows";

function toArray(value: unknown): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [String(value)];
}

export default async function CuratedCollectionsScrollerPart({ part }: PartProps) {
  const config = (part as any)?.config || {};
  const heading = config?.heading || "Collections";
  const selectedIds = toArray(config?.selectedCollections);

  if (selectedIds.length === 0) return null;

  const items = await fetchCollectionsByIds(selectedIds);

  if (!items.length) return null;

  return (
    <div className="content-container py-12">
      <h2 className="text-2xl font-semibold mb-6">{heading}</h2>
      <ScrollerWithArrows>
        {items.map((col) => {
          const colImage = resolveMediaUrl(col.data?.bannerImage?.mediaUrl);
          return (
            <LocalizedClientLink
              key={col._name}
              href={`/collections/${col._name}`}
              className="flex-shrink-0 w-72 border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {colImage && (
                <div className="w-full h-40 overflow-hidden">
                  <img src={colImage} alt={col.displayName} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-medium text-lg mb-1">{col.displayName}</h3>
                {col.data?.description && (
                  <p className="text-sm text-ui-fg-subtle">{col.data.description}</p>
                )}
              </div>
            </LocalizedClientLink>
          );
        })}
      </ScrollerWithArrows>
    </div>
  );
}
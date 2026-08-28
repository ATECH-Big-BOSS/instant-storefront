import { PartProps } from "@enonic/nextjs-adapter";
import { notFound } from "next/navigation";
import Image from "next/image";
import { listProducts } from "@lib/data/products";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const ENONIC_ORIGIN = (process.env.ENONIC_API || "http://localhost:8080/site").replace(/\/site\/?$/, "");

function toArray(value: unknown): string[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [String(value)];
}

async function resolveImageUrl(imageId: string | null): Promise<string | null> {
    if (!imageId) return null;
    try {
        const res = await fetch("http://localhost:8080/site/hmdb/master", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `{ guillotine { get(key: "${imageId}") { ... on media_Image { mediaUrl } } } }`,
            }),
            cache: "no-store",
        });
        const json = await res.json();
        const mediaUrl = json?.data?.guillotine?.get?.mediaUrl;
        return mediaUrl ? ENONIC_ORIGIN + mediaUrl : null;
    } catch (e) {
        console.error("Failed to fetch collection banner image", e);
        return null;
    }
}

export default async function CollectionDetailPart({ common, meta }: PartProps) {
    const dataAsJson = common?.get?.dataAsJson as
    | { description?: string; bannerImage?: string; featuredProducts?: string[] | string }
    | undefined;

    const displayName = common?.get?.displayName as string | undefined;
    const description = dataAsJson?.description;
    const bannerImageId = dataAsJson?.bannerImage ?? null;
    const handles = toArray(dataAsJson?.featuredProducts).filter(Boolean);

    if (!displayName) {
        notFound();
    }

    const countryCode = meta.locale;

    const [bannerUrl, products] = await Promise.all([
        resolveImageUrl(bannerImageId),
                                                    handles.length > 0
                                                    ? listProducts({
                                                        countryCode,
                                                        queryParams: { handle: handles } as never,
                                                    }).then(({ response }) => response.products)
                                                    : Promise.resolve([]),
    ]);

    return (
        <div className="content-container py-12">
        {bannerUrl && (
            <div className="w-full h-64 overflow-hidden rounded-large mb-8 relative">
            <Image src={bannerUrl} alt={displayName} fill className="object-cover" />
            </div>
        )}
        <div className="mb-10">
        <h1 className="text-2xl-semi mb-3">{displayName}</h1>
        {description && (
            <p className="text-base-regular text-ui-fg-subtle max-w-2xl">{description}</p>
        )}
        </div>
        {products.length > 0 ? (
            <div className="grid grid-cols-2 small:grid-cols-3 gap-6">
            {products.map((product) => (
                <LocalizedClientLink
                key={product.id}
                href={`/products/${product.handle}`}
                className="group"
                >
                <div className="aspect-square w-full overflow-hidden bg-ui-bg-subtle relative rounded-large">
                {product.thumbnail && (
                    <Image
                    src={product.thumbnail}
                    alt={product.title ?? ""}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                )}
                </div>
                <p className="text-base-regular mt-2">{product.title}</p>
                </LocalizedClientLink>
            ))}
            </div>
        ) : (
            <p className="text-ui-fg-muted text-base-regular">No products in this collection yet.</p>
        )}
        </div>
    );
}

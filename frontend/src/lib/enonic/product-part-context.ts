import { PartProps } from '@enonic/nextjs-adapter';
import { listProducts } from '@lib/data/products';
import { getRegion } from '@lib/data/regions';
import { HttpTypes } from '@medusajs/types';

export type ProductPartContext = {
    product: HttpTypes.StoreProduct;
    region: HttpTypes.StoreRegion;
    countryCode: string;
};

// Reads the medusaHandle off the containing Product Page content (not part
// config — these parts have no config of their own, they just render a
// slice of whatever product the page is about).
export async function getProductPartContext(
    common: PartProps['common'],
    meta: PartProps['meta'],
): Promise<ProductPartContext | null> {
    const dataAsJson = common?.get?.dataAsJson as Record<string, string> | undefined;
    const handle = dataAsJson?.medusaHandle;
    if (!handle) return null;

    const countryCode = meta.locale;
    const [region, { response }] = await Promise.all([
        getRegion(countryCode),
        listProducts({ countryCode, queryParams: { handle } }),
    ]);

    const product = response.products[0];
    if (!region || !product) return null;

    return { product, region, countryCode };
}

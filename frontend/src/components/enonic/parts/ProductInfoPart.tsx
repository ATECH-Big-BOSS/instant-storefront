import { PartProps } from '@enonic/nextjs-adapter';
import ProductInfo from '@modules/products/templates/product-info';
import EditorialContent from '@modules/products/components/editorial-content';
import { getProductPartContext } from '@lib/enonic/product-part-context';

export default async function ProductInfoPart({ common, meta }: PartProps) {
    const ctx = await getProductPartContext(common, meta);
    if (!ctx) return null;

    return (
        <div className="content-container flex flex-col gap-y-4 w-full py-8">
            <ProductInfo product={ctx.product} />
            <EditorialContent />
        </div>
    );
}

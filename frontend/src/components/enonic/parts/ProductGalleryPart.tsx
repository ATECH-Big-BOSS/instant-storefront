import { PartProps } from '@enonic/nextjs-adapter';
import ImageGallery from '@modules/products/components/image-gallery';
import { getProductPartContext } from '@lib/enonic/product-part-context';

export default async function ProductGalleryPart({ common, meta }: PartProps) {
    const ctx = await getProductPartContext(common, meta);
    if (!ctx) return null;

    return (
        <div className="content-container block w-full relative">
            <ImageGallery images={ctx.product.images ?? []} />
        </div>
    );
}

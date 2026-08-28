import { HttpTypes } from "@medusajs/types"
import { listProducts } from "@lib/data/products"
import { fetchPromotions, showOn } from "@lib/enonic/promotions"

async function fetchProductsByHandles(
  handles: string[],
  countryCode: string
): Promise<HttpTypes.StoreProduct[]> {
  const results = await Promise.all(
    handles.map((h) =>
      listProducts({ countryCode, queryParams: { handle: h } }).then(
        (r) => r.response.products[0] ?? null
      )
    )
  )
  return results.filter((p): p is HttpTypes.StoreProduct => p !== null)
}

export async function getCartPromotions(
  cart: HttpTypes.StoreCart | null,
  countryCode: string
): Promise<{
  upsellData: HttpTypes.StoreProduct[]
  crossSellData: HttpTypes.StoreProduct[]
}> {
  const productHandles = Array.from(
    new Set(
      (cart?.items ?? [])
        .map((item) => item.product?.handle)
        .filter((h): h is string => !!h)
    )
  )

  if (productHandles.length === 0) {
    return { upsellData: [], crossSellData: [] }
  }

  const allPromotions = await Promise.all(productHandles.map(fetchPromotions))

  const upsellHandles = Array.from(
    new Set(
      allPromotions.flatMap((p) => (showOn(p.upsellPlacement, "cart") ? p.upsellProducts : []))
    )
  )
  const crossSellHandles = Array.from(
    new Set(
      allPromotions.flatMap((p) =>
        showOn(p.crossSellPlacement, "cart") ? p.crossSellProducts : []
      )
    )
  )

  const [upsellData, crossSellData] = await Promise.all([
    upsellHandles.length > 0 ? fetchProductsByHandles(upsellHandles, countryCode) : Promise.resolve([]),
    crossSellHandles.length > 0
      ? fetchProductsByHandles(crossSellHandles, countryCode)
      : Promise.resolve([]),
  ])

  return { upsellData, crossSellData }
}

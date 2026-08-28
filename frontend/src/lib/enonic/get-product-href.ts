const ENONIC_API = process.env.ENONIC_API || "http://localhost:8080/site"
const PROJECT = "hmdb"

export async function getProductHref(
  handle: string,
  countryCode: string
): Promise<string> {
  try {
    const safe = handle.replace(/'/g, "")
    const url = `${ENONIC_API}/${PROJECT}/master`
    const query = `{
      guillotine {
        query(
          contentTypes: ["com.enonic.app.hmdb:product-page"]
          query: "data.medusaHandle = '${safe}'"
          first: 1
        ) {
          _path
        }
      }
    }`

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      cache: "no-store",
    })
    if (!res.ok) return `/products/${handle}`

    const json = await res.json()
    const hit = json?.data?.guillotine?.query?.[0]
    const path: string | undefined = hit?._path

    if (!path) return `/products/${handle}`

    // strip the leading site-root segment (e.g. "/home") to get the real URL path
    const urlPath = "/" + path.split("/").filter(Boolean).slice(1).join("/")
    return urlPath
  } catch {
    return `/products/${handle}`
  }
}
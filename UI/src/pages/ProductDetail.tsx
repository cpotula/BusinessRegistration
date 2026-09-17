import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { ProductDetailInfo } from '../api/types'
import { whatsappChatLink } from '../api/utils'

// Product Details page - reached from the search results page.
// Shows the product media/description plus its parent business with
// direct contact CTAs and a link to the full business page.
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<ProductDetailInfo | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setNotFound(true))
  }, [id])

  if (notFound) return (
    <div className="text-center py-20">
      <p className="text-gray-500 text-lg">Product not found.</p>
      <Link to="/search" className="text-primary-600 mt-4 inline-block">Back to search</Link>
    </div>
  )
  if (!product) return <div className="text-center py-20"><div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>

  const wa = whatsappChatLink(product.contactWhatsApp ?? product.contactPhone, product.businessName)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link to="/search" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to search results
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery */}
        <div>
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 border overflow-hidden flex items-center justify-center">
            {product.images.length > 0 ? (
              <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-16 h-16 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-colors ${i === activeImg ? 'border-primary-600' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          {product.price != null && (
            <p className="text-3xl font-extrabold text-primary-700 mt-3">₹{product.price.toLocaleString('en-IN')}</p>
          )}
          {product.description && <p className="text-gray-600 whitespace-pre-line mt-4 leading-relaxed">{product.description}</p>}

          {product.videos.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-gray-900">Videos</h3>
              {product.videos.map((v) => (
                <a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 bg-white border rounded-xl hover:border-primary-300 transition-colors">
                  <span className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                  <span className="text-sm font-medium text-gray-700 truncate">{v.title || v.url}</span>
                </a>
              ))}
            </div>
          )}

          {/* Parent business card */}
          <div className="mt-8 bg-white border rounded-2xl p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-3">Offered by</p>
            <div className="flex items-center gap-4">
              {product.logoUrl ? (
                <img src={product.logoUrl} alt={product.businessName} className="w-14 h-14 rounded-xl object-cover border" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                  {product.businessName.charAt(0)}
                </div>
              )}
              <div>
                <Link to={`/b/${product.businessSlug}`} className="font-bold text-gray-900 hover:text-primary-700 transition-colors">{product.businessName}</Link>
                <p className="text-sm text-gray-500">{product.categoryName}{product.city ? ` · ${product.city}` : ''}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              {product.contactPhone && (
                <a href={`tel:${product.contactPhone}`} className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors">Call Now</a>
              )}
              {wa && (
                <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.48 11.815 11.815 0 0012.05 0zm5.422 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
                  WhatsApp
                </a>
              )}
              <Link to={`/b/${product.businessSlug}`} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:border-primary-300 hover:text-primary-700 transition-colors">
                View Business Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

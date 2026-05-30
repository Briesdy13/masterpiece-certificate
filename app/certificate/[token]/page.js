import { supabase } from '@/lib/supabase'

function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateTime(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusConfig(statusRaw) {
  const status = String(statusRaw || 'IN').toUpperCase()

  if (status === 'OUT') {
    return {
      label: 'OUT',
      badge: 'bg-red-500/15 text-red-400',
      accent: 'text-red-400',
    }
  }

  if (status === 'EXPIRED') {
    return {
      label: 'EXPIRED',
      badge: 'bg-orange-500/15 text-orange-400',
      accent: 'text-orange-400',
    }
  }

  if (status === 'VOID') {
    return {
      label: 'VOID',
      badge: 'bg-zinc-500/15 text-zinc-400',
      accent: 'text-zinc-400',
    }
  }

  if (status === 'BROKEN') {
    return {
      label: 'BROKEN',
      badge: 'bg-orange-700/15 text-orange-300',
      accent: 'text-orange-300',
    }
  }

  return {
    label: 'ACTIVE / IN',
    badge: 'bg-emerald-500/15 text-emerald-400',
    accent: 'text-emerald-400',
  }
}

export default async function CertificatePage({ params }) {
  const resolvedParams = await params
  const token = resolvedParams?.token

  const { data: bottle, error } = await supabase
    .from('bottles')
    .select(`
      id,
      branch_id,
      item_code,
      qr_token,
      customer_name,
      category_name,
      item_name,
      volume_ml,
      lot_no,
      note,
      photo_url,
      pdf_url,
      certificate_url,
      status,
      created_by,
      created_at,
      keeping_date,
      expired_date,
      pic_name,
      stock_out_at,
      branch_name,
      stock_out_by
    `)
    .eq('qr_token', token)
    .maybeSingle()

  let histories = []

  if (bottle?.id) {
    const { data } = await supabase
      .from('bottle_histories')
      .select('id, bottle_id, branch_id, type, description, created_by, created_at')
      .eq('bottle_id', bottle.id)
      .order('created_at', { ascending: true })

    histories = data || []
  }

  if (error || !bottle) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-red-500/30 bg-zinc-950 p-8 text-center">
          <h1 className="text-3xl font-black text-red-400">
            Certificate Not Found
          </h1>
          <p className="mt-4 text-zinc-400">
            QR token tidak ditemukan di database.
          </p>
          <p className="mt-4 break-all text-xs text-zinc-600">
            {token || '-'}
          </p>
        </div>
      </main>
    )
  }

  const status = statusConfig(bottle.status)
  const branchName = bottle.branch_name || '-'

  return (
    <main className="min-h-screen bg-[#050505] text-white px-4 py-8">
      <section className="mx-auto max-w-4xl rounded-[32px] border border-[#D4A64A]/30 bg-gradient-to-b from-[#141414] to-[#070707] p-5 shadow-2xl md:p-8">
        <div className="text-center">
          <div className="text-3xl font-black tracking-[0.25em] text-[#D4A64A]">
            MASTERPIECE
          </div>
          <div className="mt-1 text-xs font-bold tracking-[0.35em] text-zinc-400">
            SIGNATURE FAMILY KARAOKE
          </div>
          <div className="mt-2 text-sm font-black text-white">
            {branchName}
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-zinc-500">
                Foto Botol / Barang
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${status.badge}`}>
                {status.label}
              </span>
            </div>

            {bottle.photo_url ? (
              <img
                src={bottle.photo_url}
                alt="Bottle Photo"
                className="h-80 w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-80 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-600">
                No Photo
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[#D4A64A]/20 bg-white p-5 text-black">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase text-zinc-500">
                  Item Code
                </div>
                <div className="mt-1 break-all text-3xl font-black">
                  {bottle.item_code || '-'}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-black">
                  MASTERPIECE
                </div>
                <div className="text-sm font-black">
                  {branchName}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-[15px]">
              <Info label="Customer Name" value={bottle.customer_name} />
              <Info label="Jenis Minuman" value={bottle.category_name} />
              <Info label="Item / Minuman" value={bottle.item_name} />
              <Info label="Volume" value={`${bottle.volume_ml || '-'} ML`} />
              <Info label="Keeping Date" value={formatDate(bottle.keeping_date || bottle.created_at)} />
              <Info label="Stock Out Date" value={formatDate(bottle.stock_out_at)} />
              <Info label="Expired Date" value={formatDate(bottle.expired_date)} />
              <Info label="PIC" value={bottle.pic_name} />
              <Info label="Lot No" value={bottle.lot_no} />
              <Info label="Status" value={status.label} />
              <Info label="Notes" value={bottle.note} />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-black/40 p-5">
          <h2 className="text-lg font-black text-[#D4A64A]">
            History
          </h2>

          <div className="mt-4 space-y-3">
            {histories.length === 0 ? (
              <div className="rounded-2xl bg-white/5 p-4 text-sm text-zinc-400">
                {formatDateTime(bottle.created_at)} - Bottle keeping dibuat oleh {bottle.pic_name || 'Staff'}
              </div>
            ) : (
              histories.map((h) => (
                <div
                  key={h.id || h.created_at}
                  className="rounded-2xl bg-white/5 p-4 text-sm text-zinc-300"
                >
                  <b className="text-white">{formatDateTime(h.created_at)}</b>
                  <span className="mx-2 text-zinc-600">-</span>
                  <span className="font-black text-[#D4A64A]">
                    {h.type || 'ACTIVITY'}
                  </span>
                  <span className="mx-2 text-zinc-600">•</span>
                  {h.description || 'Activity'}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-black/40 p-5">
          <h2 className="text-lg font-black text-[#D4A64A]">
            Certificate Link
          </h2>
          <p className="mt-3 break-all text-sm text-zinc-400">
            {bottle.certificate_url || `https://masterpiece-certificate.vercel.app/c/${bottle.qr_token}`}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          {bottle.pdf_url ? (
            <a
              href={bottle.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 rounded-2xl bg-[#D4A64A] px-5 py-4 text-center font-black text-black"
            >
              DOWNLOAD PDF
            </a>
          ) : (
            <button
              disabled
              className="flex-1 rounded-2xl bg-zinc-800 px-5 py-4 text-center font-black text-zinc-500"
            >
              PDF BELUM TERSEDIA
            </button>
          )}

          <div className="flex-1 rounded-2xl border border-white/10 px-5 py-4 text-center text-sm font-bold text-zinc-400">
            Scan QR sticker untuk akses certificate online
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600">
          Generated by Masterpiece Bottle Keeping System
        </p>
      </section>
    </main>
  )
}

function Info({ label, value }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 border-b border-zinc-200 pb-2">
      <div className="font-bold text-zinc-500">
        {label}
      </div>
      <div className="font-black">
        {value || '-'}
      </div>
    </div>
  )
}

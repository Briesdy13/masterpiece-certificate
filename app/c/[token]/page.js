import { redirect } from 'next/navigation'

export default async function Page({ params }) {
  const resolvedParams = await params
  const token = resolvedParams?.token

  redirect(`/certificate/${token}`)
}
'use client'
import Link from "next/link";
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

export default function Home() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        123
      </div>
      <li><Link className={`link ${pathname === '/user' ? 'active' : ''}`} href="/user">user</Link></li>
      <li><Link className={`link ${pathname === '/user/login' ? 'active' : ''}`} href="/user/login">/login</Link></li>
      <li><Link className={`link ${pathname === '#login' ? 'active' : ''}`} href="#login">#login</Link></li>
      <li><Link  href="/work">work</Link></li>
      <button type="button" onClick={() => router.push('/user')}>
        Dashboard
      </button>
    </main>
  );
}

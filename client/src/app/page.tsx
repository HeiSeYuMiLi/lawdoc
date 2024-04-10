'use client'

import { useRouter } from 'next/navigation'
import { checkSession } from '@/app/session'
import React from 'react'

export default function Page() {
  const router = useRouter()

  if (checkSession()) {
    router.push('/user/login');
  }

  router.replace('/home')

  return (
    <></>
  );
}

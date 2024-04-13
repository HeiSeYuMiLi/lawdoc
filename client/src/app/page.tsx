'use client'

import { useRouter } from 'next/navigation'
import { getToken } from '@/app/session'
import React from 'react'

export default function Page() {
  const router = useRouter()

  if (getToken()) {
    router.push('/user/login');
  }

  router.replace('/home')

  return (
    <></>
  );
}

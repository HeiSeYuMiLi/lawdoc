'use client'

import { useRouter } from 'next/navigation'
import { getToken } from '@/app/session'
import React from 'react'

export default function Page() {
  const router = useRouter()

  const token = getToken()
  if (token === null || token === '') {
      router.replace('/user/login');
  }else{
    router.replace('/home')
  }

  return (
    <></>
  );
}

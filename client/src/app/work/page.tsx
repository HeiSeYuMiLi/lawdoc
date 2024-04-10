'use client'

import "bulma"
import { useRouter } from 'next/navigation'
import { checkSession } from '@/app/session'
import React from 'react'
import { Nav } from '@/app/nav'

export default function Work() {
    const router = useRouter()

    if (checkSession()) {
        router.replace('/user/login');
    }
    return (
        <main className="flex min-h-screen flex-col items-center justify-between ">

            <div className="containers" style={{ width: "80%", height: "100vh" }}>

                {Nav()}

                <div className="box" style={{ width: "100%", height: "100vh" }}>
                    <div style={{ width: "75%", height: "50vh", float: "right" }}>
                        <p>456</p>
                    </div>
                </div>

            </div>
        </main>
    );
};
'use client'

import "bulma"
import Link from "next/link";
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { checkSession } from '@/app/session'
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react'
import { Nav } from '@/app/nav'

export default function Home() {
    useEffect(() => { }, []);

    const pathname = usePathname()
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

                        <article className="panel is-primary">
                            <p className="panel-heading">Primary</p>
                            <p className="panel-tabs">
                                <a className="is-active">All</a>
                                <a>Public</a>
                                <a>Private</a>
                                <a>Sources</a>
                                <a>Forks</a>
                            </p>
                            <div className="panel-block">
                                <p className="control has-icons-left">
                                    <input className="input is-primary" type="text" placeholder="Search" />
                                    <span className="icon is-left">
                                        <i className="fas fa-search" aria-hidden="true"></i>
                                    </span>
                                </p>
                            </div>
                            <a className="panel-block is-active">
                                <span className="panel-icon">
                                    <i className="fas fa-book" aria-hidden="true"></i>
                                </span>
                                bulma
                            </a>
                            <a className="panel-block">
                                <span className="panel-icon">
                                    <i className="fas fa-book" aria-hidden="true"></i>
                                </span>
                                marksheet
                            </a>
                            <a className="panel-block">
                                <span className="panel-icon">
                                    <i className="fas fa-book" aria-hidden="true"></i>
                                </span>
                                minireset.css
                            </a>
                            <a className="panel-block">
                                <span className="panel-icon">
                                    <i className="fas fa-book" aria-hidden="true"></i>
                                </span>
                                jgthms.github.io
                            </a>
                        </article>

                    </div>
                </div>

            </div>
        </main>
    );
}

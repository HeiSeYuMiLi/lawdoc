'use client'

import "bulma"
import { useRouter } from 'next/navigation';
import { setToken, getToken } from "../session";
import React from 'react';
import Link from "next/link";

export function AdminNav() {
    const router = useRouter()

    const signout = (event: React.MouseEvent<HTMLButtonElement>) => {
        setToken('');
        const token = getToken()
        if (token === null || token === '') {
            router.replace('/user/login');
        }
    };

    return (
        <div className="leftNav">
            <section className="hero is-small">
                <div className="hero-body">
                    <p className="subtitle">管理员页面</p>
                </div>
            </section>
            <hr style={{ backgroundColor: "black" }} />
            <Link href="/admin/home">
                <button className="button is-primary">
                    <span className="panel-icon is-small is-left">
                        <i className="fas fa-home" />
                    </span>
                    <p style={{ color: "black" }}>
                        管理主页
                    </p>
                </button>
            </Link>
            <Link href="/admin/file">
                <button className="button is-primary">
                    <span className="panel-icon is-small is-left">
                        <i className="fas fa-folder" />
                    </span>
                    <p style={{ color: "black" }}>
                        文件信息
                    </p>
                </button>
            </Link>
            <Link href="/admin/user">
                <button className="button is-primary">
                    <span className="panel-icon is-small is-left">
                        <i className="fas fa-edit" />
                    </span>
                    <p style={{ color: "black" }}>
                        用户信息
                    </p>
                </button>
            </Link>
            <button className="button is-primary" onClick={signout}>
                <span className="panel-icon is-small is-left">
                    <i className="fas fa-sign-out-alt" />
                </span>
                退出登录
            </button>
        </div>
    );
}

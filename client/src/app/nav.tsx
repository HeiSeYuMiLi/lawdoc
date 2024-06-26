'use client'

import "bulma"
import { useRouter } from 'next/navigation'
import { setToken } from "./session"
import React from 'react';
import Link from "next/link";

export function Nav() {
    const router = useRouter()

    const signout = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setToken('');
        router.replace('/user/login');
    };

    return (
        <div className="leftNav">
            <span className="panel-icon is-small is-left">
                <i className="fas fa-list" />
            </span>
            <hr style={{ backgroundColor: "black" }} />
            <Link href="/home">
                <button className="button is-primary">
                    <span className="panel-icon is-small is-left">
                        <i className="fas fa-home" />
                    </span>
                    <p style={{ color: "black" }}>
                        个人主页
                    </p>
                </button>
            </Link>
            <Link href="/file">
                <button className="button is-primary">
                    <span className="panel-icon is-small is-left">
                        <i className="fas fa-folder" />
                    </span>
                    <p style={{ color: "black" }}>
                        文件信息
                    </p>
                </button>
            </Link>
            <Link href="/work">
                <button className="button is-primary">
                    <span className="panel-icon is-small is-left">
                        <i className="fas fa-edit" />
                    </span>
                    <p style={{ color: "black" }}>
                        工作页面
                    </p>
                </button>
            </Link>
            <Link href="/show">
                <button className="button is-primary">
                    <span className="panel-icon is-small is-left">
                        <i className="fas fa-file-alt" />
                    </span>
                    <p style={{ color: "black" }}>
                        展示页面
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

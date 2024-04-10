'use client'

import "bulma"
import { useRouter } from 'next/navigation'
import React from 'react'

export function Nav() {
    const router = useRouter()

    const selectNav = (event: React.MouseEvent<HTMLButtonElement>) => {
        const clickedButton = event.target as HTMLElement;
        const buttonId = clickedButton.id;
        console.log(buttonId)
        if (buttonId === 'home') {
            router.replace('/home');
        } else if (buttonId === 'work') {
            router.replace('/work');
        }
    };

    return (
        <div className="box has-background-primary" style={{ width: "25%", height: "100vh", float: "inline-start" }}>
            <section className="hero is-small">
                <div className="hero-body">
                    <p className="title">
                        <span className="panel-icon is-small is-left">
                            <i className="far fa-user" />
                        </span>
                        游客
                    </p>
                    <p className="subtitle">123456789</p>
                </div>
            </section>
            <hr style={{ backgroundColor: "black" }} />
            <button className="button is-primary" id="home" style={{ width: "100%" }} onClick={selectNav}>
                <span className="panel-icon is-small is-left">
                    <i className="fas fa-home" />
                </span>
                个人主页
            </button>
            <button className="button is-primary" id="work" style={{ width: "100%" }} onClick={selectNav}>
                <span className="panel-icon is-small is-left">
                    <i className="fas fa-folder" />
                </span>
                工作页面
            </button>
            <button className="button is-primary" id="show" style={{ width: "100%" }} onClick={selectNav}>
                <span className="panel-icon is-small is-left">
                    <i className="fas fa-file-alt" />
                </span>
                展示页面
            </button>
            <button className="button is-primary" style={{ width: "100%" }}>
                <span className="panel-icon is-small is-left">
                    <i className="fas fa-sign-out-alt" />
                </span>
                退出登录
            </button>
        </div>
    );
}

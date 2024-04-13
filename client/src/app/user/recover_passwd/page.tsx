'use client'

import "bulma"
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react'
import axios from 'axios';
import { setToken } from "@/app/session";
import { useRouter } from 'next/navigation'

export default function RecoverPasswd() {

    const router = useRouter()
    const [phone, setPhone] = useState('');
    const [captcha, setCaptcha] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const url = 'http://localhost:22222/lawdoc/user/recover';

        try {
            const response = await axios.post(url, {
                'phone': phone,
                'captcha': captcha
            });

            if (response.status === 200) {
                const data = response.data
                if (data.code === 0) {
                    console.log(data);
                    setToken(data.data.token);
                    router.replace('/home')
                } else {
                    alert(data.err_msg)
                }
            } else {
                alert('找回密码失败')
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error);
        }
    };

    const getCaptcha = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        const url = 'http://localhost:22222/lawdoc/signin/get_captcha';

        try {
            const response = await axios.post(url, { 'account': phone });

            if (response.status === 200) {
                const data = response.data;
                if (data.code === 0) {
                    alert(data.data.captcha);
                }
                else {
                    alert(data.err_msg)
                }
            } else {
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error);
        }
    };

    const signin = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        router.replace('/user/login');
    };

    return (
        <main className="p-36" style={{ height: "100vh" }}>
            <div className="ml-auto" style={{ width: "35%" }}>
                <div className="box trans1">

                    <div>
                        <p className="has-text-centered is-size-4"><strong>手机密码注册</strong></p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <div className="field mb-5">
                                <label className="label">手机号</label>
                                <div className="field has-addons">
                                    <div className="control">
                                        <span className="select">
                                            <select style={{ backgroundColor: "rgba(255,255,255,0.8)" }}>
                                                <option>+86</option>
                                                <option>+56</option>
                                                <option>+19</option>
                                            </select>
                                        </span>
                                    </div>
                                    <div className="control is-expanded">
                                        <input className="input trans1" type="tel" placeholder="请输入手机号" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="field mb-5">
                                <label className="label">验证码</label>
                                <div className="field has-addons">
                                    <div className="control is-expanded">
                                        <input className="input trans1" type="text" placeholder="请输入手机验证码" value={captcha} onChange={(e) => setCaptcha(e.target.value)} />
                                    </div>
                                    <div className="control">
                                        <button className="button" onClick={getCaptcha} style={{ backgroundColor: "rgba(255,255,255,0.8)" }}>
                                            获取验证码
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button className="submit is-primary formButton">找回</button>
                            <button className="button is-primary" onClick={signin}
                                style={{ width: "100%", backgroundColor: "rgba(0,0,0,0)" }}>返回登录</button>
                        </div>
                    </form>

                </div>
            </div>
        </main>
    );
}
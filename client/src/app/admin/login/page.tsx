'use client'

import "bulma"
import { useState } from 'react';
import React from 'react'
import axios from 'axios';
import { setAdmin } from "@/app/parameter";
import { useRouter } from 'next/navigation'

export default function Signup() {

    const router = useRouter()
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const url = 'http://localhost:22222/lawdoc/admin/signin';

        try {
            const response = await axios.post(url, {
                'phone': phone,
                'passwd': password
            });

            if (response.status === 200) {
                const data = response.data
                if (data.code === 0) {
                    setAdmin(data.data.token);
                    router.replace('/admin/home')
                } else {
                    alert(data.err_msg)
                }
            } else {
                alert('注册失败')
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error);
        }
    };

    return (
        <main className="p-36" style={{ height: "100vh" }}>
            <div className="ml-auto" style={{ width: "35%" }}>
                <div className="box trans1">

                    <div>
                        <p className="has-text-centered is-size-4"><strong>管理员登录</strong></p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <div className="field mb-5">
                                <label className="label">账 号</label>
                                <div className="control">
                                    <p className="control is-expanded has-icons-left">
                                        <input className="input trans1" type="tel" placeholder="请输入账号" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                        <span className="icon is-small is-left">
                                            <i className="fas fa-user"></i>
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="field mb-5">
                                <label className="label">密 码</label>
                                <div className="control">
                                    <p className="control is-expanded has-icons-left">
                                        <input className="input trans1" type="password" placeholder="请输入密码" value={password} onChange={(e) => setPassword(e.target.value)} />
                                        <span className="icon is-small is-left">
                                            <i className="fas fa-unlock-alt"></i>
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <button className="submit is-primary formButton">登 录</button>
                        </div>
                    </form>

                </div>
            </div>
        </main>
    );
}
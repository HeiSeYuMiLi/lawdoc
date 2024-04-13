'use client'

import "bulma"
import { useRouter } from 'next/navigation'
import { getToken } from '@/app/session'
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react'
import { Nav } from '@/app/nav'
import axios from 'axios';

export default function Home() {
    useEffect(() => { }, []);

    const router = useRouter()

    const token = getToken()
    if (token === null || token === '') {
        router.replace('/user/login');
    }

    const getFileNameList = async () => {
        const url = 'http://localhost:22222/lawdoc/file_list';
        const config = {
            headers: {
                'Authorization': token
            }
        };

        try {
            const response = await axios.post(url, config);

            if (response.status === 200) {
                const data = response.data;
                if (data.code === 0) {
                    const fileNameList: { file: string }[] = JSON.parse(data.data.files);
                    console.log(fileNameList);
                    return fileNameList.map((file, index) => (
                        <a className="panel-block">
                            <span className="panel-icon">
                                <i className="fas fa-book" aria-hidden="true"></i>
                            </span>
                            {file.file}
                        </a>
                    ));
                }
            } else {
                alert('获取文件列表失败');
            }
        } catch (error) {
            console.error('获取文件列表失败：', error);
            alert('获取文件列表失败');
        }
        return (<></>);
    };

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

                            {/* {getFileNameList()} */}

                        </article>

                        <div>
                            <button style={{ width: "40%" }} onClick={getFileNameList}>提 交</button>
                        </div>

                    </div>
                </div>

            </div>
        </main>
    );
}

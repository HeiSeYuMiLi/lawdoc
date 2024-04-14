'use client'

import "bulma"
import { useRouter } from 'next/navigation'
import { getToken } from '@/app/session'
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react'
import { Nav } from '@/app/nav'
import axios from 'axios';
import Link from 'next/link';
import { getFileUuid } from "../parameter";

const getFile = async (fileUuid: any) => {
    const token = getToken()
    const url = 'http://localhost:22222/lawdoc/file';
    const config = {
        headers: {
            'Authorization': token
        }
    };

    try {
        const response = await axios.post(url, {
            'file_uuid': fileUuid
        }, config);

        if (response.status === 200) {
            const data = response.data;
            if (data.code === 0) {
                const file: {
                    file_name: string,
                    file_type: string,
                    entities: JSON
                } = data.data;
                console.log(file);
                return file;
            } else {
                alert(data.err_msg);
            }
        } else {
            alert('获取文件失败');
        }
    } catch (error) {
        console.error('获取文件失败：', error);
        alert('获取文件失败');
    }
    return {
        'file_name': '',
        'file_type': '',
        'entities': JSON
    };
};

function DataDisplay() {
    const fileUuid = getFileUuid();
    const [data, setData] = useState({
        'file_name': '',
        'file_type': '',
        'entities': JSON
    });

    useEffect(() => {
        async function fetchDataAndSetState() {
            const fetchedData = await getFile(fileUuid);
            setData(fetchedData);
        };

        fetchDataAndSetState();
    }, []);

    interface Data {
        [key: string]: {
            [key: string]: number[][];
        };
    }

    const jsonObj = JSON.parse('{"劳荣枝":[[24,27],[568,565]],"枝":[[538,541],[568,565]]}')

    return (
        <div className="content">
            <h1>文件名：{data.file_name}</h1>
            <h2>实体详情：</h2>

            {/* {Object.entries(jsonObj).map(([key, value]) => (
                <div key={key}>
                    <h3>{key}</h3>
                    {value.map((item, index) => (
                        <p key={index}>{item.join(', ')}</p>
                    ))}
                </div>
            ))} */}
            {
                Object.entries(data.entities).map(([key, arr]) => (
                    <div key={key}>
                        <p>{key}</p>
                        {
                            arr.map((item, index) => (
                                Object.entries(item).map(([key2, arr2]) => (
                                    <div key={key2}>
                                        <p>{key2}</p>
                                        {arr2.map((item2, index2) => (
                                            <p key={index2}>{item2.join(', ')}</p>
                                        ))}
                                    </div>
                                ))
                            ))
                        }
                    </div>
                ))
            }

        </div>
    );
}


export default function Show() {
    const router = useRouter()

    const token = getToken()
    if (token === null || token === '') {
        router.replace('/user/login');
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between ">

            <div className="containers" style={{ width: "80%", height: "100vh" }}>

                {Nav()}

                <div className="box" style={{ width: "100%", height: "100vh" }}>
                    <div style={{ width: "75%", height: "50vh", float: "right" }}>

                        {DataDisplay()}

                    </div>
                </div>
            </div>
        </main>
    );
};
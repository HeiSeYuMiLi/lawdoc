'use client'

import "bulma"
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react';
import React from 'react'
import { AdminNav } from '@/app/admin/nav'
import axios from 'axios';
import { getAdmin } from "@/app/parameter";
import Link from "next/link";
import { Pagination } from "@/app/pagination";

type TFileList = {
    id: number,
    user_id: number,
    user_name: string,
    file_name: string,
    file_uuid: string,
    file_type: string,
    create_time: string
}[];
type RespType = {
    count: number,
    files: TFileList
}

const getFileList = async (keyword: string, keyword2: string, id: string, page: number) => {
    const token = getAdmin()
    const url = 'http://localhost:22222/lawdoc/admin/file_list';
    const config = {
        headers: {
            'Authorization': token
        }
    };

    try {
        const response = await axios.post(url, {
            'file_name': keyword,
            'file_type': keyword2,
            'user_id': id,
            'page': page
        }, config);

        if (response.status === 200) {
            const data = response.data;
            if (data.code === 0) {
                const res: RespType = data.data;
                return res;
            } else {
                alert(data.err_msg);
            }
        } else {
            alert('获取文件列表失败');
        }
    } catch (error) {
        console.error('获取文件列表失败：', error);
        alert('获取文件列表失败');
    }
    return {
        'count': 0,
        'files': [{
            'id': 0,
            'user_id': 0,
            'user_name': '',
            'file_name': '',
            'file_uuid': '',
            'file_type': '',
            'create_time': ''
        }]
    };
};

export default function File() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [keyword, setKeyWord] = useState('');
    const [keyword2, setKeyWord2] = useState('');
    const [keyword3, setKeyWord3] = useState(searchParams.get('userId') === null ? '' : (searchParams.get('userId') as string));
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);

    const token = getAdmin()
    if (token === null || token === '') {
        router.replace('/user/login');
    }

    const [data, setData] = useState({
        'count': 0,
        'files': [{
            'id': 0,
            'user_id': 0,
            'user_name': '',
            'file_name': '',
            'file_uuid': '',
            'file_type': '',
            'create_time': ''
        }]
    });

    useEffect(() => {
        async function fetchDataAndSetState() {
            const fetchedData = await getFileList(keyword, keyword2, keyword3, 1);
            setData(fetchedData);
            setCurrentPage(1);
            setTotalPage(Math.ceil(fetchedData.count / 10));
        };

        fetchDataAndSetState();
    }, [keyword, keyword2, keyword3]);
    useEffect(() => {
        async function fetchDataAndSetState() {
            const fetchedData = await getFileList(keyword, keyword2, keyword3, currentPage);
            setData(fetchedData);
        };

        fetchDataAndSetState();
    }, [currentPage]);

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {AdminNav()}
            <main className="rightDiv">
                <div>
                    <div>
                        <nav className="breadcrumb has-succeeds-separator" aria-label="breadcrumbs">
                            <ul>
                                <li>
                                    <span className="panel-icon is-small is-left">
                                        <i className="fas fa-angle-double-right" />
                                    </span>
                                    <Link href="/admin/home">
                                        <p style={{ color: "black" }}>管理主页</p>
                                    </Link>
                                </li>
                                <li className="is-active"><a href="#" aria-current="page">
                                    <p style={{ color: "black" }}>
                                        <strong>文件信息</strong>
                                    </p>
                                </a></li>
                            </ul>
                        </nav>
                    </div>
                    <hr />
                    <div>
                        <table className="table" style={{ width: "100%" }}>
                            <thead>
                                <tr>
                                    <th>编号</th>
                                    <th>
                                        文件名:
                                        <input type="text" placeholder="所有文件" style={{ marginLeft: "10px", paddingLeft: "5px" }}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setKeyWord(value);
                                            }} />
                                    </th>
                                    <th>
                                        文件类型：
                                        <select onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '所有')
                                                setKeyWord2('');
                                            else
                                                setKeyWord2(value);
                                        }}>
                                            <option>所有</option>
                                            <option>pdf</option>
                                            <option>txt</option>
                                            <option>jpg</option>
                                            <option>png</option>
                                        </select>
                                    </th>
                                    <th>用户名</th>
                                </tr>
                            </thead>
                            <tbody>

                                {
                                    data.files.map((fileInfo, index) => (
                                        <tr>
                                            <th>{index + 1}</th>
                                            <td>
                                                {fileInfo.file_name}
                                            </td>
                                            <td>{fileInfo.file_type}</td>
                                            <td>{fileInfo.user_name}</td>
                                        </tr>
                                    ))
                                }

                            </tbody>
                        </table>

                        <div>
                            <Pagination currentPage={currentPage} totalPage={totalPage} callback={setCurrentPage} />
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

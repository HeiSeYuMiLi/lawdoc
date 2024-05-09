'use client'

import "bulma"
import { useRouter } from 'next/navigation'
import { getAdmin } from "@/app/parameter";
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react'
import { AdminNav } from '@/app/admin/nav'
import axios from 'axios';
import Link from "next/link";
import { Pagination } from "@/app/pagination";

type TuserList = {
    id: string,
    sex: number,
    name: string,
    phone: string,
    file_count: number
}[];
type RespType = {
    count: number,
    users: TuserList
}
const getUserList = async (keyword: string, keyword2: string, currentPage: number) => {
    const token = getAdmin()
    const url = 'http://localhost:22222/lawdoc/admin/user_list';
    const config = {
        headers: {
            'Authorization': token
        }
    };

    try {
        const response = await axios.post(url, {
            'name': keyword,
            'sex': keyword2,
            'page': currentPage
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
            alert('获取用户列表失败');
        }
    } catch (error) {
        console.error('获取用户列表失败：', error);
        alert('获取用户列表失败');
    }
    return {
        'count': 0,
        'users': [{
            'id': '',
            'sex': 0,
            'name': '',
            'phone': '',
            'file_count': 0
        }]
    }
};

export default function File() {
    const router = useRouter()
    const [keyword, setKeyWord] = useState('');
    const [keyword2, setKeyWord2] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [data, setData] = useState({
        'count': 0,
        'users': [{
            'id': '',
            'sex': 0,
            'name': '',
            'phone': '',
            'file_count': 0
        }]
    });

    const token = getAdmin()
    if (token === null || token === '') {
        router.replace('/user/login');
    }

    useEffect(() => {
        async function fetchDataAndSetState() {
            const fetchedData = await getUserList(keyword, keyword2, 1);
            setData(fetchedData);
            setCurrentPage(1);
            setTotalPage(Math.ceil(fetchedData.count / 10));
        };

        fetchDataAndSetState();
    }, [keyword, keyword2]);
    useEffect(() => {
        async function fetchDataAndSetState() {
            const fetchedData = await getUserList(keyword, keyword2, currentPage);
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
                                        <strong>用户信息</strong>
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
                                        用户名:
                                        <input type="text" placeholder="所有用户" style={{ marginLeft: "10px", paddingLeft: "5px" }}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setKeyWord(value);
                                            }} />
                                    </th>
                                    <th>
                                        性别:
                                        <select onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '所有')
                                                setKeyWord2('');
                                            else if (value === '男')
                                                setKeyWord2('0');
                                            else
                                                setKeyWord2('1');
                                        }}>
                                            <option>所有</option>
                                            <option>男</option>
                                            <option>女</option>
                                        </select>
                                    </th>
                                    <th>手机号</th>
                                    <th>文件数量</th>
                                </tr>
                            </thead>
                            <tbody>

                                {
                                    data.users.map((user, index) => (
                                        <tr>
                                            <th>{index + 1}</th>
                                            <td>
                                                <Link href={`/admin/file?userId=${user.id}`}>
                                                    <p style={{ color: "black" }} title="点击查看用户文件信息">
                                                        {user.name}
                                                    </p>
                                                </Link>
                                            </td>
                                            <td>{user.sex === 0 ? '男' : '女'}</td>
                                            <td>{user.phone}</td>
                                            <td>{user.file_count}</td>
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

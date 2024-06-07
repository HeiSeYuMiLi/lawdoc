'use client'

import "bulma"
import { useRouter } from 'next/navigation'
import { getToken } from '@/app/session'
import { useEffect, useState } from 'react';
import React from 'react';
import { Nav } from '@/app/nav'
import axios from 'axios';
import Link from "next/link";
import { Pagination } from "@/app/pagination";

type TFileList = {
    fileName: string,
    fileUuid: string,
    status: number
}[];
type RespType = {
    count: number,
    files: TFileList
}
const getFileNameList = async (keyword: string, page: number) => {
    const token = getToken()
    const url = 'http://localhost:22222/lawdoc/file_list';
    const config = {
        headers: {
            'Authorization': token
        }
    };

    try {
        const response = await axios.post(url, {
            'keyword': keyword,
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
            'fileName': '',
            'fileUuid': '',
            'status': 0
        }]
    };
};

export default function File() {
    const router = useRouter()
    const [keyword, setKeyWord] = useState('');
    const [newFileName, setNewFileName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [file, setFile] = useState({
        fileName: '',
        fileUuid: '',
    });
    const [data, setData] = useState({
        'count': 0,
        'files': [{
            'fileName': '',
            'fileUuid': '',
            'status': 0
        }]
    });
    async function fetchDataAndSetState() {
        const fetchedData = await getFileNameList(keyword, 1);
        setData(fetchedData);
        setTotalPage(Math.ceil(fetchedData.count / 10));
    }
    useEffect(() => {
        fetchDataAndSetState();
    }, [keyword]);
    useEffect(() => {
        async function fetchDataAndSetState2() {
            const fetchedData = await getFileNameList(keyword, currentPage);
            setData(fetchedData);
        }
        fetchDataAndSetState2();
    }, [currentPage]);

    const token = getToken()
    if (token === null || token === '') {
        router.replace('/user/login');
    }

    function HandleClickModal(event: React.MouseEvent<HTMLElement>, file: {
        fileName: string;
        fileUuid: string;
    }) {
        event.preventDefault();
        setFile(file);
        const myModal = document.getElementById('myModal');
        myModal?.classList.add('is-active');
    }
    function HandleClickClose(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        const myModal = document.getElementById('myModal');
        myModal?.classList.remove('is-active');
    }
    async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        const url = 'http://localhost:22222/lawdoc/update_file_name';
        const config = {
            headers: {
                'Authorization': token
            }
        };
        try {
            const response = await axios.post(url, {
                'file_uuid': file.fileUuid,
                'file_name': newFileName
            }, config);

            if (response.status === 200) {
                const data = response.data;
                if (data.code === 0) {
                    alert('修改成功');
                    const myModal = document.getElementById('myModal');
                    myModal?.classList.remove('is-active');
                    fetchDataAndSetState();
                } else {
                    alert(data.err_msg);
                }
            } else {
                alert('系统错误，请联系管理员');
            }
        } catch (error) {
            console.error('系统错误，请联系管理员：', error);
            alert('系统错误，请联系管理员');
        }
    }
    async function handleDelete(e: React.MouseEvent<HTMLSpanElement>, file: {
        fileName: string;
        fileUuid: string;
    }) {
        e.preventDefault();
        const r = confirm('是否要删除文件：' + file.fileName);
        if (!r)
            return;

        const url = 'http://localhost:22222/lawdoc/delete_file';
        const config = {
            headers: {
                'Authorization': token
            }
        };
        try {
            const response = await axios.post(url, {
                'file_uuid': file.fileUuid
            }, config);

            if (response.status === 200) {
                const data = response.data;
                if (data.code === 0) {
                    alert('删除成功');
                    fetchDataAndSetState();
                } else {
                    alert(data.err_msg);
                }
            } else {
                alert('系统错误，请联系管理员');
            }
        } catch (error) {
            console.error('系统错误，请联系管理员：', error);
            alert('系统错误，请联系管理员');
        }
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {Nav()}
            <main className="rightDiv">
                <div>
                    <nav className="breadcrumb has-succeeds-separator" aria-label="breadcrumbs">
                        <ul>
                            <li>
                                <span className="panel-icon is-small is-left">
                                    <i className="fas fa-angle-double-right" />
                                </span>
                                <Link href="/home">
                                    <p style={{ color: "black" }}>个人主页</p>
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
                <div style={{ width: "80%", margin: "auto" }}>
                    <article className="panel is-info">
                        <p className="panel-heading">文件信息卡片</p>

                        <div className="panel-block">
                            <p className="control has-icons-left">
                                <input className="input is-primary" type="text" placeholder="请输入关键字查询" onChange={(e) => setKeyWord(e.target.value)} />
                                <span className="icon is-left">
                                    <i className="fas fa-search" aria-hidden="true"></i>
                                </span>
                            </p>
                        </div>
                        <p className="panel-block">查询结果显示共有<strong>{data.count}</strong>个文件</p>

                        {
                            data.files.map((file, index) => (
                                <a className="panel-block">
                                    <span className="panel-icon">
                                        <i className="fas fa-book" aria-hidden="true"></i>
                                    </span>
                                    <span className="panel-icon" onClick={(e) => HandleClickModal(e, file)}>
                                        <i className="fas fa-pencil-alt" aria-hidden="true"></i>
                                    </span>
                                    {
                                        file.status === 0 ?
                                            <span className="panel-icon">
                                                <Link href={`/work?uuid=${file.fileUuid}&name=${file.fileName}`}>
                                                    <i className="fas fa-file-signature" aria-hidden="true"></i>
                                                </Link>
                                            </span> :
                                            <></>
                                    }
                                    <span className="panel-icon" onClick={(e) => handleDelete(e, file)}>
                                        <i className="fas fa-trash-alt" aria-hidden="true"></i>
                                    </span>
                                    <Link href={`/show?uuid=${file.fileUuid}`}>
                                        <p style={{ color: "black" }}>
                                            {file.fileName}
                                        </p>
                                    </Link>
                                </a>
                            ))
                        }
                        <div className="panel-block">
                            <Pagination currentPage={currentPage} totalPage={totalPage} callback={setCurrentPage} />
                        </div>

                    </article>
                </div>

                <div className="modal" id="myModal">
                    <div className="modal-background"></div>
                    <div className="modal-content">
                        <div className="box">
                            <label className="label">原文件名：{file.fileName}</label>
                            <p>提示：不需要输入文件后缀名即类型，文件类型无法修改。</p>
                            <label className="label">修改文件名</label>
                            <div style={{ width: "60%", float: "left", marginRight: "5%" }}>
                                <input className="input" type="text" placeholder="请输入新文件名" onChange={(e) => setNewFileName(e.target.value)} />
                            </div>
                            <button className="button is-info" onClick={handleSubmit}>提交修改</button>
                        </div>
                    </div>
                    <button className="modal-close is-large" aria-label="close" onClick={HandleClickClose}></button>
                </div>
            </main>
        </div>
    );
}

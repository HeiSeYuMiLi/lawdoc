'use client'

import "bulma"
import { useRouter, useSearchParams } from 'next/navigation';
import { getToken } from '@/app/session';
import { useEffect, useState } from 'react';
import React from 'react';
import { Nav } from '@/app/nav';
import axios from 'axios';
import Link from "next/link";

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
                    file_content: string
                    entities: JSON
                } = data.data;
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
        'file_content': '',
        'entities': JSON
    };
};

interface MyObject {
    value: string;
    type: string;
    begin: number;
    end: number;
}

export default function Show() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = getToken()
    if (token === null || token === '') {
        router.replace('/user/login');
    }

    const [data, setData] = useState({
        'file_name': '',
        'file_type': '',
        'file_content': '',
        'entities': JSON
    });
    const [entity, setEntity] = useState({
        'value': '',
        'type': '',
        'begin': 0,
        'end': 0
    });
    const [index, setIndex] = useState(0);
    const [eBegin, setBegin] = useState('0');
    const [eEnd, setEnd] = useState('0');
    async function fetchDataAndSetState() {
        const uuid = searchParams.get('uuid');
        if (uuid !== null) {
            const fetchedData = await getFile(uuid);
            setData(fetchedData);
        }
    }
    useEffect(() => {
        fetchDataAndSetState();
    }, []);

    function TextHighlighter({ text, jsons }: { text: string, jsons: any }) {
        const parts = [];
        let lastIndex = 0;
        for (const key in jsons) {
            if (jsons.hasOwnProperty(key)) {
                const item = jsons[key] as MyObject;
                const begin = item.begin;
                const end = item.end;
                if (begin > lastIndex)
                    parts.push(text.slice(lastIndex, begin));

                if (item.type === '人名') {
                    parts.push(<mark key={key} style={{ backgroundColor: "rgba(102,209,255,0.5)" }} onClick={(e) => HandleClickModal(e, item, key)}>{text.slice(begin, end)}</mark>);
                } else if (item.type === '时间') {
                    parts.push(<mark key={key} style={{ backgroundColor: "rgba(186,243,19,0.5)" }} onClick={(e) => HandleClickModal(e, item, key)}>{text.slice(begin, end)}</mark>);
                } else if (item.type === '地名') {
                    parts.push(<mark key={key} style={{ backgroundColor: "rgba(0,209,178,0.5)" }} onClick={(e) => HandleClickModal(e, item, key)}>{text.slice(begin, end)}</mark>);
                } else if (item.type === '毒品') {
                    parts.push(<mark key={key} style={{ backgroundColor: "rgba(255,102,133,0.5)" }} onClick={(e) => HandleClickModal(e, item, key)}>{text.slice(begin, end)}</mark>);
                } else if (item.type === '毒品重量') {
                    parts.push(<mark key={key} style={{ backgroundColor: "rgba(138,4,30,0.5)" }} onClick={(e) => HandleClickModal(e, item, key)}>{text.slice(begin, end)}</mark>);
                }
                lastIndex = end;
            }
        }

        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }

        return <>{parts}</>;
    };

    function UnfoldJson({ jsons }: { jsons: any }) {
        let newJson: any = { 'nh': {}, 'ns': {}, 'nt': {}, 'ndr': {}, 'nw': {} };
        //将实体按类型整合
        for (const key in jsons) {
            if (jsons.hasOwnProperty(key)) {
                const item = jsons[key] as MyObject;
                const value = item.value;
                if (item.type === '人名') {
                    if (!newJson.nh.hasOwnProperty(value))
                        newJson.nh[value] = [];
                    newJson.nh[value].push([item.begin, item.end]);
                } else if (item.type === '时间') {
                    if (!newJson.nt.hasOwnProperty(value))
                        newJson.nt[value] = [];
                    newJson.nt[value].push([item.begin, item.end]);
                } else if (item.type === '地名') {
                    if (!newJson.ns.hasOwnProperty(value))
                        newJson.ns[value] = [];
                    newJson.ns[value].push([item.begin, item.end]);
                } else if (item.type === '毒品') {
                    if (!newJson.ndr.hasOwnProperty(value))
                        newJson.ndr[value] = [];
                    newJson.ndr[value].push([item.begin, item.end]);
                } else if (item.type === '毒品重量') {
                    if (!newJson.nw.hasOwnProperty(value))
                        newJson.nw[value] = [];
                    newJson.nw[value].push([item.begin, item.end]);
                }
            }
        }

        return (
            <>
                <div id="nh" className="myDiv">
                    {
                        Object.entries(newJson.nh).map(([key, pos]: [key: string, pos: any]) => (
                            <p>{key}：
                                {
                                    pos.map((value: any, index: number) => (
                                        <label>[{value[0]},{value[1]}]</label>
                                    ))
                                }
                            </p>
                        ))
                    }
                </div>
                <div id="ns" className="myDiv hidden">
                    {
                        Object.entries(newJson.ns).map(([key, pos]: [key: string, pos: any]) => (
                            <p>{key}：
                                {
                                    pos.map((value: any, index: number) => (
                                        <label>[{value[0]},{value[1]}]</label>
                                    ))
                                }
                            </p>
                        ))
                    }
                </div>
                <div id="nt" className="myDiv hidden">
                    {
                        Object.entries(newJson.nt).map(([key, pos]: [key: string, pos: any]) => (
                            <p>{key}：
                                {
                                    pos.map((value: any, index: number) => (
                                        <label>[{value[0]},{value[1]}]</label>
                                    ))
                                }
                            </p>
                        ))
                    }
                </div>
                <div id="ndr" className="myDiv hidden">
                    {
                        Object.entries(newJson.ndr).map(([key, pos]: [key: string, pos: any]) => (
                            <p>{key}：
                                {
                                    pos.map((value: any, index: number) => (
                                        <label>[{value[0]},{value[1]}]</label>
                                    ))
                                }
                            </p>
                        ))
                    }
                </div>
                <div id="nw" className="myDiv hidden">
                    {
                        Object.entries(newJson.nw).map(([key, pos]: [key: string, pos: any]) => (
                            <p>{key}：
                                {
                                    pos.map((value: any, index: number) => (
                                        <label>[{value[0]},{value[1]}]</label>
                                    ))
                                }
                            </p>
                        ))
                    }
                </div>
            </>
        )
    };

    function HandleClickModal(event: React.MouseEvent<HTMLElement>, item: MyObject, key: string) {
        event.preventDefault();
        const myModal = document.getElementById('myModal');
        setEntity(item);
        setIndex(Number(key));
        setBegin(item.begin.toLocaleString());
        setEnd(item.end.toLocaleString());
        myModal?.classList.add('is-active');
    }
    function HandleClickDelete(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        const myModal = document.getElementById('myModal');
        myModal?.classList.remove('is-active');
    }
    async function HandleClickSubmit(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();

        let b = Number(eBegin);
        let e = Number(eEnd);
        if (isNaN(b) || isNaN(e)) {
            alert('输入非法字符，请输入数字！');
            return;
        }
        if (b === 0)
            b = entity.begin;
        if (e === 0)
            e = entity.end;

        const entity2 = data.file_content.slice(b, e);
        if (entity2 === '') {
            alert('未截取到实体，请输入正确位置！');
            return;
        }

        const url = 'http://localhost:22222/lawdoc/update_entity';
        const config = {
            headers: {
                'Authorization': token
            }
        };
        try {
            const response = await axios.post(url, {
                'file_uuid': searchParams.get('uuid'),
                'index': index,
                'begin': b,
                'end': e,
                'entity': entity2
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
        const beginPos = document.getElementById('beginPos') as HTMLInputElement;
        const endPos = document.getElementById('endPos') as HTMLInputElement;
        beginPos.value = '';
        endPos.value = '';
    }
    async function HandleClickSubmit2(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();

        const url = 'http://localhost:22222/lawdoc/delete_entity';
        const config = {
            headers: {
                'Authorization': token
            }
        };
        try {
            const response = await axios.post(url, {
                'file_uuid': searchParams.get('uuid'),
                'index': index
            }, config);

            if (response.status === 200) {
                const data = response.data;
                if (data.code === 0) {
                    alert('删除成功');
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
    function handleTabToggle(event: React.MouseEvent<HTMLElement>, id: string) {
        const li = document.getElementsByClassName('myLi');
        const div = document.getElementsByClassName('myDiv');
        for (let i = 0; i < li.length; i++)
            li[i].classList.remove('is-active');
        for (let i = 0; i < div.length; i++)
            div[i].classList.add('hidden');
        const li2 = document.getElementById(id + 'Li');
        li2?.classList.add('is-active');
        const div2 = document.getElementById(id);
        div2?.classList.remove('hidden');
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
                                    <strong>展示页面</strong>
                                </p>
                            </a></li>
                        </ul>
                    </nav>
                </div>
                <hr />
                <div style={{ width: "85%", margin: "auto" }}>
                    <div style={{ marginBottom: "5px" }}>
                        <label className="label">文件名：{data.file_name}</label>
                        <article className="message is-dark">
                            <div className="message-header">
                                <p>实体卡片</p>
                            </div>
                            <div className="message-body">
                                <div className="tabs is-centered is-medium">
                                    <ul>
                                        <li id="nhLi" className="myLi is-active" onClick={(e) => handleTabToggle(e, 'nh')}>
                                            <a style={{ textDecoration: "none", color: "rgba(102,209,255,0.5)" }}>人名</a></li>
                                        <li id="nsLi" className="myLi" onClick={(e) => handleTabToggle(e, 'ns')}>
                                            <a style={{ textDecoration: "none", color: "rgba(0,209,178,0.5)" }}>地名</a></li>
                                        <li id="ntLi" className="myLi" onClick={(e) => handleTabToggle(e, 'nt')}>
                                            <a style={{ textDecoration: "none", color: "rgba(186,243,19,0.5)" }}>时间</a></li>
                                        <li id="ndrLi" className="myLi" onClick={(e) => handleTabToggle(e, 'ndr')}>
                                            <a style={{ textDecoration: "none", color: "rgba(255,102,133,0.5)" }}>毒品</a></li>
                                        <li id="nwLi" className="myLi" onClick={(e) => handleTabToggle(e, 'nw')}>
                                            <a style={{ textDecoration: "none", color: "rgba(138,4,30,0.5)" }}>毒品重量</a></li>
                                    </ul>
                                </div>

                                <UnfoldJson jsons={data.entities} />
                            </div>
                        </article>

                    </div>
                    <hr />
                    <div>
                        <div className="content">
                            <TextHighlighter text={data.file_content} jsons={data.entities} />
                        </div>
                    </div>
                </div>

                <div className="modal" id="myModal">
                    <div className="modal-background"></div>
                    <div className="modal-content">
                        <div className="box">
                            <label className="label" style={{ float: "left", marginRight: "25px" }}>
                                实体：
                                <span>{entity.value}</span>
                            </label>
                            <label className="label">
                                类型：
                                <span>{entity.type}</span>
                            </label>
                            <div style={{ clear: "both" }}></div>
                            <label className="label" style={{ width: "40%", float: "left", marginRight: "10%" }}>
                                起始位置：
                                <input id="beginPos" className="input" type="text" placeholder={entity.begin.toLocaleString()} onChange={(e) => setBegin(e.target.value)} />
                            </label>
                            <label className="label" style={{ width: "40%", float: "left" }}>
                                结束位置：
                                <input id="endPos" className="input" type="text" placeholder={entity.end.toLocaleString()} onChange={(e) => setEnd(e.target.value)} />
                            </label>
                            <div style={{ clear: "both" }}></div>
                            <button className="button is-info" style={{ width: "40%", marginRight: "10%" }} onClick={HandleClickSubmit}>提交修改</button>
                            <button className="button is-danger" style={{ width: "40%", marginRight: "10%" }} onClick={HandleClickSubmit2}>删除实体</button>
                        </div>
                    </div>
                    <button className="modal-close is-large" aria-label="close" onClick={HandleClickDelete}></button>
                </div>
            </main>
        </div>

    );
};
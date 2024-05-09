'use client'

import "bulma"
import { useRouter } from 'next/navigation'
import { getToken } from '@/app/session'
import { useEffect, useState } from 'react';
import React from 'react'
import { Nav } from '@/app/nav'
import axios from 'axios';
import Image from 'next/image'
import * as echarts from 'echarts';

const getUserInfo = async () => {
    const token = getToken()
    const url = 'http://localhost:22222/lawdoc/user/info';
    const config = {
        headers: {
            'Authorization': token
        },
    };

    try {
        const response = await axios.post(url, {}, config);

        if (response.status === 200) {
            const data = response.data;
            if (data.code === 0) {
                const userInfo: {
                    name: string,
                    phone: string,
                    sex: number,
                    file_count: number
                } = data.data;
                return userInfo;
            } else {
                alert(data.err_msg);
            }
        } else {
            alert('获取用户信息失败');
        }
    } catch (error) {
        console.error('获取用户信息失败：', error);
        alert('获取用户信息失败');
    }
    return {
        'name': '',
        'sex': 0,
        'phone': '',
        'file_count': 0
    };
};

async function getHeadImg() {
    const token = getToken();

    try {
        const response = await axios.post(
            'http://localhost:22222/lawdoc/head_img', {}, {
            headers: {
                'Authorization': token
            },
            responseType: 'blob'
        });

        if (response.status === 200) {
            let blob = new Blob([response.data], { type: "image/png" });
            let url = window.URL.createObjectURL(blob);
            return url
        }
    } catch (error) {
        console.error('获取用户头像失败：', error);
    }
    return '';
};

type TFileList = {
    id: number,
    file_type: string,
    create_time: string
}[];
const getFileList = async () => {
    const token = getToken()
    const url = 'http://localhost:22222/lawdoc/all_file_list';
    const config = {
        headers: {
            'Authorization': token
        }
    };

    try {
        const response = await axios.post(url, {}, config);

        if (response.status === 200) {
            const data = response.data;
            if (data.code === 0) {
                const fileList: TFileList = data.data.files;
                return fileList;
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
    return [{
        'id': 0,
        'file_type': '',
        'create_time': ''
    }];
};

function countFileByType(type: string, fileList: TFileList) {
    let count = 0;
    fileList.forEach(json => {
        if (json['file_type'] === type)
            ++count;
    });
    return count;
}

function showChart(fileList: TFileList) {
    const counts = [
        countFileByType('pdf', fileList),
        countFileByType('txt', fileList),
        countFileByType('png', fileList),
        countFileByType('jpg', fileList),
        countFileByType('jpeg', fileList),
    ];
    const maxCount = Math.max(...counts) + 1;
    const myChart = echarts.init(document.getElementById('mychart') as HTMLDivElement);
    const option: echarts.EChartOption = {
        legend: {
            data: ['各个类型文件数量']
        },
        radar: {
            indicator: [
                { name: 'pdf', max: maxCount },
                { name: 'txt', max: maxCount },
                { name: 'png', max: maxCount },
                { name: 'jpg', max: maxCount },
                { name: 'jpeg', max: maxCount },
            ]
        },
        series: [
            {
                name: 'Budget vs spending',
                type: 'radar',
                data: [
                    {
                        value: [counts[0], counts[1], counts[2], counts[3], counts[4]],
                        name: 'Allocated Budget',
                        label: {
                            show: true,
                            formatter: function (params: any) {
                                if (params.value === 0) return '';
                                return params.value;
                            }
                        }
                    }
                ]
            }
        ]
    };
    myChart.setOption(option);
}

export default function Home() {
    const router = useRouter()
    const token = getToken();
    if (token === null || token === '') {
        router.replace('/user/login');
    }

    const [sex, setSex] = useState('');
    const [name, setName] = useState('');
    const [passwd, setPasswd] = useState('');
    const [data, setData] = useState({
        'name': '',
        'phone': '',
        'sex': 0,
        'file_count': 0,
    });
    const [count, setCount] = useState(0);
    const [headImgUrl, setHeadImgUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    async function fetchDataAndSetState() {
        const fetchedData = await getUserInfo();
        const fetchedData2 = await getHeadImg();
        setData(fetchedData);
        setSex(fetchedData.sex === 0 ? '男' : '女');
        setHeadImgUrl(fetchedData2);

    }
    useEffect(() => {
        fetchDataAndSetState();
        async function handleShowChart() {
            const fetchedData = await getFileList();
            setCount(fetchedData.length);
            showChart(fetchedData);
        }
        handleShowChart();
    }, []);

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const token = getToken()
        const url = 'http://localhost:22222/lawdoc/user/update';
        const config = {
            headers: {
                'Authorization': token
            }
        };

        try {
            const response = await axios.post(url, {
                'name': name,
                'passwd': passwd,
                'sex': (sex === '女')
            }, config);

            if (response.status === 200) {
                const data = response.data;
                if (data.code === 0) {
                    alert('修改成功')
                    const myModal = document.getElementById('myModal');
                    myModal?.classList.remove('is-active');
                    fetchDataAndSetState();
                } else {
                    alert(data.err_msg);
                }
            } else {
                alert('修改失败');
            }
        } catch (error) {
            console.error('修改失败：', error);
            alert('修改失败');
        }
    };
    const handleImgUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!file) {
            alert('请选择一个文件');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const url = 'http://localhost:22222/lawdoc/upload_head_img';
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': token
            },
        };

        try {
            const response = await axios.post(url, formData, config);

            if (response.status === 200) {
                const data = response.data;
                if (data.code === 0) {
                    alert('文件上传成功');
                    const myModal = document.getElementById('myModal3');
                    myModal?.classList.remove('is-active');
                    fetchDataAndSetState();
                }
                else {
                    alert(data.err_msg)
                }
            } else {
                alert('文件上传失败');
            }
        } catch (error) {
            console.error('上传文件时出错：', error);
            alert('文件上传失败');
        }
    };

    function HandleClickDelete(event: React.MouseEvent<HTMLButtonElement>, id: string) {
        event.preventDefault();
        const myModal = document.getElementById(id);
        myModal?.classList.remove('is-active');
    }
    function HandleClickModal(event: React.MouseEvent<HTMLElement>, id: string) {
        event.preventDefault();
        const myModal = document.getElementById(id);
        myModal?.classList.add('is-active');
    }
    function handleCancel(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        const myModal = document.getElementById('myModal3');
        myModal?.classList.remove('is-active');
        setFile(null);
        const button1 = document.getElementById('disabledButton');
        const button2 = document.getElementById('imgUploadButton');
        button1?.classList.remove('is-hidden');
        button2?.classList.add('is-hidden');
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {Nav()}
            <main className="rightDiv">
                <div>
                    <nav className="breadcrumb has-succeeds-separator" aria-label="breadcrumbs">
                        <ul>
                            <li className="is-active">
                                <span className="panel-icon is-small is-left">
                                    <i className="fas fa-angle-double-right" />
                                </span>
                                <p style={{ color: "black" }}>
                                    <strong>个人主页</strong>
                                </p>
                            </li>
                        </ul>
                    </nav>
                </div>
                <hr />
                <div style={{ width: "80%", margin: "auto" }}>
                    <div style={{ height: "128px", width: "100%" }}>
                        <div style={{ width: "15%", float: "left" }}>
                            <div style={{ width: "128px", height: "128px", backgroundColor: "gray", margin: "auto" }} onClick={(e) => HandleClickModal(e, 'myModal2')}>
                                <img src={headImgUrl} alt="me" width="128px" height="128px" />
                            </div>
                        </div>
                        <div style={{ width: "80%", height: "128px", marginLeft: "5%", float: "left", flexGrow: "1" }}>
                            <p className="is-size-5"><strong>{data.name}</strong></p>
                            <button className="button is-small" style={{ float: "inline-end" }} onClick={(e) => HandleClickModal(e, 'myModal')}>
                                <span className="panel-icon is-small is-left">
                                    <i className="fas fa-pen" />
                                </span>
                                编辑信息
                            </button>
                            <button className="button is-small" style={{ float: "inline-end" }} onClick={(e) => HandleClickModal(e, 'myModal3')}>
                                <span className="panel-icon is-small is-left">
                                    <i className="fas fa-pen" />
                                </span>
                                更换头像
                            </button>
                            <p style={{ color: "grey" }}>{data.phone}</p>
                            <span className="tag is-info">{sex}</span>
                            <hr style={{ margin: "10px 0", width: "100%" }} />
                            <p>{data.file_count} 文件</p>
                        </div>
                        <div style={{ clear: "both" }}></div>
                    </div>
                    <hr />
                    <div style={{ width: "100%" }}>
                        <div style={{ width: "50%", float: "left", border: "1px solid black" }}>
                            <div id="mychart" style={{ width: "400px", height: "400px", margin: "auto" }}></div>
                        </div>
                        <div style={{ width: "50%", padding: "2%", float: "left" }}>
                            <div className="content">
                                <p>
                                    您目前总共提交并识别了<strong>{count}</strong>个文件，
                                </p>
                                <p>
                                    其中今日提交并识别了<strong>X</strong>个。
                                </p>
                            </div>
                        </div>
                        <div style={{ clear: "both" }}></div>
                    </div>
                </div>

                <div className="modal" id="myModal">
                    <div className="modal-background"></div>
                    <div className="modal-content">
                        <div className="box">
                            <div style={{ width: "50%", margin: "0 25%" }}>
                                <label className="label">设置个人信息</label>
                                <div className="field">
                                    <div style={{ width: "64px", height: "64px", backgroundColor: "gray" }}>
                                        <img src={headImgUrl} alt="me" width="64px" height="64px" />
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">昵称</label>
                                    <div className="control">
                                        <p className="control is-expanded has-icons-left">
                                            <input className="input" type="text" placeholder={data.name} onChange={(e) => { setName(e.target.value) }} />
                                            <span className="icon is-small is-left">
                                                <i className="fas fa-user"></i>
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="field">
                                    <fieldset disabled>
                                        <div className="field">
                                            <label className="label">账号</label>
                                            <div className="control">
                                                <p className="control is-expanded has-icons-left">
                                                    <input className="input" type="text" placeholder={data.phone} />
                                                    <span className="icon is-small is-left">
                                                        <i className="fas fa-phone-alt"></i>
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                                <div className="field">
                                    <label className="label">性别</label>
                                    <div className="control">
                                        <div className="select">
                                            <select value={sex} onChange={(e) => { setSex(e.target.value) }}>
                                                <option>男</option>
                                                <option>女</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">密码</label>
                                    <div className="control">
                                        <p className="control is-expanded has-icons-left">
                                            <input className="input" type="password" placeholder="输入新密码" onChange={(e) => { setPasswd(e.target.value) }} />
                                            <span className="icon is-small is-left">
                                                <i className="fas fa-unlock-alt"></i>
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <button className="button is-info" onClick={handleSubmit} style={{ width: "40%" }}>修 改</button>
                            </div>
                        </div>
                    </div>
                    <button className="modal-close is-large" aria-label="close" onClick={(e) => HandleClickDelete(e, 'myModal')}></button>
                </div>

                <div className="modal" id="myModal2">
                    <div className="modal-background"></div>
                    <div className="modal-content">
                        <div className="box">
                            <div style={{ backgroundColor: "gray" }}>
                                <img src={headImgUrl} alt="me" width="600px" height="600px" />
                            </div>
                        </div>
                    </div>
                    <button className="modal-close is-large" aria-label="close" onClick={(e) => HandleClickDelete(e, 'myModal2')}></button>
                </div>

                <div className="modal" id="myModal3">
                    <div className="modal-background"></div>
                    <div className="modal-content">
                        <div className="box">
                            <div style={{ width: "50%", margin: "auto" }}>
                                <label className="label">原头像</label>
                                <div style={{ backgroundColor: "gray", width: "128px", height: "128px", marginBottom: "20px" }}>
                                    <img src={headImgUrl} alt="me" width="128px" height="128px" />
                                </div>
                                <div className="file">
                                    <label className="file-label">
                                        <input className="file-input" type="file" name="resume" onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setFile(e.target.files[0]);
                                                const button1 = document.getElementById('disabledButton');
                                                const button2 = document.getElementById('imgUploadButton');
                                                button1?.classList.add('is-hidden');
                                                button2?.classList.remove('is-hidden');
                                            } else {
                                                setFile(null)
                                            }
                                        }} />
                                        <span className="file-cta">
                                            <span className="file-icon">
                                                <i className="fas fa-upload"></i>
                                            </span>
                                            <span className="file-label"> 选择本地头像 </span>
                                        </span>
                                    </label>
                                </div>
                                <button id="disabledButton" className="button" style={{ width: "40%" }} title="请先选择文件" disabled>提 交</button>
                                <button id="imgUploadButton" className="button is-hidden" style={{ width: "40%" }} onClick={handleImgUpload}>提 交</button>
                                <button className="button" style={{ width: "40%", marginLeft: "20px" }} onClick={handleCancel}>取 消</button>
                            </div>
                        </div>
                    </div>
                    <button className="modal-close is-large" aria-label="close" onClick={(e) => HandleClickDelete(e, 'myModal3')}></button>
                </div>

            </main >
        </div >
    );
}

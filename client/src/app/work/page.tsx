'use client'

import "bulma"
import { useRouter, useSearchParams } from 'next/navigation'
import { getToken } from '@/app/session'
import { Nav } from '@/app/nav'
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from "next/link"

export default function Work() {
    const router = useRouter()
    const searchParams = useSearchParams();
    const [fileName, setFileName] = useState('');
    const [fileName2, setFileName2] = useState('');
    const [fileUuid, setFileUuid] = useState('');
    const [fileType, setFileType] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const token = getToken()
    if (token === null || token === '') {
        router.replace('/user/login');
    }

    useEffect(() => {
        const uuid = searchParams.get('uuid');
        const name = searchParams.get('name');
        if (uuid !== null && name !== null) {
            const form = document.getElementById('uploadForm');
            const div = document.getElementById('nerDiv2');
            form?.classList.add('is-hidden');
            div?.classList.remove('is-hidden');
            setFileName2(name);
            setFileUuid(uuid);
            setFileType(name.split('.')[1]);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            alert('请选择一个文件');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const url = 'http://localhost:22222/lawdoc/upload_file';
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
                    const fileUploadButton = document.getElementById('fileUploadButton');
                    fileUploadButton?.classList.add('is-hidden');
                    const nerDiv = document.getElementById('nerDiv');
                    nerDiv?.classList.remove('is-hidden');
                    setFileUuid(data.data.file_uuid);
                    setFileType(data.data.file_type);
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

    const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        setFile(null);
        setFileName('');
    }

    const handleSubmit2 = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        const url = 'http://localhost:22222/lawdoc/ner';
        const config = {
            headers: {
                'Authorization': token
            },
        }
        const progressDiv = document.getElementById('progressDiv');
        progressDiv?.classList.remove('is-hidden');

        try {
            const response = await axios.post(url, {
                'file_uuid': fileUuid,
                'file_type': fileType
            }, config)

            progressDiv?.classList.add('is-hidden');
            if (response.status === 200) {
                const data = response.data;
                if (data.code === 0) {
                    alert('文件识别成功');
                    const nerButton = document.getElementById('nerButton');
                    nerButton?.classList.add('is-hidden');
                    const resultDiv = document.getElementById('resultDiv');
                    resultDiv?.classList.remove('is-hidden');
                    setFileUuid(fileUuid);
                }
                else {
                    alert(data.err_msg)
                }
            } else {
                alert('文件识别失败');
            }
        } catch (error) {
            console.error('识别实体时出错：', error);
            alert('文件识别失败');
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
                                    <strong>工作页面</strong>
                                </p>
                            </a></li>
                        </ul>
                    </nav>
                </div>
                <hr />
                <div style={{ width: "80%", margin: "auto", borderLeft: "3px solid", borderLeftColor: "rgb(243 244 246)" }}>
                    <div style={{ width: "60%", marginLeft: "10px" }}>
                        <div className="content">
                            <p>
                                在这里，您可以上传文件到您的文件夹中，并且可以选择继续识别。
                            </p>
                            <p>
                                在识别成功后，您可以选择查看结果，这样做您将跳转到展示页面。
                            </p>
                            <p>
                                如果您上传文件后没有选择识别文件，那么您可以在您的文件夹中找到未识别的法律文书，选择识别图标即可进行识别。
                            </p>
                        </div>

                        <form id="uploadForm" encType="multipart/form-data" method="post" onSubmit={handleSubmit}>
                            <label className="label">请选择文件，文件格式包括：pdf，txt，jpg，jpeg，png</label>
                            <div className="file has-name is-fullwidth">
                                <label className="file-label">
                                    <input className="file-input" type="file" name="resume" value={fileName} onChange={(e) => {
                                        setFileName(e.target.value)
                                        if (e.target.files && e.target.files[0]) {
                                            setFile(e.target.files[0]);
                                        } else {
                                            setFile(null)
                                        }
                                    }} />
                                    <span className="file-cta">
                                        <span className="file-icon">
                                            <i className="fas fa-upload"></i>
                                        </span>
                                        <span className="file-label"> 选择文件… </span>
                                    </span>
                                    <span className="file-name"> {fileName} </span>
                                </label>
                            </div>
                            <div id="fileUploadButton">
                                <button className="submit button is-info" style={{ width: "40%" }}>提 交</button>
                                <button className="button" style={{ width: "40%", height: "5.6vh", marginLeft: "10%" }} onClick={handleCancel}>取 消</button>
                            </div>
                        </form>

                        <div id="nerDiv" className="is-hidden">
                            <label className="label">文件上传成功</label>
                            <div id="nerButton">
                                <button className="button button is-info" style={{ width: "40%" }} onClick={handleSubmit2}>识别文件</button>
                            </div>
                        </div>

                        <div id="nerDiv2" className="is-hidden">
                            <label className="label">您选择了文件夹中的文件：{fileName2}</label>
                            <div>
                                <button className="button button is-info" style={{ width: "40%" }} onClick={handleSubmit2}>识别文件</button>
                            </div>
                        </div>

                        <div id="progressDiv" className="is-hidden">
                            <label className="label">正在识别中...</label>
                            <progress className="progress is-primary" max="100">
                                20%
                            </progress>
                        </div>

                        <div id="resultDiv" className="is-hidden">
                            <label className="label">文件识别成功</label>
                            <Link href={`/show?uuid=${fileUuid}`}>
                                <button className="button button is-info" style={{ width: "40%" }}>查看结果</button>
                            </Link>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};
'use client'

import "bulma"
import { useRouter } from 'next/navigation'
import { getToken } from '@/app/session'
import React from 'react'
import { Nav } from '@/app/nav'
import { useState } from 'react';
import axios from 'axios';

export default function Work() {
    const router = useRouter()
    const [fileName, setFileName] = useState('');
    const [fileUuid, setFileUuid] = useState('');
    const [fileType, setFileType] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [cond1, setCond1] = useState(false);
    const [cond2, setCond2] = useState(false);
    const [cond3, setCond3] = useState(false);

    const token = getToken()
    if (token === null || token === '') {
        router.replace('/user/login');
    }

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
                    setCond1(true)
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

        setCond1(false)
        setCond2(false)
        setCond3(false)
    }

    const handleCancel2 = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        const url = 'http://localhost:22222/lawdoc/ner';
        const config = {
            headers: {
                'Authorization': token
            },
        }
        setCond3(true)
        console.log(fileUuid);
        console.log(fileType);

        try {
            const response = await axios.post(url, {
                'file_uuid': fileUuid,
                'file_type': fileType
            }, config)

            setCond3(false)
            if (response.status === 200) {
                const data = response.data;
                if (data.code === 0) {
                    alert('文件识别成功');
                    setCond2(true)
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
        <main className="flex min-h-screen flex-col items-center justify-between ">

            <div className="containers" style={{ width: "80%", height: "100vh" }}>

                {Nav()}

                <div className="box" style={{ width: "100%", height: "100vh" }}>
                    <div style={{ width: "75%", height: "50vh", float: "right" }}>

                        <div className="box">

                            <p>请选择文件，文件格式包括：pdf，doc，txt，jpg，png</p>
                            <form encType="multipart/form-data" method="post" onSubmit={handleSubmit}>
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
                                <button className="submit formButton" style={{ width: "40%" }}>提 交</button>
                                <button className="button" style={{ width: "40%", height: "5.6vh", marginLeft: "10%" }} onClick={handleCancel}>取 消</button>
                            </form>

                        </div>

                        {
                            cond1 ?
                                <div className="box">
                                    <p>文件上传成功</p>
                                    <br />
                                    <button className="button formButton" style={{ width: "40%" }} onClick={handleCancel2}>识别文件</button>
                                </div>
                                :
                                <></>
                        }

                        {
                            cond3 ?
                                <div>
                                    <p>正在识别中...</p>
                                    <progress className="progress is-primary" max="100">
                                        30%
                                    </progress>
                                </div>
                                :
                                <></>
                        }

                        {
                            cond2 ?
                                <div className="box">
                                    <p>文件识别成功</p>
                                    <br />
                                    <button className="button formButton" style={{ width: "40%" }}>查看结果</button>
                                </div>
                                :
                                <></>
                        }

                    </div>
                </div>
            </div>
        </main>
    );
};
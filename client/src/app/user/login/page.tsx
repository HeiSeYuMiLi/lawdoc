'use client'

import "bulma"
import { useEffect, useState } from 'react';
import React from 'react'
import axios from 'axios';
import { setToken } from "@/app/session";
import { useRouter } from 'next/navigation'
import Link from "next/link";

export default function Login() {
  useEffect(() => {
    let method1 = document.getElementById('LoginMethod1')
    let method2 = document.getElementById('LoginMethod2')
    let method1a = document.getElementById('LoginMethod1-a')
    let method2a = document.getElementById('LoginMethod2-a')
    let method1as = document.getElementById('LoginMethod1-a-span')
    let method2as = document.getElementById('LoginMethod2-a-span')
    let method1f = document.getElementById('Method1')
    let method2f = document.getElementById('Method2')

    function change_tab() {
      method1?.classList.toggle('is-active')
      method2?.classList.toggle('is-active')
      method1a?.classList.toggle('trans1')
      method2a?.classList.toggle('trans1')
      method1f?.classList.toggle('is-hidden')
      method2f?.classList.toggle('is-hidden')
      method1as?.classList.toggle('has-text-grey-light')
      method1as?.classList.toggle('has-text-black')
      method2as?.classList.toggle('has-text-grey-light')
      method2as?.classList.toggle('has-text-black')
    }
    function select_method1() {
      if (!method1?.classList.contains('is-active')) {
        change_tab()
      }
    }
    function select_method2() {
      if (!method2?.classList.contains('is-active')) {
        change_tab()
      }
    }

    method1a?.addEventListener('click', select_method1);
    method2a?.addEventListener('click', select_method2);
    return () => {
      method1a?.removeEventListener('click', select_method1);
      method2a?.removeEventListener('click', select_method2);
    };
  }, []);

  const router = useRouter()
  const [phone, setPhone] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!(document.getElementById('checkBox1') as HTMLInputElement).checked) {
      const warn3 = document.getElementById('warn3');
      warn3?.classList.toggle('is-hidden');
      return;
    }
    if (phone === '') {
      alert('请输入手机号');
      return;
    }
    if (captcha === '') {
      alert('请输入验证码');
      return;
    }

    const url = 'http://localhost:22222/lawdoc/signin/captcha';

    try {
      const response = await axios.post(url, {
        'phone': phone,
        'captcha': captcha
      });

      if (response.status === 200) {
        const data = response.data
        if (data.code === 0) {
          setToken(data.data.token);
          router.replace('/home')
        } else {
          alert(data.err_msg)
        }
      } else {
        alert('登陆失败')
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
    }
  };

  const handleSubmit2 = async (event: React.FormEvent) => {
    event.preventDefault();

    const url = 'http://localhost:22222/lawdoc/signin/passwd';

    try {
      const response = await axios.post(url, {
        'phone': account,
        'passwd': password
      });

      if (response.status === 200) {
        const data = response.data
        if (data.code === 0) {
          setToken(data.data.token);
          router.replace('/home')
        } else {
          alert(data.err_msg)
        }
      } else {
        alert('登陆失败')
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
    }
  };

  const getCaptcha = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const url = 'http://localhost:22222/lawdoc/signin/get_captcha';

    try {
      const response = await axios.post(url, { 'account': phone });

      if (response.status === 200) {
        const data = response.data;
        if (data.code === 0) {
          alert(data.data.captcha);
        }
        else {
          alert(data.err_msg)
        }
      } else {
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
    }
  };

  function HandleClickClose(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const myModal = document.getElementById('myModal');
    myModal?.classList.remove('is-active');
  }
  function HandleClickModal(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    const myModal = document.getElementById('myModal');
    myModal?.classList.add('is-active');
  }
  function HandleCheckBox(event: React.MouseEvent<HTMLInputElement>) {
    const warn3 = document.getElementById('warn3');
    if ((document.getElementById('checkBox1') as HTMLInputElement).checked)
      warn3?.classList.add('is-hidden');
    else
      warn3?.classList.remove('is-hidden');
  }

  return (
    <main className="p-36" style={{ height: "100vh", backgroundImage: 'url("https://images.pexels.com/photos/613508/pexels-photo-613508.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")', backgroundSize: "cover" }}>
      <div className="ml-auto" style={{ width: "35%" }}>
        <div className="box trans1">

          <div className="field mb-5">
            <div className="tabs is-boxed is-medium">
              <ul>
                <li id="LoginMethod1" className="is-active" style={{ width: "50%" }}>
                  <a id="LoginMethod1-a" className="trans1">
                    <span id="LoginMethod1-a-span" className="has-text-black">手机快捷登录</span>
                  </a>
                </li>
                <li id="LoginMethod2" style={{ width: "50%" }}>
                  <a id="LoginMethod2-a">
                    <span id="LoginMethod2-a-span" className="has-text-grey-light">账号密码登录</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* 手机快捷登录 */}
          <form onSubmit={handleSubmit}>
            <div id="Method1">
              <div className="field mb-5">
                <label className="label">手机号</label>
                <div className="field has-addons">
                  <div className="control">
                    <span className="select">
                      <select style={{ backgroundColor: "rgba(255,255,255,0.8)" }}>
                        <option>+86</option>
                        <option>+56</option>
                        <option>+19</option>
                      </select>
                    </span>
                  </div>
                  <div className="control is-expanded">
                    <input className="input trans1" type="tel" placeholder="请输入手机号" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="field mb-5">
                <label className="label">验证码</label>
                <div className="field has-addons">
                  <div className="control is-expanded">
                    <input className="input trans1" type="text" placeholder="请输入手机验证码" value={captcha} onChange={(e) => setCaptcha(e.target.value)} />
                  </div>
                  <div className="control">
                    <button className="button" onClick={getCaptcha} style={{ backgroundColor: "rgba(255,255,255,0.8)" }}>
                      获取验证码
                    </button>
                  </div>
                </div>
              </div>
              <div className="field mb-5">
                <p>
                  <input id="checkBox1" type="checkbox" style={{ margin: "revert" }} onClick={HandleCheckBox} />
                  未注册的手机号将自动注册。勾选代表您同意并接受<a onClick={HandleClickModal}>服务协议</a>与<a onClick={HandleClickModal}>隐私政策</a>
                </p>
                <p id="warn3" className="has-text-danger is-hidden">请勾选</p>
              </div>
              <button className="submit is-primary formButton">登 录</button>
            </div>
          </form>

          {/* 账号密码登录 */}
          <form onSubmit={handleSubmit2}>
            <div id="Method2" className="is-hidden">
              <div className="field mb-5">
                <label className="label">账 号</label>
                <div className="field">
                  <input className="input trans1" type="text" value={account} placeholder="请输入手机号" onChange={(e) => setAccount(e.target.value)} />
                </div>
              </div>
              <div className="field mb-5">
                <label className="label">密 码</label>
                <div className="field has-addons">
                  <div className="control is-expanded">
                    <input className="input trans1" type="password" placeholder="请输入密码" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <div className="control">
                    <button className="button"
                      style={{ backgroundColor: "rgba(255,255,255,0.8)" }}>
                      <Link href='/user/recover_passwd'>
                        <center style={{ color: 'black' }}>忘记密码？</center>
                      </Link>
                    </button>
                  </div>
                </div>
              </div>
              <button className="submit is-primary formButton">登 录</button>
              <Link href='/user/signup'>
                <center style={{ color: 'black' }}>没有账号？立即注册</center>
              </Link>
              <Link href='/admin/login'>
                <center style={{ color: 'black' }}>管理员登录入口</center>
              </Link>
            </div>
          </form>

          <div className="modal" id="myModal">
            <div className="modal-background"></div>
            <div className="modal-content">
              <div className="box" style={{ borderRadius: "unset" }}>
                <div className="content">
                  <h1>Law Ner 平台用户服务协议</h1>
                  <p>
                    Law Ner 平台（以下统称“本产品”）是由******公司（下称“本公司”或“我们”）所有和负责运营，本协议双方为本公司与本产品注册用户（下称“用户”或“您”）签定的具有合同效力的文件。
                  </p>
                  <p>
                    <strong>
                      请您在注册成为本产品用户前务必仔细阅读本协议内容，若您不同意本协议的任何内容，或者无法准确理解本公司对条款的解释，请不要进行后续操作；若您注册成为本产品用户，则表示您对本协议的全部内容已充分阅读并认可和同意遵守。
                    </strong>
                    同时，承诺遵守中国法律、法规、规章及其他政府规范性文件规定，如有违反而造成任何法律后果，您将以本人名义独立承担所有相应的法律责任。
                  </p>
                  <p>
                    <strong>
                      如您未满18周岁，请在监护人陪同下仔细阅读并充分理解本协议，并征得监护人的同意后使用本产品及相关服务。
                    </strong>
                  </p>
                  <p>
                    <strong>
                      本公司有权根据需要不定时地制定、修改本协议或各类规则，经修订的协议、规则一经公布，立即自动生效。
                    </strong>
                    对新协议、规则生效之后注册的用户发生法律效力，对于协议、规则生效之前注册的用户，若用户在新规则生效后继续使用本产品提供的各项服务，则表明用户已充分阅读并认可和同意遵守新的协议或规则。若用户拒绝接受新的协议和规则，用户有权放弃或终止继续使用本产品提供的各项服务，但该用户应承担在本产品已经进行的交易下所应承担的任何法律责任，且应遵循该用户发生交易时有效的协议或规则内容。
                  </p>
                  <br />
                  <p>
                    发布日期：2024年4月23日
                  </p>
                  <p>
                    生效日期：2024年4月23日
                  </p>
                </div>
              </div>
            </div>
            <button className="modal-close is-large" aria-label="close" onClick={HandleClickClose}></button>
          </div>

        </div>
      </div>
    </main>
  );
}
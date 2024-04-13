'use client'

import "bulma"
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react'
import axios from 'axios';
import { setToken } from "@/app/session";
import { useRouter } from 'next/navigation'

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

    const url = 'http://localhost:22222/lawdoc/signin/captcha';

    try {
      const response = await axios.post(url, {
        'phone': phone,
        'captcha': captcha
      });

      if (response.status === 200) {
        const data = response.data
        if (data.code === 0) {
          console.log(data);
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
        'account': account,
        'passwd': password
      });

      if (response.status === 200) {
        console.log(response.data);
        setToken(response.data.data.token);
        router.replace('/home')
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

  const signup = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.replace('/user/signup');
  };

  const recoverPasswd = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.replace('/user/recover_passwd');
  };

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
                  <input type="checkbox" style={{ margin: "revert" }} />
                  未注册的手机号将自动注册。勾选代表您同意并接受<a href="#">服务协议</a>与<a href="#">隐私政策</a>
                </p>
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
                    <button className="button" onClick={recoverPasswd}
                      style={{ backgroundColor: "rgba(255,255,255,0.8)" }}>
                      忘记密码？
                    </button>
                  </div>
                </div>
              </div>
              <button className="submit is-primary formButton">登 录</button>
              <button className="button is-primary" onClick={signup}
                style={{ width: "100%", backgroundColor: "rgba(0,0,0,0)" }}>没有账号？立即注册</button>
            </div>
          </form>

        </div>
      </div>
    </main>
  );
}
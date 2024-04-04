'use client'

import "bulma"
import { useEffect } from 'react';

export default function Login() {
  useEffect(() => {
    let method1 = document.getElementById('LoginMethod1')
    let method2 = document.getElementById('LoginMethod2')
    let method1a = document.getElementById('LoginMethod1-a')
    let method2a = document.getElementById('LoginMethod2-a')
    let method1as = document.getElementById('LoginMethod1-a-span')
    let method2as = document.getElementById('LoginMethod2-a-span')

    function change_tab() {
      method1?.classList.toggle('is-active')
      method2?.classList.toggle('is-active')
      method1a?.classList.toggle('trans1')
      method2a?.classList.toggle('trans1')
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



  return (
    <main className="p-36" style={{ height: "100vh", backgroundImage: 'url("https://images.pexels.com/photos/613508/pexels-photo-613508.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")', backgroundSize: "cover" }}>
      <div className="ml-auto" style={{ width: "35%" }}>
        <form className="box trans1">
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
                <input className="input trans1" type="tel" placeholder="请输入手机号" />
              </div>
            </div>
          </div>
          <div className="field mb-5">
            <label className="label">验证码</label>
            <div className="field has-addons">
              <div className="control is-expanded">
                <input className="input trans1" type="text" placeholder="请输入手机验证码" />
              </div>
              <div className="control">
                <button className="button" style={{ backgroundColor: "rgba(255,255,255,0.8)" }}>
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
          <button className="button is-primary" style={{ width: "100%", backgroundColor: "rgba(0,209,178,0.8)" }}>登录</button>
        </form>
      </div>
    </main>
  );
}
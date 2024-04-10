'use client'

import { useState } from 'react';
import React from 'react'
import axios from 'axios';

function LoginForm() {
  const [phone, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const config = {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    };
    // 这里是你的后端登录接口
    const url = 'http://localhost:22222/lawdoc/signin/mail';

    try {
      const response = await axios.post(url, {
        phone,
        password
      });

      // 处理响应
      if (response.status === 200) {
        // 登录成功，你可以在这里进行一些操作，比如跳转到主页
        console.log(response.data);
      } else {
        // 登录失败，你可以在这里显示错误信息
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        用户名:
        <input type="text" value={phone} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <label>
        密码:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <input type="submit" value="登录" />
    </form>
  );
}

export default LoginForm;
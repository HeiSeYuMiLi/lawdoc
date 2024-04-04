'use client'

import React, { useEffect } from 'react';

export default function MyComponent() {
  // 使用useEffect确保代码在客户端执行
  useEffect(() => {
    // 获取元素并添加事件监听器
    const element = document.getElementById('my-button');
    const handleClick = () => {
      console.log('按钮被点击了！');
    };
    element?.addEventListener('click', handleClick);

    // 组件卸载时移除事件监听器
    return () => {
      element?.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div>
      <button id="my-button">点击我</button>
    </div>
  );
}
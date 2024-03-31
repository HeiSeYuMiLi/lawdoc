import "bulma"

export default function Page() {
    return (
        <main className="p-36" style={{height:"100vh",backgroundImage:'url("https://images.pexels.com/photos/613508/pexels-photo-613508.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")',backgroundSize:"cover"}}>
            <div className="ml-auto" style={{ width: "35%" }}>
                <form className="box" style={{ backgroundColor: "rgba(255,255,255,0.5)" }}>
                    <div className="field mb-5">
                        <div className="tabs is-boxed is-medium">
                            <ul>
                                <li className="is-active" style={{ width: "50%" }}>
                                    <a style={{ backgroundColor: "rgba(255,255,255,0.5)" }}>
                                        <span className="has-text-black">手机快捷登录</span>
                                    </a>
                                </li>
                                <li style={{ width: "50%" }}>
                                    <a>
                                        <span className="has-text-grey-light">账号密码登录</span>
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
                                <input className="input" type="tel" placeholder="请输入手机号" style={{ backgroundColor: "rgba(255,255,255,0.5)" }} />
                            </div>
                        </div>
                    </div>
                    <div className="field mb-5">
                        <label className="label">验证码</label>
                        <div className="field has-addons">
                            <div className="control is-expanded">
                                <input className="input" type="text" placeholder="请输入手机验证码" style={{ backgroundColor: "rgba(255,255,255,0.5)" }} />
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
                    <button className="button is-primary" style={{ width: "100%",backgroundColor: "rgba(0,209,178,0.8)" }}>登录</button>
                </form>
            </div>
        </main>
    );
}
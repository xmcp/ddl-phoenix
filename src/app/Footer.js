import React from 'react';
import {useSelector} from 'react-redux';

import {SISTER_API_VER} from '../state/sister';

import './Footer.less';

export function Footer(props) {
    const backend_info=useSelector((state)=>state.backend ? state.backend.version : null);

    return (
        <div className="footer center">
            <p>Project Fire Bird! by @xmcp</p>
            <p>
                强行安利 <a href="https://bgm.tv" target="_blank" rel="noopener noreferrer">番組計画</a> /
                美术协力 <a href="https://zh.moegirl.org/%E6%A8%B1%E5%B7%9D%E6%83%A0" target="_blank" rel="noopener noreferrer">Meguchi</a>
            </p>
            <p>
                基于&nbsp;
                <a href="https://www.gnu.org/licenses/gpl-3.0.zh-cn.html" target="_blank">GPLv3</a>
                &nbsp;协议在 <a href="https://github.com/pkuhelper-web/phoenix" target="_blank">GitHub</a> 开源
            </p>
            <p>Phoenix {process.env.REACT_APP_BUILD_INFO||'---'},  Bee {backend_info||'---'}, Sister {SISTER_API_VER}</p>
        </div>
    );
}

export function WithFooter(props) {
    return (
        <div className="with-footer-container">
            {props.children}
            <Footer />
        </div>
    )
}
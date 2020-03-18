import {message} from 'antd';

import {get_json} from '../infrastructure/functions';

// without trailing slash
//const SISTER_ROOT='https://pkuhelper.pku.edu.cn/ddl/backend';
const SISTER_ROOT='http://192.168.0.193:5000';
export const SISTER_API_VER='3d';
export const SISTER_DATA_VER='3d';

function token_param(start_symbol,token) {
    return token ? (start_symbol+'user_token='+encodeURIComponent(token)) : '';
}

export function sister_fetch(endpoint,data,token) {
    let url=SISTER_ROOT+endpoint+'?sister_ver='+encodeURIComponent(SISTER_API_VER)+token_param('&',token);
    if(data===undefined)
        return fetch(url);
    else
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
}

function make_nonce() {
    return (+new Date())+'-'+Math.floor(Math.random()*1000);
}

let refresh_nonce=make_nonce();

export function sister_call(endpoint,data=undefined,completed_callback=undefined) {
    return (dispatch,getState)=>{
        let state=getState();
        if(state.local.loading.status==='updating') return Promise.resolve();

        dispatch({
            type: 'start_loading',
            is_post: (data!==undefined),
        });

        let cur_nonce=make_nonce();
        refresh_nonce=cur_nonce;

        return sister_fetch(endpoint,data,state.local.token)
            .then(get_json)
            .catch((e)=>{
                message.error('加载失败：'+e,2);
                return {error: 'PHOENIX_NETWORK_FAILURE'};
            })
            .then((json)=>{
                // current refresh is replaced by a later one
                if(refresh_nonce!==cur_nonce)
                    return false;

                let cmd={};
                if(completed_callback)
                    cmd=completed_callback()||{};
                if(json.error==='PHOENIX_NETWORK_FAILURE') {
                    dispatch({
                        type: 'network_failure',
                    });
                    return false;
                }
                else {
                    dispatch({
                        type: 'refresh_received',
                        sister: json,
                        ...cmd,
                    });
                    return json.action_success;
                }
            });
    }
}
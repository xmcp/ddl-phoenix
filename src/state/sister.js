import {message} from 'antd';

import {get_json} from '../infrastructure/functions';

const SISTER_ROOT='http://192.168.0.193:5000';
export const SISTER_API_VER='1';

function token_param(start_symbol,token) {
    return token ? (start_symbol+'user_token='+encodeURIComponent(token)) : '';
}

export function sister_call(endpoint,data=undefined,completed_callback=undefined) {
    return (dispatch,getState)=>{
        let token=getState().local.token;
        let url=SISTER_ROOT+endpoint+'?sister_ver='+encodeURIComponent(SISTER_API_VER)+token_param('&',token);

        let fetch_req;
        if(data===undefined)
            fetch_req=fetch(url);
        else
            fetch_req=fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

        dispatch({
            type: 'start_loading',
        });

        return fetch_req
            .then(get_json)
            .then((json)=>{
                dispatch({
                    type: 'refresh_received',
                    sister: json,
                });
                if(completed_callback)
                    completed_callback();
                return json.action_success;
            })
            .catch((e)=>{
                message.error('加载失败：'+e);
                dispatch({
                    type: 'network_failure',
                });
                if(completed_callback)
                    completed_callback();
                return false; // not success
            });
    }
}
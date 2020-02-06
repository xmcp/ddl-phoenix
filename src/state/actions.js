import {message} from 'antd';

import {sister_call} from './sister';

export function get_token() {
    return {
        type: 'update_token',
        token: localStorage['TOKEN'],
    };
}

export function show_modal(type,scope,itemid,args) {
    return {
        type: 'show_modal',
        modal_type: type,
        modal_scope: scope,
        modal_itemid: itemid,
        modal_args: args||null,
    };
}

export function close_modal() {
    return {
        type: 'close_modal',
    };
}

export function do_refresh() {
    return sister_call('/refresh',undefined,()=>{
        return {
            manual_refresh: true,
        };
    });
}

export function do_register(regcode) {
    return sister_call('/profile/register', {
        regcode: regcode,
    });
}

export function do_splash_callback(splash_index,data) {
    return sister_call('/profile/splash_callback', {
        splash_index: splash_index,
        handin: data,
    })
}

export function do_interact(type,scope,data) {
    const hide=message.loading('正在更新……',5);
    return sister_call('/'+type+'/'+scope,data,()=>{
        hide();
        if(type==='delete')
            return {hide_modal: true};
    });
}

export function do_update_completeness(tid,completeness) {
    return sister_call('/update/complete', {
        id: tid,
        completeness: completeness,
    });
}

export function do_reset_splash_index() {
    return sister_call('/profile/reset_splash_index',{});
}

export function do_update_settings(settings) {
    return sister_call('/profile/update_settings', {
        settings: settings
    })
}

export function main_list_sorting(sorting) {
    return {
        type: 'set_main_list_sorting',
        sorting: sorting,
    }
}
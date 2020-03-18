import {message} from 'antd';

import {sister_call, SISTER_DATA_VER} from './sister';
import {load} from '../logic/offline_cache';

export function init_token() {
    let token=localStorage['TOKEN'];
    return {
        type: 'update_token',
        token: token,
        init_sister: load(SISTER_DATA_VER,token),
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

export function show_modal_for_last_task(type,itemid,args) {
    return {
        type: 'show_modal_for_last_task',
        modal_type: type,
        parent_id: itemid,
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
        if(type==='update' && scope==='desc_idx')
            return {keep_search_term: true};
    });
}

export function do_update_completeness(tids,completeness) {
    return sister_call('/update/complete', {
        ids: tids,
        completeness: completeness,
    });
}

export function do_reset_splash_index() {
    return sister_call('/profile/reset_splash_index',{});
}

export function do_update_settings(settings) {
    return sister_call('/profile/update_settings', {
        settings: settings
    });
}

export function main_list_sorting(sorting) {
    return {
        type: 'set_main_list_sorting',
        sorting: sorting,
    };
}

export function set_fancy_search(mod_type,arg) {
    return {
        type: 'set_fancy_search',
        mod_type: mod_type,
        arg: arg,
    };
}

export function set_is_slim(s) {
    return {
        type: 'set_is_slim',
        is_slim: s,
    };
}

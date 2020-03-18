import {message} from 'antd';

import {shallowEqual} from 'react-redux';
import {save} from '../logic/offline_cache';

const EMPTY_MODAL={
    visible: false,
    type: null,
    scope: null,
    itemid: null,
    args: null,
};

const INIT_STATE={
    local: {
        token: null,
        modal: EMPTY_MODAL,
        is_slim: true,
        loading: {
            status: 'done',
            last_update_time: null, // as Date type
        },
        main_list_sorting: false,
        refresh_key: (+new Date()),
        fancy_search_term: null,
    },
    error: 'PHOENIX_NO_DATA',
};

function process_flash_msg(action) {
    if(action.sister && action.sister.backend)
        action.sister.backend.flash_msgs.forEach(([category,text])=>{
            console.log('flash msg',category,text);
            let duration=(
                text.length<=20 ? 2 : (
                    category==='error' ? 10 : 5
                )
            );
            let fn={
                message: message.info,
                error: message.error,
                warning: message.warning,
                success: message.success,
            }[category]||message.info;
            fn(text,duration);
        });
}

function loading_status(status,last_update_time=undefined) {
    return {
        status: status,
        last_update_time: last_update_time===undefined ? new Date() : last_update_time,
    };
}
function process_bee_loading_status(state,action) {
    return action.sister.error ? loading_status('error',state.local.loading.last_update_time) : loading_status('done');
}

// to reduce re-renders between refresh
function shallow_merge(obj_in,baseline,merge_keys,merge_id) {
    let obj=Object.assign({},obj_in);
    merge_keys.forEach((merge_key)=>{
        if(!obj[merge_key] || !baseline[merge_key]) return;
        let store={};

        Object.values(baseline[merge_key]).forEach((item)=>{
            store[item[merge_id]]=item;
        });
        Object.keys(obj[merge_key]).forEach((key)=>{
            let item=obj[merge_key][key];
            let baseline_item=store[item[merge_id]];
            if(shallowEqual(item,baseline_item))
                obj[merge_key][key]=baseline_item;
        });
    });
    return obj;
}

function reduce_fancy_search(oldt,typ,arg) {
    oldt=oldt||'';
    if(typ==='set') return arg;
    else if(typ==='backspace') return oldt.substr(0,oldt.length-1);
    else if(typ==='append') return oldt+arg;
    else return oldt;
}

export function reduce(state=INIT_STATE,action) {
    process_flash_msg(action);

    switch(action.type) {
        case 'start_loading':
            return {
                ...state,
                local: {
                    ...state.local,
                    loading: loading_status(action.is_post ? 'updating' : 'loading',state.local.loading.last_update_time),
                }
            };

        case 'refresh_received':
            if(action.sister.backend && action.sister.backend.cache_data_ver && state.local.token)
                save(action.sister.backend.cache_data_ver,state.local.token,action.sister);
            return {
                ...shallow_merge(action.sister,state,['zone','project','task'],'id'),
                local: {
                    ...state.local,
                    loading: process_bee_loading_status(state,action),
                    modal: action.hide_modal ? EMPTY_MODAL : state.local.modal,
                    refresh_key: action.manual_refresh ? (+new Date()) : state.local.refresh_key,
                    fancy_search_term: action.keep_search_term ? state.local.fancy_search_term : null,
                },
            };

        case 'network_failure':
            if(state.error==='PHOENIX_NO_DATA')
                return {
                    ...state,
                    local: {
                        ...state.local,
                        loading: loading_status('error',state.local.loading.last_update_time),
                    },
                    error: 'PHOENIX_NO_NETWORK',
                };
            else
                return {
                    ...state,
                    local: {
                        ...state.local,
                        loading: loading_status('error',state.local.loading.last_update_time),
                    },
                };

        case 'update_token':
            return {
                local: {
                    ...state.local,
                    token: action.token,
                    loading: loading_status('done',null),
                },
                error: action.init_sister ? null : (action.token ? 'PHOENIX_NO_DATA' : 'PHOENIX_NO_TOKEN'),
                ...(action.init_sister||{}),
            };

        case 'show_modal':
            return {
                ...state,
                local: {
                    ...state.local,
                    modal: {
                        visible: true,
                        type: action.modal_type,
                        scope: action.modal_scope,
                        itemid: action.modal_itemid,
                        args: action.modal_args,
                    },
                },
            };

        case 'show_modal_for_last_task':
            let tasks=!state.project ? null : !state.project[action.parent_id] ? null : state.project[action.parent_id].task_order;
            if(tasks && tasks.length)
                return {
                    ...state,
                    local: {
                        ...state.local,
                        modal: {
                            visible: true,
                            type: action.modal_type,
                            scope: 'task',
                            itemid: tasks[tasks.length-1],
                            args: action.modal_args,
                        },
                    },
                };
            else
                return {
                    ...state,
                    local: {
                        ...state.local,
                        modal: {
                            ...state.local.modal,
                            visible: false,
                        },
                    },
                };

        case 'close_modal':
            return {
                ...state,
                local: {
                    ...state.local,
                    modal: {
                        ...state.local.modal,
                        visible: false,
                    },
                },
            };

        case 'set_main_list_sorting':
            return {
                ...state,
                local: {
                    ...state.local,
                    main_list_sorting: action.sorting,
                }
            };

        case 'set_fancy_search':
            return {
                ...state,
                local: {
                    ...state.local,
                    fancy_search_term: reduce_fancy_search(state.local.fancy_search_term,action.mod_type,action.arg),
                },
            };

        case 'set_is_slim':
            if(action.is_slim===state.local.is_slim)
                return state;
            return {
                ...state,
                local: {
                    ...state.local,
                    is_slim: action.is_slim,
                }
            };

        default:
            return state;
    }
}

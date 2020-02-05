import {message} from 'antd';

import {shallowEqual} from 'react-redux';

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
        loading: {
            status: 'done',
            last_update_time: null, // as Date type
        },
        main_list_sorting: false,
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

export function reduce(state=INIT_STATE,action) {
    process_flash_msg(action);

    switch(action.type) {
        case 'start_loading':
            return {
                ...state,
                local: {
                    ...state.local,
                    loading: loading_status('loading',state.local.loading.last_update_time),
                }
            };

        case 'refresh_received':
            return {
                ...shallow_merge(action.sister,state,['zone','project','task'],'id'),
                local: {
                    ...state.local,
                    loading: process_bee_loading_status(state,action),
                    modal: action.hide_modal ? EMPTY_MODAL : state.local.modal,
                },
            };

        case 'network_failure':
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
                error: action.token ? 'PHOENIX_NO_DATA' : 'PHOENIX_NO_TOKEN',
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

        default:
            return state;
    }
}

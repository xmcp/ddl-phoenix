import {message} from 'antd';

const INIT_STATE={
    local: {
        token: null,
        modal: {
            visible: false,
            type: null,
            scope: null,
            itemid: null,
        },
        loading: {
            status: 'done',
            last_update_time: null, // as Date type
        },
    },
    error: 'PHOENIX_NO_DATA',
};

function process_flash_msg(action) {
    if(action.sister && action.sister.backend)
        action.sister.backend.flash_msgs.forEach(([category,text])=>{
            console.log('flash msg',category,text);
            let fn={
                message: message.info,
                error: message.error,
                warning: message.warning,
                success: message.success,
            }[category]||message.info;
            fn(text);
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
                ...action.sister,
                local: {
                    ...state.local,
                    loading: process_bee_loading_status(state,action),
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

        default:
            return state;
    }
}

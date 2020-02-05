import React, {useMemo, useRef} from 'react';
import {ReactSortable} from 'react-sortablejs';
import PropTypes from 'prop-types';
import {useDispatch} from 'react-redux';
import {main_list_sorting, show_modal} from '../state/actions';

export function MainListSortable(props) {
    const dispatch=useDispatch();
    const obj_from_ids=useMemo(()=>(
        props.subs.map((id)=>({id: id}))
    ),[props.subs]);
    const ref_list_cur=useRef(null);

    function list_same(a,b) {
        if(a.length===b.length) {
            for(let i=0;i<a.length;i++)
                if(a[i].id!==b[i].id)
                    return false;
            return true;
        } else
            return false;
    }

    function onstart() {
        dispatch(main_list_sorting(true));
        ref_list_cur.current=null;
    }

    function onsetlist(li) {
        ref_list_cur.current=li;
    }

    function onend(e,items) {
        dispatch(main_list_sorting(false));
        if(ref_list_cur.current && ref_list_cur.current.length && !list_same(ref_list_cur.current,obj_from_ids))
            dispatch(show_modal('reorder',props.scope,props.id,ref_list_cur.current.map(({id})=>id)));
    }

    return (
        <ReactSortable
            list={obj_from_ids} setList={onsetlist}
            onStart={onstart}
            onEnd={onend}
            handle={'.reorder-handle-'+props.scope}
            ghostClass={'reorder-ghost-'+props.scope}
            dragClass="hidden-for-drag"
            animation={150}
            delay={120}
            delayOnTouchOnly={true}
            {...(props.underlying||{})}
        >
            {props.children}
        </ReactSortable>
    )
}
MainListSortable.propTypes={
    scope: PropTypes.oneOf(['zone','project','task']),
    id: PropTypes.number,
    subs: PropTypes.arrayOf(PropTypes.number),
    children: PropTypes.node.isRequired,
    underlying: PropTypes.object,
};
import React, {useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import ResizeObserverPolyfill from 'resize-observer-polyfill';

export function PosFixer(props) {
    const elem=useRef(null);

    const state=useRef({scroll_pos: 0, elem_height: 0, scroll_timeout_id: null});

    useEffect(()=>{
        console.log('posfixer setup',elem.current);

        state.current.scroll_pos=window.scrollY;
        state.current.elem_height=elem.current.getBoundingClientRect().height;

        function on_scroll() {
            if(state.current.scroll_timeout_id!==null)
                clearTimeout(state.current.scroll_timeout_id);

            state.current.scroll_timeout_id=setTimeout(()=>{
                state.current.scroll_pos=window.scrollY;

                //console.log('scroll',state.current.scroll_pos);
            },100);
        }
        function on_resize() {
            let cur_rect=elem.current.getBoundingClientRect();
            let delta=cur_rect.height-state.current.elem_height;
            state.current.elem_height=cur_rect.height;

            console.log('posfixer on resize',state.current.elem_height);

            if(Math.abs(delta)>=1 && state.current.scroll_pos>=1) {
                window.scrollTo(0,state.current.scroll_pos+delta);
            }
        }

        window.addEventListener('scroll',on_scroll,{passive: true});
        let obs=new (window.ResizeObserver||ResizeObserverPolyfill)(on_resize);
        obs.observe(elem.current);

        return ()=>{
            window.removeEventListener('scroll',on_scroll,{passive: true});
            obs.disconnect();
        }
    },[]);
    return (
        <div ref={elem}>
            {props.children}
        </div>
    );
}
PosFixer.propTypes={
    children: PropTypes.node.isRequired,
};
import React, {useRef} from 'react';
import PropTypes from 'prop-types';

const SWIPE_THRESHOLD_PX_SQ=50*50;
const SWIPE_THRESHOLD_TAN=.4;

export function SwipeHandler(props) {
    const state=useRef({possible: false, start_x: 0, start_y: 0});

    function on_touch_start(e) {
        if(e.touches.length===1) { // first touch
            let t=e.touches[0];
            state.current.possible=(!e.target.closest('.js-can-scrollx'));
            state.current.start_x=t.screenX;
            state.current.start_y=t.screenY;
        } else {
            state.current.possible=false;
        }
    }

    function on_touch_move(e) {
        if(!state.current.possible)
            return;

        if(e.touches.length===1) {
            let t=e.touches[0];
            let dx=t.screenX-state.current.start_x;
            let dy=t.screenY-state.current.start_y;

            if(dx*dx+dy*dy>=SWIPE_THRESHOLD_PX_SQ) {
                let tan=Math.abs(dy/dx);
                if(tan<=SWIPE_THRESHOLD_TAN) { // fire
                    if(props.onSwipe)
                        props.onSwipe(dx>0 ? 1 : -1);
                }
                // anyway we should fail through this touch
                state.current.possible=false;
            }
        }
    }

    return (
        <div onTouchStart={on_touch_start} onTouchMove={on_touch_move}>
            {props.children}
        </div>
    )
}
SwipeHandler.propTypes={
    onSwipe: PropTypes.func,
    children: PropTypes.node,
};
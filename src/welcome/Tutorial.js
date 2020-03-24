import React, {useEffect, useState, useRef} from 'react';
import {useDispatch} from 'react-redux';
import {Button, Carousel} from 'antd';

import {do_splash_callback} from '../state/actions';

import {RightOutlined} from '@ant-design/icons';
import './Tutorial.less';
import tutorial_large_bg from './tutorial_media/large_bg.png';
import tutorial_large_fg from './tutorial_media/large_fg.png';
import tutorial_slim_1 from './tutorial_media/slim_1.png';
import tutorial_slim_2 from './tutorial_media/slim_2.png';
import tutorial_slim_3 from './tutorial_media/slim_3.png';

const TUTORIAL_LARGE_BP=[900,670];

function TutorialLarge(props) {
    const dispatch=useDispatch();

    function go_next() {
        dispatch(do_splash_callback(props.index,{}));
    }

    return (
        <div>
            <div className="tutorial-large-bg" style={{backgroundImage: 'url("'+encodeURI(tutorial_large_bg)+'")'}} />
            <div className="tutorial-large-fg" style={{backgroundImage: 'url("'+encodeURI(tutorial_large_fg)+'")'}} />
            <div className="tutorial-container width-container" onClick={go_next}>
                <div className="tutorial-large-btn">
                    <Button size="large" type="primary">开始使用 <RightOutlined /></Button>
                </div>
            </div>
        </div>
    );
}

function TutorialSlimPage(props) {
    return (
        <div className="tutorial-slim-img" style={{backgroundImage: 'url("'+encodeURI(props.img)+'")'}} />
    );
}

function TutorialSlim(props) {
    const dispatch=useDispatch();
    const [carousel_pos,set_carousel_pos]=useState(0);
    const carousel_elem=useRef(null);

    function done() {
        dispatch(do_splash_callback(props.index,{}));
    }
    function go_next() {
        if(carousel_pos===2)
            done();
        else {
            if(carousel_elem.current)
                carousel_elem.current.next();
        }
    }

    return (
        <div>
            <h1 className="tutorial-slim-heading">欢迎使用「不咕计划」</h1>
            <Carousel
                ref={carousel_elem} className="tutorial-custom-carousel" infinite={false} speed={200}
                afterChange={(to)=>set_carousel_pos(to)} onEdge={(dir)=>{if(dir==='left') done();}}
            >
                <TutorialSlimPage img={tutorial_slim_1} />
                <TutorialSlimPage img={tutorial_slim_2} />
                <TutorialSlimPage img={tutorial_slim_3} />
            </Carousel>
            <div className="tutorial-slim-btn">
                <Button onClick={go_next} size="large">
                    {carousel_pos===2 ? '开始' : '继续'} <RightOutlined />
                </Button>
            </div>
        </div>
    );
}

export function Tutorial(props) {
    const [tutorial_slim,set_tutorial_slim]=useState(true);

    useEffect(()=>{
        function on_resize() {
            if(window.innerWidth>=TUTORIAL_LARGE_BP[0] && window.innerHeight>=TUTORIAL_LARGE_BP[1])
                set_tutorial_slim(false);
            else
                set_tutorial_slim(true);
        }
        on_resize();
        window.addEventListener('resize',on_resize,{passive: true});
        return ()=>{
            window.removeEventListener('resize',on_resize,{passive: true});
        };
    },[]);

    if(tutorial_slim)
        return (<TutorialSlim {...props} />);
    else
        return (<TutorialLarge {...props} />);
}
import React, { forwardRef, useMemo, useState, useEffect, useRef, useImperativeHandle } from "react";
import PropTypes from "prop-types";
import BScroll from "better-scroll"
import styled from 'styled-components';
import { debounce } from "../../api/utils";

const ScrollContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`
const Scroll = forwardRef((props, ref) => {
  const [bScroll, setBScroll] = useState();
  const scrollContainerRef = useRef();
  const { direction, click, refresh, pullUpLoading, pullDownLoading, bounceTop, bounceBottom } = props;
  const { pullUp, pullDown, onScroll } = props;

  let pullUpDebounce = useMemo (() => {
    return debounce (pullUp, 300)
  }, [pullUp]);
  // 千万注意，这里不能省略依赖，
  // 不然拿到的始终是第一次 pullUp 函数的引用，相应的闭包作用域变量都是第一次的，产生闭包陷阱。下同。

  let pullDownDebounce = useMemo (() => {
    return debounce (pullDown, 300)
  }, [pullDown]);

  useEffect(() => {
    const scorll = new BScroll(scrollContainerRef.current, {
      scrollX: direction === "horizental",
      scrollY: direction === "vertical",
      probeType: 3,
      click: click,
      bounce:{
        top: bounceTop,
        bottom: bounceBottom
      }
    })
    setBScroll(scorll)
    return () => {
      setBScroll(null)
    }
  }, [])

  // 注册事件
  useEffect(() => {
    if (!bScroll || !onScroll) return;
    bScroll.on('scroll', (scroll) => {
      onScroll (scroll);
    })
    return () => {
      bScroll.off ('scroll');
    }
  }, [bScroll, onScroll])

  useEffect (() => {
    if (!bScroll || !pullUp) return;
    bScroll.on ('scrollEnd', () => {
      // 判断是否滑动到了底部
      if (bScroll.y <= bScroll.maxScrollY + 100){
        pullUpDebounce();
      }
    });
    return () => {
      bScroll.off ('scrollEnd');
    }
  }, [pullUp, pullUpDebounce, bScroll]);

  useEffect (() => {
    if (!bScroll || !pullDown) return;
    bScroll.on ('touchEnd', (pos) => {
      // 判断用户的下拉动作
      if (pos.y > 50) {
        pullDownDebounce ();
      }
    });
    return () => {
      bScroll.off ('touchEnd');
    }
  }, [pullDown, pullDownDebounce, bScroll]);

  useEffect (() => {
    if (refresh && bScroll){
      bScroll.refresh ();
    }
  });

  useImperativeHandle(ref, () => ({
    refresh () {
      if (bScroll) {
        bScroll.refresh();
        bScroll.scrollTo(0, 0);
      }
    },
    getBScroll () {
      if (bScroll) {
        return bScroll;
      }
    }
  }))

  return (
    <ScrollContainer ref={scrollContainerRef}>
      {props.children}
    </ScrollContainer>
  )
})

Scroll.defaultProps = {
  direction: "vertical",
  click: true,
  refresh: true,
  onScroll:null,
  pullUpLoading: false,
  pullDownLoading: false,
  pullUp: null,
  pullDown: null,
  bounceTop: true,
  bounceBottom: true
};

Scroll.propTypes = {
  direction: PropTypes.oneOf (['vertical', 'horizental']),// 滚动的方向
  click: PropTypes.bool,// 是否支持点击
  refresh: PropTypes.bool,// 是否刷新
  onScroll: PropTypes.func,// 滑动触发的回调函数
  pullUp: PropTypes.func,// 上拉加载逻辑
  pullDown: PropTypes.func,// 下拉加载逻辑
  pullUpLoading: PropTypes.bool,// 是否显示上拉 loading 动画
  pullDownLoading: PropTypes.bool,// 是否显示下拉 loading 动画
  bounceTop: PropTypes.bool,// 是否支持向上吸顶
  bounceBottom: PropTypes.bool// 是否支持向下吸底
}

export default Scroll;
import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { Container, TopDesc, Menu, SongItem, SongList, Background } from './style';
import { CSSTransition } from 'react-transition-group'
import  Header  from './../../baseUI/header/index';
import Scroll from '../../baseUI/scroll/index';
import { getName, getCount, isEmptyObject } from './../../api/utils';
import style from "../../assets/global-style";
import { connect } from 'react-redux';
export const HEADER_HEIGHT = 45;
import { getAlbumList, changeEnterLoading, clearData } from './store/actionCreators';
import Loading from '../../baseUI/loading/index';


function Album (props) {
  const [showStatus, setShowStatus] = useState(true);
  const [title, setTitle] = useState ("歌单");
  const [isMarquee, setIsMarquee] = useState (false);// 是否跑马灯
  const headerEl = useRef ();
  const id = props.match.params.id;
  const { currentAlbum:currentAlbumImmutable, enterLoading } = props;
  const { getAlbumDataDispatch, clearState } = props;
  let currentAlbum = currentAlbumImmutable.toJS();

  useEffect (() => {
    getAlbumDataDispatch(id);
  }, [getAlbumDataDispatch, id]);


  const handleBack = () => {
    clearState()
    setShowStatus (false);
  };

  const handleScroll = (pos) => {
    let minScrollY = -HEADER_HEIGHT;
    let percent = Math.abs(pos.y/minScrollY);
    let headerDom = headerEl.current;
    // 滑过顶部的高度开始变化
    if (pos.y < minScrollY) {
      headerDom.style.backgroundColor = style ["theme-color"];
      headerDom.style.opacity = Math.min (1, (percent-1)/2);
      setTitle (currentAlbum.name);
      setIsMarquee (true);
    } else {
      headerDom.style.backgroundColor = "";
      headerDom.style.opacity = 1;
      setTitle ("歌单");
      setIsMarquee (false);
    }
  };

  return (
    <CSSTransition
      in={showStatus}  
      timeout={300} 
      classNames="fly" 
      appear={true} 
      unmountOnExit
      onExited={props.history.goBack}
    >
      <Container>
        <Header ref={headerEl} title={title} handleClick={handleBack} isMarquee={isMarquee}></Header>
        {
           !isEmptyObject (currentAlbum) ? (
            <Scroll 
              onScroll={handleScroll} 
              bounceTop={false}
            >
              <div>
                <TopDesc >
                  <Background background={currentAlbum.coverImgUrl}>
                    <div className="filter"></div>
                  </Background>  
                  <div className="img_wrapper">
                    <div className="decorate"></div>
                    <img src={currentAlbum.coverImgUrl} alt=""/>
                    <div className="play_count">
                      <i className="iconfont play">&#xe885;</i>
                      <span className="count">{Math.floor (currentAlbum.subscribedCount/1000)/10} 万 </span>
                    </div>
                  </div>
                  <div className="desc_wrapper">
                    <div className="title">{currentAlbum.name}</div>
                    <div className="person">
                      <div className="avatar">
                        <img src={currentAlbum.creator.avatarUrl} alt=""/>
                      </div>
                      <div className="name">{currentAlbum.creator.nickname}</div>
                    </div>
                  </div>
                </TopDesc>
                <Menu>
                  <div>
                    <i className="iconfont">&#xe6ad;</i>
                    评论
                  </div>
                  <div>
                    <i className="iconfont">&#xe86f;</i>
                    点赞
                  </div>
                  <div>
                    <i className="iconfont">&#xe62d;</i>
                    收藏
                  </div>
                  <div>
                    <i className="iconfont">&#xe606;</i>
                    更多
                  </div>
                </Menu>
                <SongList>
                  <div className="first_line">
                    <div className="play_all">
                      <i className="iconfont">&#xe6e3;</i>
                      <span > 播放全部 <span className="sum">(共 {currentAlbum.tracks.length} 首)</span></span>
                    </div>
                    <div className="add_list">
                      <i className="iconfont">&#xe62d;</i>
                      <span > 收藏 ({getCount (currentAlbum.subscribedCount)})</span>
                    </div>
                  </div>
                  <SongItem>
                    {
                      currentAlbum.tracks.map ((item, index) => {
                        return (
                          <li key={index}>
                            <span className="index">{index + 1}</span>
                            <div className="info">
                              <span>{item.name}</span>
                              <span>
                                { getName (item.ar) } - { item.al.name }
                              </span>
                            </div>
                          </li>
                        )
                      })
                    }
                  </SongItem>
                </SongList>
              </div> 
            </Scroll>
          ) : null
          
        }
        {/* { enterLoading ? <Loading></Loading> : null} */}
        <Loading show={enterLoading}></Loading>
      </Container>
    </CSSTransition>
  )
}

const mapStateToProps = (state) => ({
  currentAlbum: state.getIn (['album', 'currentAlbum']),
  enterLoading: state.getIn (['album', 'enterLoading']),
});
// 映射 dispatch 到 props 上
const mapDispatchToProps = (dispatch) => {
  return {
    getAlbumDataDispatch (id) {
      dispatch (changeEnterLoading (true));
      dispatch (getAlbumList (id));
    },
    clearState() {
      dispatch(clearData({}))
    }
  }
};

export default connect (mapStateToProps, mapDispatchToProps)(React.memo(Album));
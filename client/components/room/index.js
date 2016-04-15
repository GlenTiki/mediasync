import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import * as AuthActions from '../../actions/Auth'
import * as RoomActions from '../../actions/Room'

import { routerActions } from 'react-router-redux'
import { Panel, Col, Grid, ResponsiveEmbed, Tabs, Tab, Button, ButtonGroup, Input, Glyphicon, Table } from 'react-bootstrap'

import { default as io } from 'socket.io-client'

import ReactPlayer from 'react-player'

function mapStateToProps (state, own) {
  return {
    user: state.auth.user,
    roomDisplay: state.room.display,
    player: state.room.player,
    room: state.room.roomDetails,
    connectedCredentials: state.room.connectedCredentials
  }
}

function mapDispatchToProps (dispatch) {
  return {
    routeActions: bindActionCreators(routerActions, dispatch),
    roomActions: bindActionCreators(RoomActions, dispatch),
    authActions: bindActionCreators(AuthActions, dispatch)
  }
}

export class Room extends Component {
  getParameterByName (name, url) {
    if (!url) return
    name = name.replace(/[\[\]]/g, '\\$&')
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)', 'i')
    var results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  }

  componentWillMount () {
    // var that = this
    // setup socket here
    var that = this
    that.justJoined = true

    setTimeout(() => that.justJoined = false, 3000)

    this.socket = io('/api/sync')
    this.socket.on('connect', function () {
      var token = that.props.user ? that.props.user.token : null
      that.justJoined = true

      that.socket.emit('joinRoom', { roomName: that.props.routeParams.name, token: token })

      setTimeout(() => that.justJoined = false, 3000)
    })

    this.socket.on('reconnect', () => {
      var token = that.props.user ? that.props.user.token : null
      that.justJoined = true

      that.socket.emit('joinRoom', { roomName: that.props.routeParams.name, token: token, details: that.props.connectedCredentials, alreadyActive: true })
      setTimeout(() => that.justJoined = false, 1000)
    })

    this.socket.on('roomDetails', function (data) {
      that.props.roomActions.enterRoom(data)
    })

    this.socket.on('userJoined', function (user) {
      that.props.roomActions.userJoinedRoom(user)
      if (!that.props.room.seeking && !that.justJoined) {
        console.log('user joined, sending state', { time: that.props.room.played, playing: that.props.room.playing })
        that.socket.emit('currentState', { time: that.props.room.played, playing: that.props.room.playing })
      }
    })

    this.socket.on('userLeft', function (data) {
      if (data.name === that.props.connectedCredentials.connectedName && data.username === that.props.connectedCredentials.connectedUsername) {
        var token = that.props.user ? that.props.user.token : null
        that.socket.emit('joinRoom', { roomName: 'testing', token: token, details: that.props.connectedCredentials })
      } else {
        that.props.roomActions.userLeftRoom(data)
      }
    })

    this.socket.on('connectionCredentials', function (cred) {
      that.props.roomActions.receivedRoomCredentials(cred)
      // that.socket.emit('getState')
    })

    this.socket.on('kicked', function () {
      that.props.routeActions.push('/enterRoomFail')
    })

    this.socket.on('chatMessage', function (message) {
      if (!that.props.room.connectedUsers.some(function (elem) {
        return (elem.name === message.author.name && elem.username === message.author.username)
      })) {
        that.props.roomActions.userJoinedRoom(message.author)
      }
      that.props.roomActions.addChatMessage(message)
      that.refs['chat'].scrollTop = that.refs['chat'].scrollHeight
    })

    this.socket.on('play', function (data) {
      console.log('play', data)
      that.props.roomActions.seekTo(data.time)
      that.refs.player.seekTo(data.time)
      that.props.roomActions.playMedia()
    })

    this.socket.on('pause', function (data) {
      console.log('pause', data)
      that.props.roomActions.seekTo(data.time)
      that.refs.player.seekTo(data.time)
      that.props.roomActions.pauseMedia()
    })

    this.socket.on('skip', function (data) {
      console.log('skip', data)
      if (data.id === that.props.room.queue[0].id) {
        that.props.roomActions.skipMedia()
      }
    })

    this.socket.on('back', function (data) {
      console.log('back', data)
      if (data.id === that.props.room.queue[0].id) {
        that.props.roomActions.backMedia()
      }
    })

    this.socket.on('timeChanged', function (data) {
      console.log('timeChanged', data)
      that.props.roomActions.seekTo(data.newTime)
      that.refs.player.seekTo(data.newTime)
      if (data.playing) that.props.roomActions.playMedia()
      else that.props.roomActions.pauseMedia()
    })

    this.socket.on('searchResults', function (results) {
      that.props.roomActions.searchResults(results)
    })

    this.socket.on('moreSearchResults', function (results) {
      var res = that.props.roomDisplay.searchResults
      // console.log(that.props)
      res.items = res.items.concat(results.items)
      res.nextPage = results.nextPage
      that.props.roomActions.searchResults(res)
    })

    this.socket.on('currentQueue', function (queue) {
      that.props.roomActions.currentQueue(queue)
    })

    this.socket.on('currentState', function (data) {
      console.log('got currentState', data)
      that.props.roomActions.seekTo(data.time)
      that.refs.player.seekTo(data.time)
      if (data.playing) {
        that.props.roomActions.playMedia()
      } else {
        that.props.roomActions.pauseMedia()
      }
    })

    this.socket.on('getState', function () {
      console.log('sent currentState', { time: that.props.room.played, playing: that.props.room.playing })
      that.socket.emit('currentState', { time: that.props.room.played, playing: that.props.room.playing })
    })

    this.socket.on('moveMedia', function (data) {
      console.log('moveMedia', data)
    })

    this.socket.on('deleteMedia', function (index) {
      console.log('deleteMedia', index)
      if (index === 0) that.props.roomActions.seekTo(0)
      that.props.roomActions.deleteFromQueue(index)
    })

    this.socket.on('addMedia', function (media) {
      that.props.roomActions.addToQueue(media)
    })

    // setInterval(function () {
    //   // that.socket.emit('chatMessage', {message: 'test', author: that.props.connectedCredentials})
    // }, 5000)
  }

  componentWillUnmount () {
    // tear down socket here
    this.socket.disconnect()
    this.props.roomActions.leaveRoom()
  }

  onPlay () {
    this.props.roomActions.playMedia(this.props.room.clientAction)
    if (this.hasPermission() && this.props.room.clientAction && !this.justJoined) {
      this.socket.emit('play', { id: this.props.room.queue[0].id, time: this.props.room.played })
    }
  }

  onPause () {
    this.props.roomActions.pauseMedia(this.props.room.clientAction)
    if (this.hasPermission() && this.props.room.clientAction && !this.justJoined) {
      this.socket.emit('pause', { id: this.props.room.queue[0].id, time: this.props.room.played })
    }
  }

  onEnded () {
    this.socket.emit('ended', { id: this.props.room.queue[0].id })
  }

  onProgress (state) {
    if (!this.props.room.seeking && this.hasPermission) this.props.roomActions.seekTo(parseFloat(state.played))
    // this.socket.emit('currentTime', { id: this.props.room.queue[0].id, time: state.played })
    // if (this.props.room.played - state.played > -0.03 && !this.props.room.seeking) this.refs.player.seekTo(state.played)
  }

  onDuration (duration) {
    // console.log('duration', duration)
    this.props.roomActions.duration(duration)
  }

  onSeekMouseDown (e) {
    this.props.roomActions.seeking()
  }

  onSeekChange (e) {
    this.props.roomActions.seekTo(parseFloat(e.target.value))
  }

  onSeekMouseUp (e) {
    this.props.roomActions.seekingDone()
    this.props.roomActions.seekTo(parseFloat(e.target.value))
    this.refs.player.seekTo(parseFloat(e.target.value))
    this.socket.emit('timeChanged', { newTime: parseFloat(e.target.value), playing: this.props.room.playing })
  }

  hasPermission () {
    return (this.props.room.playback === 'anyone' || this.props.room.controllers.indexOf(this.props.connectedCredentials.id) > -1)
  }
  //
  // onProgress (state) {
  //   console.log(state)
  //   // We only want to update time slider if we are not currently seeking
  //   if (!this.props.room.seeking) {
  //     this.socket.emit('currentTime', { id: this.props.room.queue[0].id, user: this.props.connectedCredentials })
  //     this.setState(state)
  //   }
  // }

  render () {
    var that = this
    var usersColors = {}

    // console.log('render queue', this.props.room.queue)

    this.props.room.connectedUsers.forEach(function (elem) {
      usersColors[elem.username] = elem.color
    })

    var chat = this.props.roomDisplay.chat.map(function (elem, id) {
      var shouldLink = !!elem.author
      return (<Col key={id} style={{padding: '0px 5px'}}>
        {
          elem.roomMessage
          ? (function () {
            switch (elem.messageType) {
              case 'userJoined':
                return (<p>User <span style={{color: usersColors[elem.user]}}>{elem.user}</span> Joined</p>)
            }
          })()
          : <span><span style={{color: usersColors[elem.author.username]}}>{ shouldLink ? <Link to={'/profile/' + elem.author.username} style={{color: usersColors[elem.author.username]}}>{elem.author.username}</Link> : elem.author.username }:</span> {elem.message}</span>
        }
        <hr/>
      </Col>)
    })

    var connectedUsers = this.props.room.connectedUsers.map(function (elem, id) {
      var shouldLink = !!elem.id
      return <h4 style={{color: usersColors[elem.username], padding: '0px 5px'}}>{ shouldLink ? <Link to={'/profile/' + elem.username} style={{color: usersColors[elem.username]}}>{elem.username}</Link> : elem.username }</h4>
    })

    var player = (<span style={{pointerEvents: 'none'}}>
        {
          (function () {
            if (that.props.room.queue[0]) {
              var topMedia = that.props.room.queue[0]
              return (function () {
                var url
                switch (topMedia.type) {
                  case 'youtube':
                    url = `https://www.youtube.com/watch?v=${topMedia.id}`
                    break
                  case 'soundcloud':
                    url = `https://soundcloud.com/${topMedia.id}`
                    break
                  case 'vimeo':
                    url = `https://vimeo.com/${topMedia.id}`
                    break
                  default: // handle non recognised media in the queue
                    // setTimeout(that.socket.emit('skipSong', {topMedia.id}), 3000)
                    return <h1>Invalid media in queue...</h1>
                }
                return <ReactPlayer ref='player'
                          url={url}
                          playing={that.props.room.playing}
                          onPlay={that.onPlay.bind(that)}
                          onPause={that.onPause.bind(that)}
                          onEnded={that.onEnded.bind(that)}
                          onProgress={that.onProgress.bind(that)}
                          onDuration={that.onDuration.bind(that)}
                          soundcloudConfig={{clienId: '235c570a0c60640ee158a2c94bad6c84'}}
                          youtubeConfig={{prelod: true, playerVars: {autoplay: 0}}}
                          vimeoConfig={{preload: true, iframeParams: {autoplay: 0}}}/>
              })()
            } else {
              return <h1>Nothing in the queue yet!</h1>
            }
          })()
        }
      </span>)
    var searchDropdown = (
        <select name='searchLoc' ref='searchLoc'>
          <option value='youtube'>Youtube</option>
          <option value='vimeo'>Vimeo</option>
        </select>
    )

    var doSearch = function () {
      var search = that.refs.search.getValue()
      var searchLoc = that.refs.searchLoc.value
      that.socket.emit('search', {search: search, searchLoc: searchLoc})
      that.props.roomActions.searching({search: search, searchLoc: searchLoc})
    }

    var s = (
      <div>
        <Input type='text' bsSize='large' placeholder='Search' ref='search' onKeyPress={function (e) {
          if (e.key === 'Enter') {
            doSearch()
          }
        }} buttonAfter={<Button onClick={doSearch}>Search</Button>} addonBefore={searchDropdown} />
        {
          that.props.roomDisplay.searchResults.items.length > 0
          ? <Table responsive>
              <thead>
                <tr>
                  <th className='col-sm-8'>Title</th>
                  <th className='col-sm-2'>Uploader</th>
                  <th className='col-sm-2'>Options</th>
                </tr>
              </thead>
              <tbody>
                {
                  that.props.roomDisplay.searchResults.items.map(function (elem, ind) {
                    switch (that.props.roomDisplay.searchResults.searchType) {
                      case 'youtube':
                        return (<tr key={ind}>
                          <td><img src={elem.snippet.thumbnails.default.url} width='60' height='60'/> {elem.snippet.title}</td>
                          <td>{elem.snippet.channelTitle}</td>
                          <td><Button onClick={function () {
                            // console.log('add to queue', elem)
                            that.socket.emit('addMedia', {id: elem.id.videoId, type: 'youtube', title: elem.snippet.title, thumburl: elem.snippet.thumbnails.default.url, uploader: elem.snippet.channelTitle})
                          }} block>Add To Queue</Button></td>
                        </tr>)
                      case 'vimeo':
                        return (<tr key={ind}>
                          <td><img src={elem.pictures.sizes[0].link} width='60' height='60'/>{elem.name}</td>
                          <td>{elem.user.name}</td>
                          <td><Button onClick={function () {
                            // console.log('add to queue', elem)
                            var gex = /(?:(http[s]?:\/\/vimeo.com\/))(\w+)/g
                            // console.log(gex.exec(elem.link)[2])
                            that.socket.emit('addMedia', {id: gex.exec(elem.link)[2], type: 'vimeo', title: elem.name, thumburl: elem.pictures.sizes[0].link, uploader: elem.user.name})
                          }} block>Add To Queue</Button></td>
                        </tr>)
                    }
                    return false
                  })
                }
              </tbody>
            </Table>
        : <h2>Nothing to see here</h2>
        }
        {that.props.roomDisplay.searchResults.nextPage && that.props.roomDisplay.searchResults.nextPage !== -1 ? <Button bsStyle='primary' onClick={function () {
          that.socket.emit('continueSearch', { search: that.props.roomDisplay.searchedFor.search, searchLoc: that.props.roomDisplay.searchedFor.searchLoc, nextPage: that.props.roomDisplay.searchResults.nextPage })
        }} block>Load more results</Button> : false}
      </div>
    )
    var search = (<span>{ that.hasPermission() ? s : <h1>You don't have permission to add music here!</h1> }</span>)

    var q = JSON.parse(JSON.stringify(this.props.room.queue))
    if (q[0]) q.splice(0, 1)
    // console.log('q', q)
    var queue = (<div>{
      !(q.length > 0)
      ? <h1>Nothing in queue yet, add media with the search section</h1>
      : <Table responsive>
          <thead>
            <tr>
              <th className='col-sm-8'>Title</th>
              <th className='col-sm-2'>Uploader</th>
              <th className='col-sm-2'>Options</th>
            </tr>
          </thead>
      <tbody>
        {
          q.map(function (elem, ind) {
            return (
              <tr key={ind}>
                <td><img src={elem.thumburl} width='60' height='60'/> {elem.title}</td>
                <td>{elem.title}</td>
                <td>
                  <Button bsStyle='success' onClick={function () {
                    that.socket.emit('moveToFront', ind + 1)
                      // console.log('add to queue', elem)
                      // that.socket.emit('addMedia', {id: elem.id.videoId, type: 'youtube', title: elem.snippet.title, thumburl: elem.snippet.thumbnails.default.url})
                  }} block>
                    Play now
                  </Button>
                  <Button bsStyle='warning' onClick={function () {
                    that.socket.emit('delete', ind + 1)
                      // console.log('add to queue', elem)
                      // that.socket.emit('addMedia', {id: elem.id.videoId, type: 'youtube', title: elem.snippet.title, thumburl: elem.snippet.thumbnails.default.url})
                  }} block>
                    Delete
                  </Button>
                </td>
              </tr>
            )
          })
        }
        </tbody>
      </Table>
    }</div>)

    function sendChatMessage () {
      if (that.refs['chatMsg'].getValue() === '') return
      var msg = that.refs['chatMsg'].getValue()
      that.refs['chatMsg'].refs['input'].value = ''
      that.socket.emit('chatMessage', {message: msg, author: that.props.connectedCredentials})
      // FIXME: scroll doesn't scroll to bottom fully
    }

    // console.log('playing 1', (that.props.room.queue[0]))
    // console.log('playing 2', (['vimeo', 'youtube'].indexOf(that.props.room.queue[0].type) > -1))
    // console.log('playing', (that.props.room.queue[0] && ['vimeo', 'youtube'].indexOf(that.props.room.queue[0].type) > -1))
    var roomDetails = (
      <div>
        <h3>
          {that.props.room.name}
        </h3>
        <h4>Currently Playing: {
            that.props.room.queue[0] && ['vimeo', 'youtube'].indexOf(that.props.room.queue[0].type) > -1
            ? that.props.room.queue[0].title : 'Nothing!'
          }
        </h4>
        { that.hasPermission() ? <h5>you can edit the playback here</h5> : <h5>You cannot do anything to the playback</h5> }

        { that.hasPermission() && that.props.room.queue[0] && ['vimeo', 'youtube'].indexOf(that.props.room.queue[0].type) > -1
          ? <div>
            <Col xs={12}>
            <ButtonGroup justified>
            <ButtonGroup><Button onClick={ function () {
              that.socket.emit('back', { id: that.props.room.queue[0].id })
              that.props.roomActions.backMedia(true)
            }}><Glyphicon glyph='step-backward' />Back</Button></ButtonGroup>
            {
              that.props.room.playing
              ? <ButtonGroup><Button onClick={ function () {
                that.props.roomActions.pauseMedia(true)
              }}><Glyphicon glyph='pause' />Pause</Button></ButtonGroup>
            : <ButtonGroup><Button onClick={function () {
              that.props.roomActions.playMedia(true)
            }}><Glyphicon glyph='play' />Play</Button></ButtonGroup>
            }
            <ButtonGroup><Button onClick={function () {
              that.socket.emit('skip', { id: that.props.room.queue[0].id })
              that.props.roomActions.skipMedia(true)
            }}><Glyphicon glyph='step-forward' />Skip</Button></ButtonGroup>
            </ButtonGroup>
            </Col>
            <br/>
            <input
              type='range' min={0} max={1} step='any'
              value={that.props.room.played}
              onMouseDown={that.onSeekMouseDown.bind(that)}
              onChange={that.onSeekChange.bind(that)}
              onMouseUp={that.onSeekMouseUp.bind(that)}
            />
          </div>
          : <progress style={{width: '100%'}} max={1} value={that.props.room.played} />
        }
      </div>
    )

    return (
      <div className='room' >
        <Grid fluid>
          <Col fluid sm={12} md={8}>
            <Panel header={<h3 onClick={() => that.props.roomActions.handlePanelClick(0)}>Video</h3>} collapsible expanded={this.props.roomDisplay.openPanel === 0}>
              <ResponsiveEmbed a16by9 ref='player'>
                {player}
              </ResponsiveEmbed>
            </Panel>
            <Panel header={<h3 onClick={() => that.props.roomActions.handlePanelClick(1)}>Search</h3>} collapsible expanded={this.props.roomDisplay.openPanel === 1}>
              {search}
            </Panel>
            <Panel header={<h3 onClick={() => that.props.roomActions.handlePanelClick(2)}>Queue</h3>} collapsible expanded={this.props.roomDisplay.openPanel === 2}>
              {queue}
            </Panel>
          </Col>
          <Col fluid sm={12} md={4}>
            <Panel className='sidebar' header={roomDetails}>
              <Tabs defaultActiveKey={1}>
                <Tab eventKey={1} title='Chat'>
                  <div className='panel panel-default panel-body' ref='chat' style={{height: '50vh', overflowY: 'scroll'}}>
                      { chat }
                  </div>
                  <Input type='text' bsSize='large' placeholder='Send A Message' ref='chatMsg' onKeyPress={function (e) {
                    if (e.key === 'Enter') {
                      sendChatMessage()
                    }
                  }} buttonAfter={<Button onClick={sendChatMessage}>Send</Button>} />
                </Tab>
                <Tab eventKey={2} title='Connected Users'>
                  <div className='panel panel-default panel-body' ref='connectedUsers' style={{height: '50vh', overflowY: 'scroll'}}>
                      { connectedUsers }
                  </div>
                </Tab>
              </Tabs>
            </Panel>
          </Col>
        </Grid>
      </div>
    )
  }
}

Room.propTypes = {
  user: PropTypes.object,
  roomDisplay: PropTypes.object,
  room: PropTypes.object,
  connectedCredentials: PropTypes.object,
  routeActions: PropTypes.object.isRequired,
  authActions: PropTypes.object.isRequired,
  roomActions: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Room)

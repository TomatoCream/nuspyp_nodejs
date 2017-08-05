import React, { Component } from 'react';
import { connect } from 'react-redux';


// Material UI
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';

// actions
import { postThread }  from '../../actions/modules';
import { postCommentToThread, getArrayOfComments, postCommentToComment } from '../../actions/modules';

// components
import ThreadItem from './ThreadItem';

// quill
import QuillWrap from '../QuillWrap'
/*
 * Note: This is kept as a container-level component,
 *  i.e. We should keep this as the container that does the data-fetching
 *  and dispatching of actions if you decide to have any sub-components.
 */

class Tail extends Component {
  constructor(props) {
    super(props)
  }

  handleCommentButton = () => {
    const { handleToggle, comment, threadId } = this.props;
    console.log("I am the comment handler")
    handleToggle({
      type: "comment",
      threadId,
      ReplyTo: comment.Author,
      ReplyToId: comment._id,
    });
  }

  render() {
    const { ReplyTo, Author, Body, DateCreated } = this.props.comment;
    const { style } = this.props;

    const nameAndDate = ({Author, DateCreated}) => {
      return (
        <div>
          {Author}
          <br/>
          {DateCreated}
        </div>
      )
    }

    return (
      <div style={style}>
        <Card>
          <CardText>
            <div dangerouslySetInnerHTML={{__html: Body }} />
          </CardText>
          <CardTitle subtitle={nameAndDate({Author, DateCreated})} />
          <CardActions>
            <FlatButton label="Comment" onTouchTap={this.handleCommentButton}/>
            <FlatButton label="Like" />
          </CardActions>
        </Card>
        {this.props.children}
      </div>
    )
  }
}

class Head extends Component {
  constructor() {
    super()
  }
  
  handleCommentButton = () => {
    const { thread, handleToggle, threadId } = this.props
    handleToggle({
      type: "thread",
      ReplyTo: thread.Author,
      ReplyToId: thread._id,
    });
  }

  render() {
    const { thread, handleToggle, threadId } = this.props;

    const style = (size) => {
      return {
        marginLeft: size,
        marginTop: size,
      }
    }

    const recurseComments = (commentsArray, size, add, threadId) => {
			if (commentsArray == undefined){
				return []
		  } else if (commentsArray.length==0) {
        return []
      } else {
        return (
          commentsArray.map((comment) => {
            return (
              <Tail
                style={style(size)}
                comment={comment}
                handleToggle={handleToggle}
                threadId={threadId} >
                {recurseComments(comment.Comments, size+add, add, threadId)}
              </Tail>
            )
          })
        )
      }
    }

    return(
      <div>
        <Card>
          <CardTitle title={thread.Title} subtitle={thread.Author} />
          <CardText>
            <div dangerouslySetInnerHTML={{__html: thread.Body }} />
          </CardText> 
          <CardActions>
            <FlatButton label="Comment" onTouchTap={this.handleCommentButton}/>
            <FlatButton label="Like" />
          </CardActions>
        </Card>

        {recurseComments(thread.Comments,20,0,threadId)}
        
      </div>
    )
  }
}

class Thread extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      id: "default",
      createComment: {
        comment: {
          Body: null,
        }
      }
    };
  }
  
  handleId = () => {
  }

  handleSubmit = () => {
    const { postCommentToThread, postCommentToComment } = this.props;
    const { createComment } = this.state;

    console.log(this.state);
    console.log(this.props);

    // console.log(createComment);
    // const dummy = document.createElement('html')
    // dummy.innerHTML = createComment.comment.Body;
    // console.log(dummy);
    // console.log(dummy.getElementsByTagName('img'));

    switch (createComment.type) {
      case "thread":
        postCommentToThread(createComment.comment);
        break;
      case "comment":
        postCommentToComment(createComment);
      default:
        console.log("no thread");
    }
  }

  handleToggle = ({ type, ReplyTo, ReplyToId, threadId }) => {
    this.setState({
      open: !this.state.open,
      createComment: {
        type,
        threadId,
        comment: {
          ReplyTo,
          ReplyToId,
          Author: "Derrick Chua",
          Votes: 99,
          Comments: [],
          children: [],
        }
      }
    });
  }

  handleBody = (e) => {
    this.state.createComment.comment.Body = e.target.value;
  }

  sendUp = (e) => {
    this.state.createComment.comment.Body = e;
  }

  logger = () => {
    console.log("this.,props,state.thread");
    console.log(this.props.thread)
  }

  componentDidMount() {
  }

  render() {
    const { threadId } = this.props.params;

    const actions = [
      <RaisedButton
        label="Submit"
        primary={true}
        onTouchTap={this.handleSubmit}
      />,
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleToggle}
      />,
    ]

    return (
      <div>
        <Dialog
          title="Reply"
          modal={true}
          open={this.state.open}
          actions={actions}
          onRequestClose={this.handleToggle}
        >
        To:  <TextField hintText="Id" onChange={this.handleId} value={this.state.createComment.comment.ReplyTo} fullWidth={true} />
        Message: <br /><br />
        <QuillWrap sendUp={this.sendUp}/>
        </Dialog>
        <div style={{textAlign: "center"}}>
        </div>
        <Head thread={this.props.thread} handleToggle={this.handleToggle} threadId={threadId}/>
      </div>
    )
  }
};

        // <FlatButton label="touch tap" onTouchTap={this.logger} />
        // <canvas id="myCanvas" width="200" height="100" style={{border: '1px solid #000000'}} ></canvas>

          // <img id="myCanvas" src="/api/papers/ACC1002/1213/1/1" width="700px" style={{border: '1px solid #000000'}} ></img>
        // <TextField hintText="Body" onChange={this.handleBody} fullWidth={true} />

function mapStateToProps(state) {
  console.log("Are you being called everything updates");
  return {
    thread: state.module.thread,
  }
}

export default connect(mapStateToProps, { postThread, postCommentToThread, getArrayOfComments, postCommentToComment })(Thread);

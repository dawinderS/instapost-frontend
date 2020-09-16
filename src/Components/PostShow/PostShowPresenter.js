import React, { useState } from "react";
import styled from "styled-components";
import { Link, useHistory } from "react-router-dom";
import { useMutation } from "react-apollo-hooks";
import TextareaAutosize from "react-autosize-textarea";
import moment from "moment";
import { HeartFull, HeartEmpty, Comment as CommentIcon, PostOptions, 
  HeaderBackButton, CancelButton, LocationLogo } from "../Icons";
import FatText from "../FatText";
import Avatar from "../Avatar";
import FollowButton from "../FollowButton/index";
import { toast } from "react-toastify";
import { EDIT_POST } from "./PostShowQueries";
import { FEED_QUERY, GET_USER_BY_ID } from "../../SharedQueries";
import Modal from "react-modal";
import PlacesAutocomplete, {
  geocodeByAddress,
  geocodeByPlaceId,
  getLatLng,
} from "react-places-autocomplete";

Modal.setAppElement("#root");

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "10px",
    padding: "0",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: "20",
  },
};

const Wrapper = styled.div`
  user-select: none;
  a {
    color: inherit;
  }
  @media screen and (min-width: 770px) {
    max-width: 935px;
    max-height: 80vh;
  }
`;

const Post = styled.div`
  ${(props) => props.theme.whiteBox};
  width: 100%;
  max-width: 100%;
  user-select: none;
  a {
    color: inherit;
  }
  @media screen and (max-width: 770px) {
    margin: 0;
    border: none;
    min-height: 75vh;
    overflow-y: scroll;
    margin-bottom: 45px;
  }
  @media screen and (min-width: 770px) {
    display: none;
  }
`;

const Header = styled.header`
  width: 100%;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  p {
    margin-left: auto;
    height: 32px;
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    cursor: pointer;
  }
  @media screen and (min-width: 770px) {
    border-bottom: 1px solid #efefef;
  }
`;

const UserColumn = styled.div`
  margin-left: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  min-height: 32px;
`;

const UsernameLink = styled(Link)`
  display: flex;
  align-items: center;
`;

const FollowHolder = styled.div`
  display: flex;
  align-items: center;
  span {
    margin-right: 5px;
  }
  button {
    font-weight: 600;
    font-size: 13px;
    line-height: 10px;
    color: #0095f6;
    padding: 0;
    margin: 0;
    background-color: transparent;
    width: auto;
    height: auto;
    margin-top: 1px;
  }
`;

const Location = styled.span`
  display: block;
  // margin-top: 3px;
  font-size: 12px;
`;

const Files = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: 100%;
  height: auto;
`;

const File = styled.img`
  width: 100%;
  height: auto;
  max-height: 720px;
  background-size: cover;
  background-position: center;
  @media screen and (max-width: 770px) {
    width: 100%;
    height: auto;
    min-height: 30vh;
    max-height: 80vh;
  }
`;

const Button = styled.span`
  cursor: pointer;
`;

const Meta = styled.div`
  padding: 12px 16px 0px 16px;
  p {
    color: #8e8e8e;
    cursor: pointer;
  }
  #viewcomments {
    margin: 0;
    padding: 0;
  }
`;

const Buttons = styled.div`
  ${Button} {
    &:first-child {
      margin-right: 16px;
    }
  }
  margin-bottom: 10px;
`;

const Timestamp = styled.span`
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  display: block;
  color: rgba(var(--f52, 142, 142, 142), 1);
  font-size: 10px;
  margin: 8px 0px 0px 0px;
  padding-bottom: 12px;
  padding-top: 3px;
  @media screen and (max-width: 770px) {
    display: none;
  }
`;
const Timestamp2 = styled.span`
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  display: block;
  color: #8e8e8e;
  font-size: 10px;
  padding: 0px 16px 10px 16px;
  @media screen and (min-width: 770px) {
    display: none;
  }
`;

const CommentsWrap = styled.div`
  display: flex;
  flex-direction: column-reverse;
  overflow: auto;
`;
const Comments = styled.ul`
  margin-top: 8px;
  @media screen and (min-width: 770px) {
    overflow-y: scroll; 
    max-height: 100%;
    margin: 5px 0px 5px 0px;
    #nocomments {
      display: flex;
      width: 100%;
      margin-top: 15px;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      color: #8e8e8e;
    }
  }
`;

const Comment = styled.li`
  @media screen and (min-width: 770px) {
    padding: 8px 16px 10px 16px;
    margin-bottom: 0px;
    display: flex;
    align-items: center;
  }
  @media screen and (max-width: 770px) {
    margin-bottom: 7px;
    span {
      margin-right: 5px;
    }
  }
`;

const AllText = styled.div`
  display: flex;
  max-width: 290px;
  justify-content: center;
  flex-direction: column;
  overflow-wrap: break-word;
  margin-left: 14px;
  p {
    /* margin-left: 3px; */
    color: #8e8e8e;
    font-size: 12px;
    display: flex;
    align-items: center;
    margin-top: 1px;
  }
  #gapcreate {
    margin-right: 4px;
    margin-left: 4px;
  }
  #topspan {
    display: flex;
    margin-bottom: 3px;
  }
`;

const Caption = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0px 8px 0px;
  @media screen and (max-width: 770px) {
    span {
      margin-right: 5px;
    }
  }
  @media screen and (min-width: 770px) {
    padding: 12px 16px 16px 16px;
    margin: 0px;
    border-bottom: 1px solid #efefef;
  }
`;

const Textarea = styled(TextareaAutosize)`
  border: none;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  resize: none;
  font-size: 14px;
  &:focus {
    outline: none;
  }
  padding-bottom: 4px;
`;

const CommentHolder = styled.div`
  display: flex;
  min-height: 55px;
  align-items: center;
  border-top: rgba(var(--ce3, 239, 239, 239), 1) 1px solid;
  padding: 0px 16px;
  img {
    border-radius: 50%;
    background-size: cover;
    margin-right: 8px;
  }
  div {
    display: flex;
    width: 100%;
    align-items: center;
    padding: 8px 0px;
    p {
      color: #0095f6;;
      font-weight: 600;
      cursor: pointer;
      opacity: 1;
      padding-left: 5px;
    }
    #postComment {
      opacity: 0.4;
      cursor: default;
    }
  }
  @media screen and (max-width: 770px) {
    min-height: 10px;
    border: none;
    padding: 3px 16px 10px 16px;
    div {
      border: .5px solid #dbdbdb;
      border-radius: 50px;
      padding: 6px 12px 6px 10px;
    }
  }
`;

const ModalWrapper = styled.div`
  width: 80vw;
  @media screen and (min-width: 735px) {
    width: 400px;
  }
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  h1 {
    width: 100%;
    margin: 24px 0px 24px 0px;
    text-align: center;
    font-size: 18px;
    line-height: 24px;
    font-weight: 600;
    color: #262626;
  }
  div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-top: 1px solid #dbdbdb;
    cursor: pointer;
    min-height: 48px;
    padding: 4px 0px;
    text-align: center;
    span {
      color: #8e8e8e;
      margin-right: 10px;
    }
  }
  #profupload {
    color: #0095f6;
    font-size: 14px;
    font-weight: 700;
  }
  #profremove {
    color: #ed4956;
    font-size: 14px;
    font-weight: 700;
    button {
      width: 100%;
      height: 100%;
      background-color: #fff;
      color: #ed4956;
    }
  }
  #profremove2 {
    color: #0095f6;
    font-size: 14px;
    font-weight: 700;
    button {
      width: 100%;
      height: 100%;
      background-color: #fff;
      color: #0095f6;
    }
  }
  #profcancel {
    color: #000000;
    font-size: 14px;
  }
`;
const ModalWrapper2 = styled.div`
  width: 90vw;
  @media screen and (min-width: 735px) {
    width: 400px;
  }
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  h1 {
    width: 100%;
    margin: 24px 0px 24px 0px;
    text-align: center;
    font-size: 18px;
    line-height: 24px;
    font-weight: 600;
    color: #262626;
  }
  div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-top: 1px solid #dbdbdb;
    cursor: pointer;
    min-height: 48px;
    padding: 4px 0px;
    text-align: center;
    span {
      color: #8e8e8e;
      margin-right: 10px;
    }
  }
  #captionedit {
    justify-content: flex-start;
    padding: 4px 15px;
  }
  #locationedit {
    justify-content: flex-start;
    padding: 4px 15px;
    input {
      border: none;
      outline: none;
    }
  }
  #profupload {
    color: #0095f6;
    font-size: 14px;
    font-weight: 700;
  }
  #profcancel {
    color: #000000;
    font-size: 14px;
  }
  #location {
    cursor: pointer;
    width: 100%;
    display: flex;
    align-items: center;
    background-color: #fff;
    border-radius: 0;
    border-top: 0.5px solid #dbdbdb;
    height: 44px;
    font-size: 14px;
    line-height: 18px;
    padding: 0px 15px;
    span {
      margin-left: auto;
      color: #ed4956;
      font-weight: 500;
      font-size: 13px;
      height: 100%;
      display: flex;
      align-items: center;
      svg {
        margin: 0;
        transform: rotate(90deg);
      }
    }
    h1 {
      color: #0095f6;
      font-weight: 500;
      height: 100%;
      display: flex;
      align-items: center;
      margin-left: 20px;
    }
    #headerbtn {
      margin-right: 0px;
    }
    #locationset {
      font-weight: 500;
      overflow-x: scroll;
      margin-left: 10px;
    }
    h3 {
      color: #8e8e8e;
    }
    h2 {
      color: #0095f6;
      font-weight: 500;
      font-size: 13px;
      height: 100%;
      display: flex;
      align-items: center;
    }
  }
`;

const ModalWrapper3 = styled.div`
  width: 90vw;
  @media screen and (min-width: 735px) {
    width: 400px;
  }
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
`;
const ModalHeader3 = styled.div`
  width: 100%;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dbdbdb;
  padding: 0px 16px;
  div {
    display: flex;
    width: 20%;
    span {
      cursor: pointer;
    }
  }
  h1 {
    text-align: center;
    font-size: 18px;
    line-height: 24px;
    font-weight: 600;
    color: #262626;
  }
`;
const ModalMid3 = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 0px;
  min-height: 320px;
  max-height: 320px;
  overflow-y: auto;
  #search {
    width: 100%;
    padding: 5px 0px;
    input {
      width: calc(100% - 32px);
      display: flex;
      align-items: center;
      padding: 10px 15px;
      background-color: #fafafa;
      border: 0.5px solid #dbdbdb;
      border-radius: 10px;
      margin: 0px 16px;
      margin-bottom: 10px;
    }
    .suggestion-item {
      padding: 10px 20px;
      span {
        font-weight: 500;
      }
      p {
        color: #8e8e8e;
        font-size: 12px;
        margin-top: 3px;
      }
    }
    #searching-wait {
      padding: 16px 20px;
      font-weight: 500;
    }
    #totalshow {
      display: flex;
      align-items: center;
      h1 {
        margin-right: 10px;
      }
    }
  }
`;

const MinHeader = styled.header`
  width: 100%;
  border: 0;
  position: fixed;
  top: 0;
  left: 0;
  background-color: white;
  border-bottom: 1px solid #dbdbdb;
  border-radius: 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 16px;
  z-index: 2;
  height: 5.5vh;
  max-height: 44px;
  min-height: 44px;
  svg {
    margin: 0;
    transform: rotate(270deg);
  }
  div {
    font-size: 17px;
    font-weight: 600;
    text-align: center;
  }
  span {
    font-size: 16px;
    font-weight: 600;
    width: 20%;
    display: flex;
    p {
      margin-left: auto;
      color: #0095f6;
    }
  }
  @media screen and (min-width: 770px) {
    display: none;
  }
`;

const Post2 = styled.div`
  ${(props) => props.theme.whiteBox};
  display: flex;
  max-width: 935px;
  min-height: 450px;
  max-height: 80vh;
  @media screen and (max-width: 770px) {
    display: none;
  }
`;

const MetaHolder = styled.div`
  margin-top: auto;
  border-top: 1px solid #efefef;
`;
const Files2 = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  min-height: 450px;
  border-right: 1px solid #efefef;
`;

const File2 = styled.img`
  max-width: 600px;
  max-height: 80vh;
  background-size: cover;
  background-position: center;
`;

const Info = styled.div`
  display: flex;
  width: 335px;
  flex-direction: column;
`;

export default ({
  // user: { username, avatar, isFollowing, isSelf },
  user,
  id,
  me,
  location,
  files,
  caption,
  isLiked,
  likeCount,
  commentCount,
  createdAt,
  newComment,
  currentItem,
  toggleLike,
  onKeyPress,
  onPostClick,
  comments,
  selfComments,
}) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [locationModal, setLocationModal] = useState(false);
  const [captionInput, setCaptionInput] = useState(caption);
  const [locationInput, setLocationInput] = useState(location);
  const [locationFind, setLocationFind] = useState("");
 
  const history = useHistory();
  const goBack = (e) => {
    history.goBack();
  };

  const openModal = () => {
    setIsOpen(true);
  }
  const closeModal = () => {
    setIsOpen(false);
  }

  const openDeleteModal = () => {
    setIsOpen(false);
    setDeleteModal(true);
  }
  const closeDeleteModal = () => {
    setDeleteModal(false);
  }
  const openEditModal = () => {
    setIsOpen(false);
    setEditModal(true);
  }
  const closeEditModal = () => {
    setEditModal(false);
    setCaptionInput(caption);
    setLocationInput(location);
  }
  const openLocationModal = () => {
    setEditModal(false);
    setLocationModal(true);
  }
  const closeLocationModal = () => {
    setLocationModal(false);
    setEditModal(true);
    setLocationFind("");
  }
  const removeLocation = () => {
    setLocationInput("");
  }
  const handleLocation = value => {
    setLocationInput(value.split(",")[0]);
    closeLocationModal();
  }

  const [editPostMutation] = useMutation(EDIT_POST, {
    refetchQueries: () => [
      { query: GET_USER_BY_ID, variables: { id: user.id } },
      { query: FEED_QUERY },
    ]
  });
  const [editPostMutation2] = useMutation(EDIT_POST);
  const DELETE = "DELETE";
  const EDIT = "EDIT";

  const deletePost = async (event) => {
    event.preventDefault();
    closeDeleteModal();
    try {
      const {
        data: { editPost }
      } = await editPostMutation({
        variables: { id, action: DELETE }
      });
      if (editPost) {
        goBack();
        toast.info("Post deleted successfully.");
      }
    } catch {
      toast.error("Cannot delete at the moment, please try later.");
    }
  };

  const updateState = (e) => {
    const value = e.target.value;
    switch (e.target.getAttribute("name")) {
      case "caption":
        setCaptionInput(value);
        break;
      case "location":
        setLocationInput(value);
        break;
      default:
        return;
    }
  };

  const editPostSubmit = async (event) => {
    event.preventDefault();
    closeEditModal();
    try {
      const {
        data: { editPost }
      } = await editPostMutation2({
        variables: {
          id,
          caption: captionInput,
          location: locationInput,
          action: EDIT
        }
      });
      if (editPost) {
        toast.info("Post edited successfully.");
      }
    } catch {
      toast.error("Cannot delete at the moment, please try later.");
    }
  };

  const getDate = (createdAt) => {
    let time = moment(createdAt).fromNow();
    let arr = time.split(" ");
    if (arr[0].includes("a") && arr[1].includes("few")) {
      return `1m`;
    } else if (arr[0].includes("a") && !arr[1].includes("month")) {
      return `1${arr[1][0]}`;
    } else if (arr[0].includes("a") && arr[1].includes("month")) {
      return `4w`;
    } else if (arr[1].includes("min")) {
      return `${arr[0]}m`;
    } else if (arr[1].includes("hour")) {
      return `${arr[0]}h`;
    } else if (arr[1].includes("day")) {
      return `${arr[0]}d`;
    } else if (arr[1].includes("week")) {
      return `${arr[0]}w`;
    } else if (arr[1].includes("month")) {
      return `${arr[0] * 4}w`;
    } else if (arr[1].includes("year")) {
      return `${arr[0]}y`;
    }
  };

  return (
    <Wrapper>
      <MinHeader>
        <span onClick={goBack}>
          <HeaderBackButton />
        </span>
        <div>Photo</div>
        <span></span>
      </MinHeader>
      <Post>
        <Header>
          <Link to={`/${user.username}`}>
            <Avatar size="sm" url={user.avatar} />
          </Link>
          <UserColumn>
            <FollowHolder>
              <UsernameLink to={`/${user.username}`}>
                <FatText text={user.username} />
              </UsernameLink>
              {!user.isFollowing && !user.isSelf && (
                <>
                  <span>•</span>
                  <FollowButton
                    myId={me.id}
                    id={user.id}
                    isFollowing={user.isFollowing}
                  />
                </>
              )}
            </FollowHolder>
            {location && <Location>{location}</Location>}
          </UserColumn>
          <p onClick={openModal}>
            <PostOptions />
          </p>
        </Header>
        <Files onDoubleClick={toggleLike}>
          {files &&
            files.map((file, index) => (
              <File
                key={file.id}
                src={file.url}
                showing={index === currentItem}
              />
            ))}
        </Files>
        <Meta>
          <Buttons>
            <Button onClick={toggleLike}>
              {isLiked ? <HeartFull /> : <HeartEmpty />}
            </Button>
            <Button>
              <CommentIcon />
            </Button>
          </Buttons>
          <FatText text={likeCount === 1 ? "1 like" : `${likeCount} likes`} />
          <Caption>
            <Link to={`/${user.username}`}>
              <FatText text={user.username} />
            </Link>
            {caption}
          </Caption>
          {comments && (
            <Comments>
              {comments.map((comment) => (
                <Comment key={comment.id}>
                  <Link to={`/${comment.user.username}`}>
                    <FatText text={comment.user.username} />
                  </Link>
                  {comment.text}
                </Comment>
              ))}
              {selfComments.map((comment) => (
                <Comment key={comment.id}>
                  <Link to={`/${comment.user.username}`}>
                    <FatText text={comment.user.username} />
                  </Link>
                  {comment.text}
                </Comment>
              ))}
            </Comments>
          )}
          <Timestamp>{moment(createdAt).fromNow()}</Timestamp>
        </Meta>
        <CommentHolder>
          <img src={me.avatar} width="26" height="26" alt="avatar" />
          <div>
            <Textarea
              id="usercomment"
              onKeyPress={onKeyPress}
              placeholder={`Add a comment...`}
              value={newComment.value}
              onChange={newComment.onChange}
            />
            {newComment.value.length < 1 && <p id="postComment">Post</p>}
            {newComment.value.length > 0 && <p onClick={onPostClick}>Post</p>}
          </div>
        </CommentHolder>
        <Timestamp2>{moment(createdAt).fromNow()}</Timestamp2>
      </Post>

      <Post2>
        <Files2 onDoubleClick={toggleLike}>
          {files &&
            files.map((file, index) => (
              <File2
                key={file.id}
                src={file.url}
                showing={index === currentItem}
              />
            ))}
        </Files2>
        <Info>
          <Header>
            <Link to={`/${user.username}`}>
              <Avatar size="sm" url={user.avatar} />
            </Link>
            <UserColumn>
              <FollowHolder>
                <UsernameLink to={`/${user.username}`}>
                  <FatText text={user.username} />
                </UsernameLink>
                {!user.isFollowing && !user.isSelf && (
                  <>
                    <span>•</span>
                    <FollowButton
                      myId={me.id}
                      id={user.id}
                      isFollowing={user.isFollowing}
                    />
                  </>
                )}
              </FollowHolder>
              {location && <Location>{location}</Location>}
            </UserColumn>
            <p onClick={openModal}>
              <PostOptions />
            </p>
          </Header>
          <Caption>
            <Link to={`/${user.username}`}>
              <Avatar url={user.avatar} size="sm" />
            </Link>
            <AllText>
              <span id="topspan">
                <Link to={`/${user.username}`}>
                  <FatText text={user.username} />
                </Link>
                <p>
                  <p id="gapcreate">{" • "}</p>
                  <p>{getDate(createdAt)}</p>
                </p>
              </span>
              <div>{caption}</div>
            </AllText>
          </Caption>
          {selfComments.map((comment) => (
            <Comment key={comment.id}>
              <Link to={`/${comment.user.username}`}>
                <Avatar url={user.avatar} size="sm" />
              </Link>
              <AllText>
                <span id="topspan">
                  <Link to={`/${comment.user.username}`}>
                    <FatText text={comment.user.username} />
                  </Link>
                  <p>
                    <p id="gapcreate">{" • "}</p>
                    <p>{getDate(comment.createdAt)}</p>
                  </p>
                </span>
                <div>{comment.text}</div>
              </AllText>
            </Comment>
          ))}
          {comments && (
            <CommentsWrap>
              <Comments>
                {comments.length < 1 && 
                  <div id="nocomments">No comments yet</div>
                }
                {comments.map((comment) => (
                  <Comment key={comment.id}>
                    <Link to={`/${comment.user.username}`}>
                      <Avatar url={comment.user.avatar} size="sm" />
                    </Link>
                    <AllText>
                      <span id="topspan">
                        <Link to={`/${comment.user.username}`}>
                          <FatText text={comment.user.username} />
                        </Link>
                        <p>
                          <p id="gapcreate">{" • "}</p>
                          <p>{getDate(comment.createdAt)}</p>
                        </p>
                      </span>
                      <div>{comment.text}</div>
                    </AllText>
                  </Comment>
                ))}
              </Comments>
            </CommentsWrap>
          )}
          <MetaHolder>
            <Meta>
              <Buttons>
                <Button onClick={toggleLike}>
                  {isLiked ? <HeartFull /> : <HeartEmpty />}
                </Button>
                <Button>
                  <CommentIcon />
                </Button>
              </Buttons>
              <FatText
                text={likeCount === 1 ? "1 like" : `${likeCount} likes`}
              />
              <Timestamp>{moment(createdAt).fromNow()}</Timestamp>
            </Meta>
            <CommentHolder>
              <img src={me.avatar} width="26" height="26" alt="avatar" />
              <div>
                <Textarea
                  id="usercomment"
                  onKeyPress={onKeyPress}
                  placeholder={`Add a comment...`}
                  value={newComment.value}
                  onChange={newComment.onChange}
                  autoFocus
                />
                {newComment.value.length < 1 && <p id="postComment">Post</p>}
                {newComment.value.length > 0 && (
                  <p onClick={onPostClick}>Post</p>
                )}
              </div>
            </CommentHolder>
          </MetaHolder>
        </Info>
      </Post2>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Post Modal"
      >
        <ModalWrapper>
          {user.isSelf ? (
            <>
              <div onClick={openDeleteModal} id="profremove">
                Delete
              </div>
              <div onClick={openEditModal} id="profupload">
                Edit
              </div>
              <div onClick={closeModal} id="profcancel">
                Cancel
              </div>
            </>
          ) : (
            <>
              {user.isFollowing && (
                <div onClick={closeModal} id="profremove">
                  <FollowButton
                    myId={me.id}
                    id={user.id}
                    isFollowing={user.isFollowing}
                  />
                </div>
              )}
              {!user.isFollowing && (
                <div onClick={closeModal} id="profremove2">
                  <FollowButton
                    myId={me.id}
                    id={user.id}
                    isFollowing={user.isFollowing}
                  />
                </div>
              )}
              <div onClick={closeModal} id="profcancel">
                Cancel
              </div>
            </>
          )}
        </ModalWrapper>
      </Modal>
      <Modal
        isOpen={deleteModal}
        onRequestClose={closeDeleteModal}
        style={customStyles}
        contentLabel="Post Modal"
      >
        <ModalWrapper>
          <h1>Delete Post?</h1>
          <div onClick={deletePost} id="profremove">
            Delete
          </div>
          <div onClick={closeDeleteModal} id="profcancel">
            Cancel
          </div>
        </ModalWrapper>
      </Modal>
      <Modal
        isOpen={editModal}
        onRequestClose={closeEditModal}
        style={customStyles}
        contentLabel="Post Modal"
      >
        <ModalWrapper2>
          <h1>Edit Post</h1>
          <div id="captionedit">
            <span>Caption:</span>
            <Textarea
              id="caption"
              name="caption"
              placeholder={"Write a caption..."}
              onChange={updateState}
              value={captionInput}
            />
          </div>
          {locationInput.length < 1 ? (
            <div onClick={openLocationModal} id="location">
              <p>Add Location</p>
              <span id="headerbtn">
                <HeaderBackButton />
              </span>
            </div>
          ) : (
            <div id="location">
              <h3>Location:</h3>
              <p id="locationset">{locationInput}</p>
              <span onClick={removeLocation}>Remove</span>
              <h2 onClick={openLocationModal}>Edit</h2>
            </div>
          )}
          <div onClick={editPostSubmit} id="profupload">
            Submit
          </div>
          <div onClick={closeEditModal} id="profcancel">
            Cancel
          </div>
        </ModalWrapper2>
      </Modal>
      <Modal
        isOpen={locationModal}
        onRequestClose={closeLocationModal}
        style={customStyles}
        contentLabel="Room Modal"
      >
        <ModalWrapper3>
          <ModalHeader3>
            <div>
              <span onClick={closeLocationModal}>
                <CancelButton size={20} />
              </span>
            </div>
            <h1>Locations</h1>
            <div></div>
          </ModalHeader3>
          <ModalMid3>
            <PlacesAutocomplete
              value={locationFind}
              onChange={setLocationFind}
              onSelect={handleLocation}
            >
              {({
                getInputProps,
                suggestions,
                getSuggestionItemProps,
                loading,
              }) => (
                <div id="search">
                  <input
                    {...getInputProps({ placeholder: "Search" })}
                    autoFocus
                  />
                  <div className="autocomplete-dropdown">
                    {loading && <div id="searching-wait">Searching...</div>}
                    {suggestions.map((suggestion) => {
                      const className = "suggestion-item";
                      const style = suggestion.active
                        ? { backgroundColor: "#fafafa", cursor: "pointer" }
                        : { backgroundColor: "#ffffff", cursor: "pointer" };
                      return (
                        <div
                          key={suggestion.placeId}
                          {...getSuggestionItemProps(suggestion, {
                            className,
                            style,
                          })}
                        >
                          <div id="totalshow">
                            <h1>
                              <LocationLogo />
                            </h1>
                            <div>
                              <span>
                                {suggestion.formattedSuggestion.mainText}
                              </span>
                              <p>
                                {suggestion.formattedSuggestion.secondaryText}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </PlacesAutocomplete>
          </ModalMid3>
        </ModalWrapper3>
      </Modal>
    </Wrapper>
  )};
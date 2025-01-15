import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import {jwtDecode} from 'jwt-decode';

const PostWrapper = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h4`
  font-size: 20px;
  margin-bottom: 10px;
`;

const Content = styled.p`
  font-size: 16px;
  margin-bottom: 10px;
`;

const CommentsSection = styled.div`
  margin-top: 20px;
`;

const CommentInput = styled.textarea`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  font-size: 14px;
`;

const Comment = styled.div`
  background: #f9f9f9;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const LikeButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'liked',
})`
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: ${(props) => (props.liked ? '#ff5722' : '#007bff')};
  font-size: 20px;
  margin-right: 8px;
`;

const Posts = ({ workshopId }) => {
  const [posts, setPosts] = useState([]);
  const [newComments, setNewComments] = useState('');
  const [showAllComments, setShowAllComments] = useState({}); 
  const token = localStorage.getItem('token');
  const [editingComment, setEditingComment] = useState(null); // ID редактируемого комментария
  const [editingContent, setEditingContent] = useState('');
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});

  const userId = token ? jwtDecode(token).nameid : null;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:5109/api/AutoRepairShop/${workshopId}/posts`);
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    if (workshopId) {
      fetchPosts();
    }
  }, [workshopId]);

  // Загружаем комментарии для постов
  useEffect(() => {
    const fetchComments = async () => {
      try {
        // Для каждого поста можно отправить запрос для получения комментариев
        const postsWithComments = await Promise.all(
          posts.map(async (post) => {
            const response = await axios.get(`http://localhost:5109/api/Post/${post.id}/comments`);
            return { ...post, comments: response.data };
          })
        );
        setPosts(postsWithComments);  // Обновляем состояние с комментариями
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    // Если у нас есть посты, загружаем их комментарии
    if (posts.length > 0) {
      fetchComments();
    }
  }, [posts.length]);

  // useEffect(() => {
  //   const fetchLikes = async () => {
  //     try {
  //       const updatedLikedPosts = {};
  //       const updatedLikeCounts = {};

  //       for (const post of posts) {
  //         const [isLikedResponse, countLikesResponse] = await Promise.all([
  //           axios.get(`http://localhost:5109/api/Post/${post.id}/isLiked`, {
  //             headers: { Authorization: `Bearer ${token}` },
  //           }),
  //           axios.get(`http://localhost:5109/api/Post/${post.id}/likeCount`),
  //         ]);

  //         updatedLikedPosts[post.id] = isLikedResponse.data; // true/false
  //         updatedLikeCounts[post.id] = countLikesResponse.data; // number
  //       }

  //       setLikedPosts(updatedLikedPosts);
  //       setLikeCounts(updatedLikeCounts);
  //     } catch (err) {
  //       console.error('Error fetching likes:', err);
  //     }
  //   };

  //   if (posts.length > 0) {
  //     fetchLikes();
  //   }
  // }, [posts, token]);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const updatedLikedPosts = {};
        const updatedLikeCounts = {};
  
        for (const post of posts) {
          // Запрос количества лайков для поста
          const countLikesResponse = await axios.get(`http://localhost:5109/api/Post/${post.id}/likeCount`);
          updatedLikeCounts[post.id] = countLikesResponse.data; // Количество лайков
  
          // Запрос на проверку, залайкан ли пост, только если пользователь авторизован
          if (token) {
            try {
              const isLikedResponse = await axios.get(`http://localhost:5109/api/Post/${post.id}/isLiked`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              updatedLikedPosts[post.id] = isLikedResponse.data; // true/false
            } catch (err) {
              console.error(`Error checking if post ${post.id} is liked:`, err);
              updatedLikedPosts[post.id] = false; // По умолчанию не лайкнуто
            }
          }
        }
  
        setLikedPosts(updatedLikedPosts);
        setLikeCounts(updatedLikeCounts);
      } catch (err) {
        console.error('Error fetching likes:', err);
      }
    };
  
    if (posts.length > 0) {
      fetchLikes();
    }
  }, [posts, token]);

  const handleLikeToggle = async (postId) => {
    try {
      const isLiked = likedPosts[postId];

      if (isLiked) {
        await axios.delete(`http://localhost:5109/api/Post/${postId}/like`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLikedPosts((prev) => ({ ...prev, [postId]: false }));
        setLikeCounts((prev) => ({ ...prev, [postId]: prev[postId] - 1 }));
      } else {
        await axios.post(`http://localhost:5109/api/Post/${postId}/like`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` } 
          });
        setLikedPosts((prev) => ({ ...prev, [postId]: true }));
        setLikeCounts((prev) => ({ ...prev, [postId]: prev[postId] + 1 }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  // Обработка изменения комментария
  const handleCommentChange = (postId) => (e) => {
    setNewComments((prev) => ({ ...prev, [postId]: e.target.value }));
  };

  // Добавление нового комментария
  const handleAddComment = async (postId) => {
    const content = newComments[postId]?.trim();
    if (!content) return;

    try {
      await axios.post(
        `http://localhost:5109/api/Post/${postId}/comment`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );


      const response = await axios.get(
        `http://localhost:5109/api/Post/${postId}/comments`
      )
      console.log(response)

      // Обновление комментариев для поста, добавление нового комментария
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return { ...post, comments: response.data};
          }
          return post;
        })
      );

      // Сброс значения поля ввода комментария для этого поста
      setNewComments((prev) => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await axios.delete(`http://localhost:5109/api/Post/${postId}/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.filter((comment) => comment.id !== commentId),
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id); // Устанавливаем ID редактируемого комментария
    setEditingContent(comment.content); // Устанавливаем начальный текст комментария
  };

  const handleSaveEditComment = async (postId, commentId) => {
    try {
      await axios.put(
        `http://localhost:5109/api/Post/${postId}/comment/${commentId}`,
        { content: editingContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId ? { ...comment, content: editingContent } : comment
                ),
              }
            : post
        )
      );

      setEditingComment(null); // Сброс редактируемого комментария
      setEditingContent(''); // Очистка текста редактирования
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const toggleComments = (postId) => {
    setShowAllComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div>
      <h3>Posty</h3>
      {posts.length === 0 ? (
        <p>Brak postów</p>
      ) : (
        posts.map((post) => (
          <PostWrapper key={post.id}>
            <Title>{post.title}</Title>
            <Content>{post.content}</Content>
            
            <LikeButton
              liked={likedPosts[post.id]}
              onClick={() => handleLikeToggle(post.id)}
            >
              {likedPosts[post.id] ? '❤️' : '🤍'}
            </LikeButton>

            {/* Количество лайков */}
            <span>{likeCounts[post.id] || 0} likes</span>

            <CommentsSection>

            {token && (
                <>
                  <CommentInput
                    value={newComments[post.id] || ''}
                    onChange={handleCommentChange(post.id)}
                    placeholder="Dodaj komentarz"
                  />
                  <Button onClick={() => handleAddComment(post.id)}>Dodaj komentarz</Button>
                </>
              )}

              <h5>Komentarze:</h5>
              {/* Показываем только последний комментарий или все комментарии */}
              {post.comments && post.comments.length > 0 ? (
                <div>
                  <div>
                    {showAllComments[post.id] ? (
                      // Если состояние раскрытия комментариев - все, показываем все комментарии
                      post.comments.map((comment) => (
                        <Comment key={comment.id}>
                          <strong>{comment.username}: </strong>
                          {editingComment === comment.id ? (
                            <>
                              <input
                                type="text"
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                              />
                              <Button
                                onClick={() => handleSaveEditComment(post.id, comment.id)}
                              >
                                Zapisz
                              </Button>
                            </>
                          ) : (
                            <p>{comment.content}</p>
                          )}
                          {comment.userId == userId && (
                            <>
                            <Button
                              style={{  marginRight: '8px', backgroundColor: '#931621', color: 'white' }}
                              onClick={() => handleDeleteComment(post.id, comment.id)}
                            >
                              Usuń
                            </Button>
                             {editingComment !== comment.id && (
                              <Button onClick={() => handleEditComment(comment)}>
                                Edytuj
                              </Button>
                            )}
                            </>
                          )}
                        </Comment>
                      ))
                    ) : (
                      // Иначе, показываем только последний комментарий
                      <Comment key={post.comments[post.comments.length - 1].id}>
                        <strong>{post.comments[post.comments.length - 1].username}: </strong>
                        <p>{post.comments[post.comments.length - 1].content}</p>
                      </Comment>
                    )}
                  </div>
                  
                  <Button onClick={() => toggleComments(post.id)}>
                    {showAllComments[post.id] ? 'Ukryj komentarze' : 'Pokaż wszystkie komentarze'}
                  </Button>
                </div>
              ) : (
                <p>Brak komentarzy</p>
              )}

              
            </CommentsSection>
          </PostWrapper>
        ))
      )}
    </div>
  );
};

export default Posts;

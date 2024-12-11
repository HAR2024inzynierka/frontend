import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

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

const LikeButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: ${props => (props.liked ? '#ff5722' : '#007bff')};
  font-size: 20px;
`;

const Posts = ({ workshopId }) => {
  const [posts, setPosts] = useState([]);
  const [newComments, setNewComments] = useState('');
  const [likedPosts, setLikedPosts] = useState([]);
  const [showAllComments, setShowAllComments] = useState({}); 
  const token = localStorage.getItem('token');

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
  }, [posts]);


  // Обработка изменения комментария
  const handleCommentChange = (postId) => (e) => {
    setNewComments((prev) => ({ ...prev, [postId]: e.target.value }));
  };

  // Добавление нового комментария
  const handleAddComment = async (postId) => {
    const content = newComments[postId]?.trim();
    if (!content) return;

    try {
      const response = await axios.post(
        `http://localhost:5109/api/Post/${postId}/comment`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Обновление комментариев для поста, добавление нового комментария
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return { ...post, comments: [...post.comments, response.data] };
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
                <>
                  <div>
                    {showAllComments[post.id] ? (
                      // Если состояние раскрытия комментариев - все, показываем все комментарии
                      post.comments.map((comment) => (
                        <Comment key={comment.id}>
                          <p>{comment.content}</p>
                        </Comment>
                      ))
                    ) : (
                      // Иначе, показываем только последний комментарий
                      <Comment key={post.comments[post.comments.length - 1].id}>
                        <p>{post.comments[post.comments.length - 1].content}</p>
                      </Comment>
                    )}
                  </div>
                  
                  <Button onClick={() => toggleComments(post.id)}>
                    {showAllComments[post.id] ? 'Ukryj komentarze' : 'Pokaż wszystkie komentarze'}
                  </Button>
                </>
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

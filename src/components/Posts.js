import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { jwtDecode } from "jwt-decode";

//Stylizowane komponenty

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
  shouldForwardProp: (prop) => prop !== "liked",
})`
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: ${(props) => (props.liked ? "#ff5722" : "#007bff")};
  font-size: 20px;
  margin-right: 8px;
`;

const Posts = ({ workshopId }) => {
  // Stany do przechowywania danych postów, polubień, komentarze 
  const [posts, setPosts] = useState([]);
  const [newComments, setNewComments] = useState("");
  const [showAllComments, setShowAllComments] = useState({});
  const token = localStorage.getItem("token");
  const [editingComment, setEditingComment] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});

  // Dekodowanie identyfikatora użytkownika z tokena
  const userId = token ? jwtDecode(token).nameid : null;

  // Pobieranie postów dla danego warsztatu
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Wysłanie żądania do API w celu pobrania postów danego warsztatu
        const response = await axios.get(
          `http://localhost:5109/api/AutoRepairShop/${workshopId}/posts`
        );
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    if (workshopId) {
      fetchPosts();
    }
  }, [workshopId]);

  // Pobieranie komentarzy dla każdego posta
  useEffect(() => {
    const fetchComments = async () => {
      try {
        // Pobranie komentarzy dla każdego posta w sposób równoległy
        const postsWithComments = await Promise.all(
          posts.map(async (post) => {
            const response = await axios.get(
              `http://localhost:5109/api/Post/${post.id}/comments`
            );
            return { ...post, comments: response.data };
          })
        );
        setPosts(postsWithComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    // Pobranie komentarzy tylko, gdy istnieją posty
    if (posts.length > 0) {
      fetchComments();
    }
  }, [posts.length]);

  // Pobieranie danych o polubieniach i ich liczbie
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const updatedLikedPosts = {};
        const updatedLikeCounts = {};

        for (const post of posts) {
          // Pobranie liczby polubień dla posta
          const countLikesResponse = await axios.get(
            `http://localhost:5109/api/Post/${post.id}/likeCount`
          );
          updatedLikeCounts[post.id] = countLikesResponse.data;

          // Sprawdzenie, czy użytkownik polubił dany post (jeśli zalogowany)
          if (token) {
            try {
              const isLikedResponse = await axios.get(
                `http://localhost:5109/api/Post/${post.id}/isLiked`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              updatedLikedPosts[post.id] = isLikedResponse.data; // true/false
            } catch (err) {
              console.error(`Error checking if post ${post.id} is liked:`, err);
              updatedLikedPosts[post.id] = false; // Domyślnie brak polubienia
            }
          }
        }

        setLikedPosts(updatedLikedPosts);
        setLikeCounts(updatedLikeCounts);
      } catch (err) {
        console.error("Error fetching likes:", err);
      }
    };

    if (posts.length > 0) {
      fetchLikes();
    }
  }, [posts, token]);

  // Funkcja obsługująca polubienia/odlubienia postów
  const handleLikeToggle = async (postId) => {
    try {
      const isLiked = likedPosts[postId];

      if (isLiked) {
        // Odlubienie posta
        await axios.delete(`http://localhost:5109/api/Post/${postId}/like`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLikedPosts((prev) => ({ ...prev, [postId]: false }));
        setLikeCounts((prev) => ({ ...prev, [postId]: prev[postId] - 1 }));
      } else {
        // Polubienie posta
        await axios.post(
          `http://localhost:5109/api/Post/${postId}/like`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setLikedPosts((prev) => ({ ...prev, [postId]: true }));
        setLikeCounts((prev) => ({ ...prev, [postId]: prev[postId] + 1 }));
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // Obsługa zmiany treści nowego komentarza
  const handleCommentChange = (postId) => (e) => {
    setNewComments((prev) => ({ ...prev, [postId]: e.target.value }));
  };

  // Obsługa dodawania nowego komentarza
  const handleAddComment = async (postId) => {
    const content = newComments[postId]?.trim();
    if (!content) return;

    try {
      // Wysłanie żądania do API w celu dodania komentarza
      await axios.post(
        `http://localhost:5109/api/Post/${postId}/comment`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Pobranie zaktualizowanej listy komentarze
      const response = await axios.get(
        `http://localhost:5109/api/Post/${postId}/comments`
      );
      console.log(response);

      // Aktualizacja komentarzy do postu, dodanie nowego komentarza
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return { ...post, comments: response.data };
          }
          return post;
        })
      );

      setNewComments((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Obsługa usuwania komentarza
  const handleDeleteComment = async (postId, commentId) => {
    try {
      // Wysłanie żądania do API w celu usunięcia komentarza
      await axios.delete(
        `http://localhost:5109/api/Post/${postId}/comment/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.filter(
                  (comment) => comment.id !== commentId
                ),
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Rozpoczęcie edycji komentarza
  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditingContent(comment.content);
  };

  // Zapis edytowanego komentarza
  const handleSaveEditComment = async (postId, commentId) => {
    try {
      // Wysłanie żądania do API w celu aktualizacji komentarza
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
                  comment.id === commentId
                    ? { ...comment, content: editingContent }
                    : comment
                ),
              }
            : post
        )
      );

      setEditingComment(null); // Сброс редактируемого комментария
      setEditingContent(""); // Очистка текста редактирования
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  // Przełączanie widoczności komentarzy dla posta
  const toggleComments = (postId) => {
    setShowAllComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div>
      {/* Posty */}
      <h3>Posty</h3>
      {posts.length === 0 ? (
        <p>Brak postów</p>
      ) : (
        posts.map((post) => (
          <PostWrapper key={post.id}>
            <Title>{post.title}</Title>
            <Content>{post.content}</Content>

            {/* Przycisk polubienia */}
            <LikeButton
              liked={likedPosts[post.id]}
              onClick={() => handleLikeToggle(post.id)}
            >
              {likedPosts[post.id] ? "❤️" : "🤍"}
            </LikeButton>

            {/* Liczba polubień */}
            <span>{likeCounts[post.id] || 0} likes</span>

            <CommentsSection>
              {token && (
                <>
                  {/* Pole wprowadzania nowego komentarza */}
                  <CommentInput
                    value={newComments[post.id] || ""}
                    onChange={handleCommentChange(post.id)}
                    placeholder="Dodaj komentarz"
                  />
                  <Button onClick={() => handleAddComment(post.id)}>
                    Dodaj komentarz
                  </Button>
                </>
              )}

              {/* Sekcja komentarzy */}
              <h5>Komentarze:</h5>
              {/* Показываем только последний комментарий или все комментарии */}
              {post.comments && post.comments.length > 0 ? (
                <div>
                  <div>
                    {showAllComments[post.id] ? (
                      // Jeśli użytkownik chce zobaczyć wszystkie komentarze, wyświetlamy je
                      post.comments.map((comment) => (
                        <Comment key={comment.id}>
                          <strong>{comment.username}: </strong>
                          {editingComment === comment.id ? (
                            <>
                              {/* Tryb edycji komentarza */}
                              <input
                                type="text"
                                value={editingContent}
                                onChange={(e) =>
                                  setEditingContent(e.target.value)
                                }
                              />
                              <Button
                                onClick={() =>
                                  handleSaveEditComment(post.id, comment.id)
                                }
                              >
                                Zapisz
                              </Button>
                            </>
                          ) : (
                            // Wyświetlenie komentarza
                            <p>{comment.content}</p>
                          )}

                          {/* Jeśli komentarz należy do użytkownika, wyświetl opcje "Usuń" i "Edytuj" */}
                          {comment.userId === Number(userId) && (
                            <>
                              <Button
                                style={{
                                  marginRight: "8px",
                                  backgroundColor: "#931621",
                                  color: "white",
                                }}
                                onClick={() =>
                                  handleDeleteComment(post.id, comment.id)
                                }
                              >
                                Usuń
                              </Button>
                              {editingComment !== comment.id && (
                                <Button
                                  onClick={() => handleEditComment(comment)}
                                >
                                  Edytuj
                                </Button>
                              )}
                            </>
                          )}
                        </Comment>
                      ))
                    ) : (
                      // Jeśli komentarze są ukryte, pokazujemy tylko ostatni komentarz
                      <Comment key={post.comments[post.comments.length - 1].id}>
                        <strong>
                          {post.comments[post.comments.length - 1].username}:{" "}
                        </strong>
                        <p>{post.comments[post.comments.length - 1].content}</p>
                        {console.log(post.comments)}
                      </Comment>
                    )}
                  </div>

                  {/* Przycisk do przełączania widoczności wszystkich komentarzy */}
                  <Button onClick={() => toggleComments(post.id)}>
                    {showAllComments[post.id]
                      ? "Ukryj komentarze"
                      : "Pokaż wszystkie komentarze"}
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

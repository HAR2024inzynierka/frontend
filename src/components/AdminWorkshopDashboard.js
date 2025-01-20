import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";

//Stylizowane komponenty

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const TableHeader = styled.th`
  background-color: #01295f;
  color: white;
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
`;

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
`;

const Button = styled.button`
  background-color: #00509e;
  color: white;
  border: none;
  padding: 10px 15px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #01295f;
  }
`;

const Modal = styled.div`
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
`;

function AdminWorkshopDashboard() {
  // Stany do przechowywania danych warsztatów, terminów, usług, postów i błędów
  const [terms, setTerms] = useState([]); // Lista terminów warsztatu
  const [favours, setFavours] = useState([]); // Lista usług warsztatu
  const [newTerm, setNewTerm] = useState({
    startDate: "",
    endDate: "",
    availability: true,
  }); // Stan dla nowego terminu
  const [newFavour, setNewFavour] = useState({
    typeName: "",
    description: "",
    price: "",
  }); // Stan dla nowej usługi
  const [selectedDate, setSelectedDate] = useState(""); // Wybrana data dla dodania terminów
  const token = localStorage.getItem("token"); // Token z localStorage
  const [error, setError] = useState(null); // Stan dla błędów
  const navigate = useNavigate(); // Hook do nawigacji
  const location = useLocation(); // Hook do lokalizacji
  const { workshop } = location.state || {}; // Pobranie danych warsztatu z lokalizacji
  const [showTerms, setShowTerms] = useState(false); // Stan do kontrolowania widoczności terminów
  const [isEditingWorkshop, setIsEditingWorkshop] = useState(false); // Stan do edytowania warsztatu
  const [editingWorkshop, setEditingWorkshop] = useState(null); // Stan edytowanego warsztatu
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
  }); // Stan dla nowego postu
  const [posts, setPosts] = useState([]); // Lista postów warsztatu
  const [isEditingPost, setIsEditingPost] = useState(false); // Stan do edytowania postu
  const [editingPost, setEditingPost] = useState(null); // Stan edytowanego postu

  // Pobieranie szczegółów warsztatu
  useEffect(() => {
    const fetchDetailsForWorkshop = async (id) => {
      try {
        // Wysłanie żądania do API w celu pobrania terminów
        const termsResponse = await axios.get(
          `http://localhost:5109/api/AutoRepairShop/${id}/terms`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Wysłanie żądania do API w celu pobrania usług
        const favoursResponse = await axios.get(
          `http://localhost:5109/api/AutoRepairShop/${id}/favours`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Wysłanie żądania do API w celu pobrania postów
        const postsResponse = await axios.get(
          `http://localhost:5109/api/AutoRepairShop/${id}/posts`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Ustawianie danych w stanach
        setTerms(termsResponse.data);
        setFavours(favoursResponse.data);
        setPosts(postsResponse.data);
      } catch {
        setError("Nie udało się pobrać szczegółów warsztatu.");
      }
    };

    fetchDetailsForWorkshop(workshop.id);
  }, [token, workshop]);

  // Funkcja usuwająca termin warsztatu
  const handleDeleteTerm = async (id) => {
    try {
      // Wysłanie żądania do API w celu usunięcia terminu
      await axios.delete(`http://localhost:5109/api/admin/Term/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Aktualizacja stanu, usunięcie terminu z listy
      setTerms((prevTerms) => prevTerms.filter((term) => term.id !== id));
    } catch (err) {
      setError("Nie udało się usunąć terminu");
    }
  };

  // Funkcja usuwająca usługę warsztatu
  const handleDeleteFavour = async (id) => {
    try {
      // Wysłanie żądania do API w celu usunięcia usługi
      await axios.delete(`http://localhost:5109/api/admin/Favour/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Aktualizacja stanu, usunięcie usługi z listy
      setFavours((prevFavours) =>
        prevFavours.filter((favour) => favour.id !== id)
      );
    } catch (err) {
      setError("Nie udało się usunąć usługi");
    }
  };

  // Funkcja usuwająca warsztat
  const handleDeleteWorkshop = async (id) => {
    try {
      // Wysłanie żądania do API w celu usunięcia warsztatu
      await axios.delete(`http://localhost:5109/api/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/admin");
    } catch (err) {
      setError("Nie udało się usunąć warsztatu.");
    }
  };

  // Funkcja edytująca dane warsztatu
  const handleEditWorkshop = async (e) => {
    if (e) e.preventDefault();
    try {
      // Wysłanie żądania do API w celu edytowania warsztatu
      await axios.put(
        `http://localhost:5109/api/admin/${workshop.id}`,
        editingWorkshop,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Zamknięcie trybu edycji
      setIsEditingWorkshop(false);

      // Pobranie nowych danych warsztatu po edycji
      const response = await axios.get(
        `http://localhost:5109/api/AutoRepairShop/${workshop.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Zaktualizowanie stanu w lokalizacji z nowymi danymi warsztatu
      navigate(location.pathname, {
        state: { workshop: response.data },
      });
    } catch (err) {
      setError("Nie udało się zaktualizować warsztatu.");
    }
  };

  // Funkcja dodająca nowy termin do warsztatu
  const handleAddTerm = async () => {
    try {
      // Wysłanie żądania do API w celu dodania terminu
      await axios.post(
        "http://localhost:5109/api/admin/Term/add",
        { ...newTerm, autoServiceId: workshop.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Pobranie zaktualizowanej listy terminów
      const response = await axios.get(
        `http://localhost:5109/api/AutoRepairShop/${workshop.id}/terms`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTerms(response.data);
      setNewTerm({ startDate: "", endDate: "", availability: true });
    } catch {
      setError("Nie udało się dodać terminu.");
    }
  };

  // Funkcja dodająca terminy dla wybranego dnia
  const handleAddTermsForDay = async () => {
    if (!selectedDate) {
      alert("Wybierz datę");
      return;
    }

    try {
      // Wysłanie żądania do API w celu dodania terminów na wybrany dzień
      await axios.post(
        "http://localhost:5109/api/admin/Term/term-for-day",
        {
          autoServiceId: workshop.id,
          day: selectedDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Pobranie zaktualizowanej listy terminów
      const response = await axios.get(
        `http://localhost:5109/api/AutoRepairShop/${workshop.id}/terms`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newTerms = response.data;
      setTerms(newTerms);

      alert("Terminy zostały pomyślnie dodane!");
    } catch (error) {
      console.error("Błąd podczas dodawania terminów:", error);
      alert("Błąd podczas dodawania terminów");
    }
  };

  // Funkcja dodająca nową usługę do warsztatu
  const handleAddFavour = async () => {
    const preparedFavour = {
      ...newFavour,
      price: parseFloat(newFavour.price),
      autoServiceId: workshop.id,
    };

    try {
      // Wysłanie żądania do API w celu dodania usługi
      await axios.post(
        `http://localhost:5109/api/admin/Favour/add`,
        preparedFavour,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Pobranie zaktualizowanej listy usług
      const response = await axios.get(
        `http://localhost:5109/api/AutoRepairShop/${workshop.id}/favours`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFavours(response.data);
      setNewFavour({ typeName: "", description: "", price: "" }); // Reset formularza
    } catch (error) {
      setError("Nie udało się dodać usługi.");
      console.error("Błąd podczas dodawania usługi:", error.response?.data);
    }
  };

  // Funkcja otwierająca modal do edytowania warsztatu
  const handleOpenEditWorkshopModal = () => {
    setEditingWorkshop({
      email: workshop.email,
      address: workshop.address,
      phoneNumber: workshop.phoneNumber,
    });
    setIsEditingWorkshop(true);
  };

  // Funkcja otwierająca modal do edytowania postu
  const handleOpenEditPostModal = async (id) => {
    try {
      // Wysłanie żądania do API w celu pobrania postu
      const response = await axios.get(`http://localhost:5109/api/Post/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const post = response.data;
      setEditingPost({
        id: post.id,
        title: post.title,
        content: post.content,
      });
      setIsEditingPost(true);
    } catch (error) {
      setError("Nie udało się edytować postu");
    }
  };

  // Funkcja dodająca nowy post
  const handleAddPost = async () => {
    const preparedPost = {
      ...newPost,
      autoRepairShopId: workshop.id,
    };

    try {
      // Wysłanie żądania do API w celu dodania nowego postu
      await axios.post("http://localhost:5109/api/admin/post", preparedPost, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Pobranie zaktualizowanej listy postów
      const updatedPosts = await axios.get(
        `http://localhost:5109/api/AutoRepairShop/${workshop.id}/posts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPosts(updatedPosts.data);
      setNewPost({ title: "", content: "", autoRepairShopId: "" });
    } catch (err) {
      setError("Nie udało się dodać postu.");
    }
  };

  // Funkcja edytująca istniejący post
  const handleEditPost = async (id) => {
    const preparedPost = {
      title: editingPost.title,
      content: editingPost.content,
      autoRepairShopId: workshop.id,
    };

    try {
      // Zakończenie trybu edycji
      setIsEditingPost(false);

      // Wysłanie żądania do API w celu zaktualizowania postu
      await axios.put(
        `http://localhost:5109/api/admin/post/${id}`,
        preparedPost,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Pobranie zaktualizowanej listy postów
      const updatedPosts = await axios.get(
        `http://localhost:5109/api/AutoRepairShop/${workshop.id}/posts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPosts(updatedPosts.data);
    } catch (err) {
      setError("Nie udało się zaktualizować warsztatu.");
    }
  };

  // Funkcja usuwająca post
  const handleDeletePost = async (id) => {
    try {
      // Wysłanie żądania do API w celu usunięcia postu
      await axios.delete(`http://localhost:5109/api/admin/post/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    } catch (err) {
      setError("Nie udało się usunąć usługi");
    }
  };

  return (
    <div>
      {/* Szczegóły Warsztatu */}
      {workshop && (
        <div>
          <h2>Szczegóły Warsztatu</h2>
          <p>
            <strong>ID:</strong> {workshop.id}
          </p>
          <p>
            <strong>Email:</strong> {workshop.email}
          </p>
          <p>
            <strong>Adres:</strong> {workshop.address}
          </p>
          <p>
            <strong>Numer Telefonu:</strong> {workshop.phoneNumber}
          </p>

          {/* Sekcja Terminów */}
          <div>
            <h3>Terminy</h3>
            <Button onClick={() => setShowTerms((prev) => !prev)}>
              {showTerms ? "Ukryj Terminy" : "Pokaż Terminy"}
            </Button>
            <br />
            {showTerms && (
              <Table>
                <thead>
                  <tr>
                    <TableHeader>ID</TableHeader>
                    <TableHeader>Data Rozpoczęcia</TableHeader>
                    <TableHeader>Data Zakończenia</TableHeader>
                    <TableHeader></TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {terms.map((term) => (
                    <tr key={term.id}>
                      <TableCell>{term.id}</TableCell>
                      <TableCell>{term.startDate}</TableCell>
                      <TableCell>{term.endDate}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleDeleteTerm(term.id)}
                          style={{ backgroundColor: "#931621" }}
                        >
                          Usuń
                        </Button>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            {/* Formularz Dodawania Terminu */}
            <input
              type="datetime-local"
              value={newTerm.startDate}
              onChange={(e) =>
                setNewTerm({ ...newTerm, startDate: e.target.value })
              }
            />
            <input
              type="datetime-local"
              value={newTerm.endDate}
              onChange={(e) =>
                setNewTerm({ ...newTerm, endDate: e.target.value })
              }
            />
            <Button onClick={handleAddTerm}>Dodaj Termin</Button>
            <br />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <Button onClick={handleAddTermsForDay}>
              Dodaj terminy na dzień
            </Button>
          </div>

          {/* Sekcja Usług */}
          <div>
            <h3>Usługi</h3>
            <Table>
              <thead>
                <tr>
                  <TableHeader>ID</TableHeader>
                  <TableHeader>Rodzaj</TableHeader>
                  <TableHeader>Koszt</TableHeader>
                  <TableHeader></TableHeader>
                </tr>
              </thead>
              <tbody>
                {favours.map((favour) => (
                  <tr key={favour.id}>
                    <TableCell>{favour.id}</TableCell>
                    <TableCell>{favour.typeName}</TableCell>
                    <TableCell>{favour.price}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleDeleteFavour(favour.id)}
                        style={{ backgroundColor: "#931621" }}
                      >
                        Usuń
                      </Button>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Formularz Dodawania Usługi */}
            <input
              type="text"
              placeholder="Rodzaj Usługi"
              value={newFavour.typeName}
              onChange={(e) =>
                setNewFavour({ ...newFavour, typeName: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Opis usługi"
              maxLength={500}
              value={newFavour.description}
              onChange={(e) =>
                setNewFavour({ ...newFavour, description: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Koszt"
              value={newFavour.price}
              onChange={(e) =>
                setNewFavour({
                  ...newFavour,
                  price: parseFloat(e.target.value) || "",
                })
              }
            />
            <Button onClick={handleAddFavour}>Dodaj Usługę</Button>
          </div>

          {/* Sekcja Postów */}
          <div>
            <h3>Posty</h3>
            <Table>
              <thead>
                <tr>
                  <TableHeader>ID</TableHeader>
                  <TableHeader>Tytuł</TableHeader>
                  <TableHeader>Treść</TableHeader>
                  <TableHeader></TableHeader>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <TableCell>{post.id}</TableCell>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{post.content}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleOpenEditPostModal(post.id)}>
                        Edytuj
                      </Button>
                      <Button
                        onClick={() => handleDeletePost(post.id)}
                        style={{ backgroundColor: "#931621" }}
                      >
                        Usuń
                      </Button>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Formularz Dodawania Postu */}
            <input
              type="text"
              placeholder="Tytuł"
              value={newPost.title}
              onChange={(e) =>
                setNewPost({ ...newPost, title: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Treść"
              value={newPost.content}
              onChange={(e) =>
                setNewPost({ ...newPost, content: e.target.value })
              }
            />
            <Button onClick={() => handleAddPost()}>Dodaj Post</Button>
          </div>

          {/* Przyciski Edycji i Usuwania Warsztatu */}
          <Button
            onClick={handleOpenEditWorkshopModal}
            style={{ backgroundColor: "#00509e" }}
          >
            Edytuj
          </Button>
          <Button
            onClick={() => handleDeleteWorkshop(workshop.id)}
            style={{ backgroundColor: "#931621" }}
          >
            Usuń
          </Button>
          <Button
            onClick={() => navigate("/admin")}
            style={{ backgroundColor: "#01295f" }}
          >
            Zamknij
          </Button>
        </div>
      )}

      {/* Modal Edytowania Warsztatu */}
      {isEditingWorkshop && (
        <Modal>
          <ModalContent>
            <h2>Edytuj Warsztat</h2>
            <form>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  value={editingWorkshop.email}
                  onChange={(e) =>
                    setEditingWorkshop({
                      ...editingWorkshop,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label>Adres:</label>
                <input
                  type="text"
                  value={editingWorkshop.address}
                  onChange={(e) =>
                    setEditingWorkshop({
                      ...editingWorkshop,
                      address: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label>Numer Telefonu:</label>
                <input
                  type="text"
                  value={editingWorkshop.phoneNumber}
                  onChange={(e) =>
                    setEditingWorkshop({
                      ...editingWorkshop,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>
              <Button onClick={handleEditWorkshop}>Zapisz</Button>
              <Button
                onClick={() => setIsEditingWorkshop(false)}
                style={{ backgroundColor: "#931621" }}
              >
                Anuluj
              </Button>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Modal Edytowania Postu */}
      {isEditingPost && (
        <Modal>
          <ModalContent>
            <h2>Edytuj Post</h2>
            <form>
              <div>
                <label>Tytuł:</label>
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label>Treść:</label>
                <input
                  type="text"
                  value={editingPost.content}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      content: e.target.value,
                    })
                  }
                />
              </div>
              <Button onClick={() => handleEditPost(editingPost.id)}>
                Zapisz
              </Button>
              <Button
                onClick={() => setIsEditingPost(false)}
                style={{ backgroundColor: "#931621" }}
              >
                Anuluj
              </Button>
            </form>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}

export default AdminWorkshopDashboard;

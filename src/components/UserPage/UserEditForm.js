import React from "react";
import styled from "styled-components";

const FormContainer = styled.div`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
`;
const FormInput = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;

  &:focus {
    border-color: #01295f;
    outline: none;
  }
`;

const SubmitButton = styled.button`
  background-color: #01295f;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #00509e;
  }
`;

const EditButton = styled.button`
  background-color: #01295f;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  margin-top: 20px;

  &:hover {
    background-color: #00509e;
  }
`;

const CancelButton = styled(EditButton)`
  background-color: #931621;
  margin-left: 15px;

  &:hover {
    background-color: darkred;
  }
`;

const UserEditForm = ({ editedUser, setEditedUser, onSubmit, onCancel }) => (
  <FormContainer>
    <form onSubmit={onSubmit}>
      <FormInput
        type="text"
        value={editedUser.login}
        onChange={(e) =>
          setEditedUser({ ...editedUser, login: e.target.value })
        }
        placeholder="Login"
      />
      <FormInput
        type="email"
        value={editedUser.email}
        onChange={(e) =>
          setEditedUser({ ...editedUser, email: e.target.value })
        }
        placeholder="Email"
      />
      <FormInput
        type="tel"
        value={editedUser.phone}
        onChange={(e) =>
          setEditedUser({ ...editedUser, phone: e.target.value })
        }
        placeholder="Telefon"
      />

      <SubmitButton type="submit">Zapisz zmiany</SubmitButton>
      <CancelButton onClick={onCancel}>Anuluj</CancelButton>
    </form>
  </FormContainer>
);
export default UserEditForm;

import React from "react";
import styled from "styled-components";

const UserInfoCard = styled.div`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  margin-bottom: 20px;
`;

const UserInfoLabel = styled.p`
  font-size: 16px;
  color: #01295f;
  margin: 10px 0;
`;

const UserInfoValue = styled.span`
  color: black;
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

const UserInfoCardComp = ({ user, onEditClick }) => (
  <UserInfoCard>
    <UserInfoLabel>
      <strong>Login: </strong>
      <UserInfoValue>{user.login}</UserInfoValue>
    </UserInfoLabel>
    <UserInfoLabel>
      <strong>Email: </strong>
      <UserInfoValue>{user.email}</UserInfoValue>
    </UserInfoLabel>
    <UserInfoLabel>
      <strong>Telefon: </strong>{" "}
      <UserInfoValue>{user.phone || "Brak"}</UserInfoValue>
    </UserInfoLabel>
    <EditButton onClick={onEditClick}>Edytuj dane</EditButton>
  </UserInfoCard>
);

export default UserInfoCardComp;

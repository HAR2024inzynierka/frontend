import React from 'react';
import styled from 'styled-components';

const WorkshopPageContainer = styled.div`
  padding: 20px;
`;

const WorkshopList = styled.select`
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: white;
`;

const WorkshopPage = ({ workshops, selectedWorkshop, setSelectedWorkshop }) => {
  const handleWorkshopChange = (e) => {
    setSelectedWorkshop(e.target.value);
  };

  return (
    <WorkshopPageContainer>
      <h2>Wybierz warsztat</h2>
      <WorkshopList onChange={handleWorkshopChange} value={selectedWorkshop}>
        <option value="">Wybierz warsztat</option>
        {workshops.map((workshop) => (
          <option key={workshop.id} value={workshop.id}>
            {workshop.name}
          </option>
        ))}
      </WorkshopList>
      {selectedWorkshop && <p>Wybrano warsztat: {selectedWorkshop}</p>}
    </WorkshopPageContainer>
  );
};

export default WorkshopPage;

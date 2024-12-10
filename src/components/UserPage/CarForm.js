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

const CarForm = ({
  carData,
  setCarData,
  onSubmit,
  error,
  submitButtonText,
}) => (
  <FormContainer>
    <form onSubmit={onSubmit}>
      <FormInput
        type="text"
        value={carData.brand}
        onChange={(e) => setCarData({ ...carData, brand: e.target.value })}
        placeholder="Marka"
      />
      <FormInput
        type="text"
        value={carData.model}
        onChange={(e) => setCarData({ ...carData, model: e.target.value })}
        placeholder="Model"
      />
      <FormInput
        type="text"
        value={carData.registrationNumber}
        onChange={(e) =>
          setCarData({
            ...carData,
            registrationNumber: e.target.value,
          })
        }
        placeholder="Nr rejestracyjny"
      />
      <FormInput
        type="number"
        value={carData.capacity}
        onChange={(e) => setCarData({ ...carData, capacity: e.target.value })}
        placeholder="Pojemność"
      />
      <FormInput
        type="number"
        value={carData.power}
        onChange={(e) => setCarData({ ...carData, power: e.target.value })}
        placeholder="Moc"
      />
      <FormInput
        type="text"
        value={carData.vin}
        onChange={(e) => setCarData({ ...carData, vin: e.target.value })}
        placeholder="VIN"
      />
      <FormInput
        type="number"
        value={carData.productionYear}
        onChange={(e) =>
          setCarData({ ...carData, productionYear: e.target.value })
        }
        placeholder="Rok produkcji"
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <SubmitButton type="submit">{submitButtonText}</SubmitButton>
    </form>
  </FormContainer>
);

export default CarForm;

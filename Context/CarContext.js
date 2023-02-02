import React, { createContext, useState } from 'react';

const CarContext = createContext();

const CarContextProvider = ({ children }) => {

  const [carNames, setCarNames] = useState([]);

  return (
    <CarContext.Provider value={{ carNames, setCarNames }}>
      {children}
    </CarContext.Provider>
  );
};

export { CarContext, CarContextProvider };
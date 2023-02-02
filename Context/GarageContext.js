import React, { createContext, useState } from 'react';

const GarageContext = createContext();

const GarageContextProvider = ({ children }) => {

  const [garageNames, setGarageNames] = useState([]);

  return (
    <GarageContext.Provider value={{ garageNames, setGarageNames }}>
      {children}
    </GarageContext.Provider>
  );
};

export { GarageContext, GarageContextProvider };
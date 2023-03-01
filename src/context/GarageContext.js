import React, { createContext, useState } from 'react';

const GarageContext = createContext();

const GarageContextProvider = ({ children }) => {

  const [garageObjects, setGarageObjects] = useState([]);

  return (
    <GarageContext.Provider value={{ garageObjects, setGarageObjects }}>
      {children}
    </GarageContext.Provider>
  );
};

export { GarageContext, GarageContextProvider };
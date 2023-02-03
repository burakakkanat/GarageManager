import React, { createContext, useState } from 'react';

const VehicleContext = createContext();

const VehicleContextProvider = ({ children }) => {

  const [vehicleNames, setVehicleNames] = useState([]);

  return (
    <VehicleContext.Provider value={{ vehicleNames, setVehicleNames }}>
      {children}
    </VehicleContext.Provider>
  );
};

export { VehicleContext, VehicleContextProvider };
import React, { createContext, useState } from 'react';

const VehicleContext = createContext();

const VehicleContextProvider = ({ children }) => {

  const [vehicleObjects, setVehicleObjects] = useState([]);

  return (
    <VehicleContext.Provider value={{ vehicleObjects, setVehicleObjects }}>
      {children}
    </VehicleContext.Provider>
  );
};

export { VehicleContext, VehicleContextProvider };
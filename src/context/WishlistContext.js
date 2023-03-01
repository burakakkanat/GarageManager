import React, { createContext, useState } from 'react';

const WishlistContext = createContext();

const WishlistContextProvider = ({ children }) => {

  const [wishlistObjects, setWishlistObjects] = useState([]);

  return (
    <WishlistContext.Provider value={{ wishlistObjects, setWishlistObjects }}>
      {children}
    </WishlistContext.Provider>
  );
};

export { WishlistContext, WishlistContextProvider };
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FavContext = createContext(null);

export const FavProvider = ({ children }) => {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState([]);

  useEffect(() => {
    if (user && user.email) {
      const stored = localStorage.getItem(`favs_${user.email}`);
      setFavourites(stored ? JSON.parse(stored) : []);
    } else {
      setFavourites([]);
    }
  }, [user]);

  const addFav = (id) => {
    if (!user) return;
    const newFavs = [...favourites, id];
    setFavourites(newFavs);
    localStorage.setItem(`favs_${user.email}`, JSON.stringify(newFavs));
  };

  const removeFav = (id) => {
    if (!user) return;
    const newFavs = favourites.filter(x => x !== id);
    setFavourites(newFavs);
    localStorage.setItem(`favs_${user.email}`, JSON.stringify(newFavs));
  };

  return (
    <FavContext.Provider value={{ favourites, addFav, removeFav }}>
      {children}
    </FavContext.Provider>
  );
};

export const useFav = () => useContext(FavContext);

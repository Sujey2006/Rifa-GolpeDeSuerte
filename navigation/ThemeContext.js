import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [mainColor, setMainColor] = useState('#2d8f3a'); // Color inicial verde

    // Cargar color guardado al iniciar
    useEffect(() => {
        const loadColor = async () => {
            const savedColor = await AsyncStorage.getItem('appMainColor');
            if (savedColor) setMainColor(savedColor);
        };
        loadColor();
    }, []);

    // Guardar color
    const changeMainColor = async (color) => {
        setMainColor(color);
        await AsyncStorage.setItem('appMainColor', color);
    };

    return (
        <ThemeContext.Provider value={{ mainColor, changeMainColor }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

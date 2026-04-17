import { createContext, useContext } from "react";

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context){
        throw new Error('Acá va un mensaje epecifico de error en torno al contexto')
    }
    return context;
};
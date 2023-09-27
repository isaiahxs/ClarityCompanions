import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [currentLanguage, setCurrentLanguage] = useState('english');

    return (
        <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}

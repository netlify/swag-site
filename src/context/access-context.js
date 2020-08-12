import React, { createContext, useEffect, useState, useContext } from 'react';

const AccessContext = createContext();

export const AccessProvider = ({ children }) => {
  const [access, setAccess] = useState();

  return (
    <AccessContext.Provider value={{ access, setAccess }}>
      {children}
    </AccessContext.Provider>
  );
};

export const useAccess = () => {
  const { access, setAccess } = useContext(AccessContext);

  const initializeSetting = ({
    localStorageKey,
    setValue,
    value,
    fallbackValue,
  }) => {
    if (typeof value !== 'undefined') return;

    const storedValue = localStorage.getItem(localStorageKey);
    if (storedValue !== null) {
      /*
       * For boolean values, we need to run JSON.parse() or else they’ll be
       * treated like strings. However, if we try to JSON.parse() a plain ol’
       * string, it borks. So this tries to parse first, then falls back to
       * using the string value if that doesn’t work.
       */
      let parsedValue;
      try {
        parsedValue = JSON.parse(storedValue);
      } catch (_) {
        parsedValue = storedValue;
      }

      setValue(parsedValue);
    } else {
      setValue(fallbackValue);
    }
  };

  useEffect(() => {
    initializeSetting({
      localStorageKey: 'swag.netlify.com:netlify-exclusive',
      setValue: setAccess,
      value: access,
      fallbackValue: false,
    });
  }, [access, setAccess]);

  const updateAccess = (newAccess) => {
    localStorage.setItem('swag.netlify.com:netlify-exclusive', newAccess);
    setAccess(newAccess);
  };

  return { access, updateAccess };
};

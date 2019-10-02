import React, { createContext, useReducer } from "react";
import { GlobalReducer } from "../red/GlobalReducer";
import { Languages } from "../bus/enu";

export const GlobalContext = new createContext();

export const GlobalContexProvider = ({ children }) => {
	const [Global, Global_Dispatch] = useReducer(GlobalReducer, {
		User: null,
		Language: Languages.Dutch
	});

	return (
		<GlobalContext.Provider value={{ Global, Global_Dispatch }}>
			{children}
		</GlobalContext.Provider>
	);
};

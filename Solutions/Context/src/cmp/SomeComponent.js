import React, { useContext } from "react";
import { Translate } from "../bus/lib";
import { GlobalContext } from "../cnt/GlobalContext";
import { Actions } from "../bus/enu";

export const SomeComponent = () => {
	const { Global, Global_Dispatch } = useContext(GlobalContext);

	const On_Lang_Toggle = iEvent => {
		iEvent.preventDefault();
		Global_Dispatch({ Type: Actions.Toggle_Language });
	};

	return (
		<div>
			<span>{Translate("Welcome", Global.Language)}</span>
			<button onClick={On_Lang_Toggle}>{Global.Language}</button>
		</div>
	);
};

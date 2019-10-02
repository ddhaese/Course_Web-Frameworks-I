import React from "react";
import { SwatchesPicker } from "react-color";

export const Color = ({ Color, Set_Color }) => {
	const Set_Color_Inner = Color_Object => Set_Color(Color_Object.hex);

	return <SwatchesPicker color={Color} onChangeComplete={Set_Color_Inner} />;
};

import React, { useState } from "react";
import "./App.css";
import { Color as ColorComponent } from "./Color";
import { Text as TextComponent } from "./Text";

export function App() {
	const [Color, Set_Color] = useState("#f06292");
	const [Text, Set_Text] = useState("Once upon a time…");

	return (
		<div id="App">
			<ColorComponent Color={Color} Set_Color={Set_Color} />
			<TextComponent Text={Text} Set_Text={Set_Text} />
			<span style={{ color: Color }}>{Text}</span>

		</div>
	);
}

import React from "react";

export const Text = ({Text, Set_Text}) => {
	const Set_Text_Inner = iEvent => {
		Set_Text(iEvent.target.value);
	};

	return (
		<form>
			<input value={Text} onChange={Set_Text_Inner} />
		</form>
	);
};

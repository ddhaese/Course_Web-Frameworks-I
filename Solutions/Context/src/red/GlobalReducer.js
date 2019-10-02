import { Actions, Languages} from "../bus/enu";

export const GlobalReducer = (state, action) => {
	switch (action.Type) {
		case Actions.Toggle_Language:
			let New_Language = null;

			if (state.Language === Languages.Dutch) {
				New_Language = Languages.Chinese
			} else {
				New_Language = Languages.Dutch
			}

			return {
				...state,
				...{ Language: New_Language }
			};
		default:
			return state;
	}
};

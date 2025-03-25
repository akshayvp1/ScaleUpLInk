import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "../../../types/auth/auth.types";

interface InitialStateType {
    tempUser: Partial<IUser> | null;
}

const initialState: InitialStateType = {
    tempUser: null
};

const tempSlice = createSlice({
    name: "tempUser",
    initialState,
    reducers: {
        setTempUser: (state, action: PayloadAction<{ tempUser: Partial<IUser> }>) => {
            state.tempUser = action.payload.tempUser;
        }
    }
});

export const { setTempUser } = tempSlice.actions;
export default tempSlice.reducer;

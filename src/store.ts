import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
export type Filters = { search:string; category:string; payment:string; sort:'date'|'amount'; direction:'asc'|'desc' };
const initialState: Filters = { search:'',category:'all',payment:'all',sort:'date',direction:'desc' };
const slice = createSlice({ name:'filters', initialState, reducers:{ setFilters:(state,action:PayloadAction<Partial<Filters>>)=>Object.assign(state,action.payload), reset:()=>initialState } });
export const { setFilters, reset } = slice.actions; export const store = configureStore({reducer:{filters:slice.reducer}}); export type RootState = ReturnType<typeof store.getState>;

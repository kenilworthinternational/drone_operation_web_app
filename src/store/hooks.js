import { useDispatch, useSelector } from 'react-redux';

// Typed hooks for TypeScript-like safety in JavaScript
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;


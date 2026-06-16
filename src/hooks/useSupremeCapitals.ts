import { useSupremeGame } from './useSupremeGame';
import { checkCountryCapital } from '../utils/validation';

export function useSupremeCapitals() {
    return useSupremeGame({ isMatch: checkCountryCapital });
}

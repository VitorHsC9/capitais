import { useSupremeGame } from './useSupremeGame';
import { checkCountryName } from '../utils/validation';

export function useSupremeCountries() {
    return useSupremeGame({ isMatch: checkCountryName });
}

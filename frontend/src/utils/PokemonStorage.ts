import { Pokemon } from '../types/CoveyTownSocket';

// gets the list of Pokemon that this user has caught
export function getUserPokemon() {
  return JSON.parse(localStorage.getItem('pokemon') ?? '[]') as Pokemon[];
}

// gets the Pokemon that this user has selected to follow them
export function getDisplayedUserPokemon() {
  const index = +(localStorage.getItem('pokemonIndex') ?? '0');
  return getUserPokemon()[index];
}

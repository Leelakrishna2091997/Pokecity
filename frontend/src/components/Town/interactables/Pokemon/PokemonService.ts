/* eslint-disable @typescript-eslint/naming-convention */
import axios from 'axios';
import { nanoid } from 'nanoid';
import { Pokemon } from '../../../../types/CoveyTownSocket';

export const POKEMON_FETCH_ERROR = 'Error fetching Pokemon data';
export const POKEMON_INITIALIZATION_ERROR = 'Must initialize before calling createRandomPokemon';

interface SpritesResponse {
  front_default: string;
  back_default: string;
}

interface StatsResponse {
  base_stat: number;
  stat: { name: string };
}

interface PokemonSpeciesResponse {
  capture_rate: number;
  [key: string]: unknown;
}

interface PokemonResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: SpritesResponse;
  stats: StatsResponse[];
}

type FinalPokemonResponse = PokemonResponse & PokemonSpeciesResponse;

export default class PokemonService {
  private _baseURL: string;

  private _totalPokemon: number;

  private _allPokemon: FinalPokemonResponse[] | undefined;

  constructor() {
    this._baseURL = 'https://pokeapi.co/api/v2';
    this._totalPokemon = 151;
    this._allPokemon = undefined;
  }

  public get allPokemon() {
    return this._allPokemon;
  }

  /**
   * Makes a request to the PokeAPI to fetch all Pokemon and stores them in _allPokemon.
   * @returns void
   */
  initialize(): void {
    if (this._allPokemon) {
      return;
    }
    this._allPokemon = [];
    const promises = [];
    for (let i = 1; i <= this._totalPokemon; i++) {
      promises.push(this._fetchPokemonById(i));
    }
    Promise.all(promises)
      .then(results => {
        results.forEach(pokemon => {
          // Explicitly construct a PokemonResponse object from the fetched data
          const filteredPokemon: FinalPokemonResponse = {
            id: pokemon.id,
            name: pokemon.name,
            height: pokemon.height,
            weight: pokemon.weight,
            sprites: {
              front_default: pokemon.sprites.front_default,
              back_default: pokemon.sprites.back_default,
            },
            stats: pokemon.stats.map(stat => ({
              base_stat: stat.base_stat,
              stat: { name: stat.stat.name },
            })),
            capture_rate: parseFloat((pokemon.capture_rate / 255).toFixed(3)),
          };
          this._allPokemon?.push(filteredPokemon);
        });
      })
      .catch(() => {
        throw new Error(POKEMON_FETCH_ERROR);
      });
  }

  // fetch a specific pokemon by its ID using axios get request
  private async _fetchPokemonById(id: number, retries = 3): Promise<FinalPokemonResponse> {
    try {
      const pokemonUrl = `${this._baseURL}/pokemon/${id}`;
      const pokemonSpeciesUrl = `${this._baseURL}/pokemon-species/${id}`;
      const pokemonResponse = await axios.get<PokemonResponse>(pokemonUrl);
      const pokemonSpeciesResponse = await axios.get<PokemonSpeciesResponse>(pokemonSpeciesUrl);

      const finalPokemonResponseData = {
        ...pokemonResponse.data,
        capture_rate: pokemonSpeciesResponse.data.capture_rate,
      };

      return finalPokemonResponseData;
    } catch (error) {
      if (retries === 0) {
        throw error;
      }
      return this._fetchPokemonById(id, retries - 1);
    }
  }

  /**
   * Used in endpoint (http://localhost:8081/pokemon/random) to retrieve a random Pokemon using
   * the JSON data fetched from the PokeAPI.
   * @returns A random Pokemon configured from JSON to match our Pokemon model.
   */
  public createRandomPokemon(): Pokemon {
    if (!this._allPokemon) {
      throw new Error(POKEMON_INITIALIZATION_ERROR);
    }

    const { id, name, sprites, stats, capture_rate } =
      this._allPokemon[Math.floor(Math.random() * this._allPokemon.length)];
    const generatedStats = this._generateStats(stats);

    return {
      attack: generatedStats.attack,
      defense: generatedStats.defense,
      health: generatedStats.hp,
      speed: generatedStats.speed,
      catchDifficulty: capture_rate,
      name: name,
      sprite: {
        front: sprites.front_default,
        back: sprites.back_default,
      },
      instanceId: nanoid(),
      pokemonId: id,
    };
  }

  private _generateStats(stats: StatsResponse[]): Record<string, number> {
    const result: Record<string, number> = {};
    let totalAttack = 0;
    let totalDefense = 0;
    for (const stat of stats) {
      switch (stat.stat.name) {
        case 'attack': {
          totalAttack += stat.base_stat;
          break;
        }
        case 'special-attack': {
          totalAttack += stat.base_stat;
          break;
        }
        case 'defense': {
          totalDefense += stat.base_stat;
          break;
        }
        case 'special-defense': {
          totalDefense += stat.base_stat;
          break;
        }
        case 'speed': {
          result.speed = stat.base_stat;
          break;
        }
        case 'hp': {
          result.hp = stat.base_stat;
          break;
        }
        default: {
          throw new Error(`Unknown stat type: ${stat.stat.name}`);
        }
      }
    }
    result.attack = Math.floor(totalAttack / 2);
    result.defense = Math.floor(totalDefense / 2);
    return result;
  }
}

export const pokemonService = new PokemonService();
pokemonService.initialize();

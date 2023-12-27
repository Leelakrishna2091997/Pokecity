import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Flex,
  Box,
} from '@chakra-ui/react';
import Image from 'next/image';
import { Pokemon } from '../../../../types/CoveyTownSocket';
import eventsCenter from './EventsCenter';
import { getUserPokemon } from '../../../../utils/PokemonStorage';

// * Renders the Pokemon Scene to Pick a Pokemon of your choice to follow you around the map
// * Click 'p' on the keyboard to open this popup
export default function PokemonPickScene(): JSX.Element {
  const [isPokemonPickSceneShown, setPokemonPickSceneShown] = useState(false);

  const togglePokemonPickSceneShown = () => {
    setPokemonPickSceneShown(prev => !prev);
  };

  const [pokemon, setPokemon] = useState<Pokemon[]>(getUserPokemon());

  useEffect(() => {
    eventsCenter.on('caught-pokemon', () => setPokemon(getUserPokemon()));

    return () => {
      eventsCenter.off('caught-pokemon');
    };
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p') {
        togglePokemonPickSceneShown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function handleOnClose() {
    setPokemonPickSceneShown(false);
  }

  function handleChoosePokemon(index: number) {
    if (index === -1) {
      localStorage.setItem('pokemonIndex', '-1');
      eventsCenter.emit('reload-pokemon');
      handleOnClose();
      return;
    } else {
      localStorage.setItem('pokemonIndex', index.toString());
      eventsCenter.emit('reload-pokemon');
      handleOnClose();
    }
  }

  const activePokemonIndex = Number(localStorage.getItem('pokemonIndex') ?? -1);

  return (
    <Modal isOpen={isPokemonPickSceneShown} onClose={handleOnClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent
        display='flex'
        alignItems='center'
        justifyContent='center'
        textColor='white'
        bgGradient='linear(to-b, gray.800, blue.700)'
        padding='6'>
        <ModalHeader>Pick Your Pokemon!</ModalHeader>
        <ModalCloseButton />
        <Flex direction='row' alignItems='center' justifyContent='center' flexWrap='wrap'>
          {pokemon.map((p, index) => (
            <Box
              key={p.instanceId + index}
              display='flex'
              m={1}
              width='30%'
              border='2px'
              borderRadius='lg'
              alignItems='center'
              justifyContent='center'
              bgColor={activePokemonIndex === index ? 'gray.400' : 'transparent'}
              _hover={{
                bg: 'gray.200',
                cursor: 'pointer',
                transitionDuration: '0.2s',
                transitionTimingFunction: 'ease-in-out',
              }}
              onClick={() => handleChoosePokemon(index)}>
              <img
                width={100}
                height={100}
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.pokemonId}.png`}
                alt={`Pokemon ${p.pokemonId}`}
              />
            </Box>
          ))}
          <Box
            display='flex'
            m={1}
            width='30%'
            border='2px'
            borderRadius='lg'
            alignItems='center'
            justifyContent='center'
            bgColor={activePokemonIndex === -1 ? 'gray.400' : 'transparent'}
            _hover={{
              bg: 'gray.200',
              cursor: 'pointer',
              transitionDuration: '0.2s',
              transitionTimingFunction: 'ease-in-out',
            }}
            onClick={() => handleChoosePokemon(-1)}>
            No Pokemon
          </Box>
        </Flex>
      </ModalContent>
    </Modal>
  );
}

import { nanoid } from 'nanoid';
import { TextButton } from './TextButton';
import { Pokemon } from '../../../../types/CoveyTownSocket';
import eventsCenter from './EventsCenter';
import { getUserPokemon } from '../../../../utils/PokemonStorage';
import { pokemonService } from './PokemonService';

const MISSED_THROW_ATTEMPTS_ALLOWED = 3;

/*
 * This scene is the capture screen when a user randomly encounters a wild Pokemon. It contains the logic
 * for capturing and storing Pokemon.
 */
export default class PokemonCaptureScreen extends Phaser.Scene {
  private _pokemon?: Pokemon;

  private _sliderTween?: Phaser.Tweens.Tween;

  private _messageText?: Phaser.GameObjects.Text;

  private _missedThrowCounter = 0;

  duration = 1000;

  goodZoneWidth = 0.7;

  escapeRate = 0.2;

  // In charge of fetching a random Pokemon from the back-end and loading it
  async fetchPokemon() {
    try {
      this._pokemon = pokemonService.createRandomPokemon();
      this.goodZoneWidth = this._pokemon.catchDifficulty / 2;
      this.duration = 40_000 / this._pokemon.speed;
      this.escapeRate = this._pokemon.defense / 200;
    } catch (e) {
      console.log(e);
    }
  }

  init() {
    this._missedThrowCounter = 0;
  }

  preload() {
    this.load.image('pokeball', '/assets/pokeball.png');
    this.load.image('pokeball-open', '/assets/opened-pokeball.png');
    this.load.image('modal-background', '/assets/modal-background3.png');
    this.load.audio('battle', '/assets/audio/battle-wild.mp3');
    this.load.audio('pokemon-struggling', '/assets/audio/pokemon-struggling.mp3');
    this.load.audio('pokemon-caught', '/assets/audio/pokemon-caught.mp3');
    this.load.audio('pokemon-escape', '/assets/audio/escape.wav');
    this.load.audio('collision', '/assets/audio/collision.wav');
    this.load.audio('get', '/assets/audio/get.wav');
    this.load.audio('miss', '/assets/audio/miss.wav');
    this.load.audio('good-throw', '/assets/audio/good-throw.wav');
  }

  async create() {
    if (!this.scene.isVisible()) {
      return;
    }

    this.fetchPokemon();
    if (!this._pokemon) {
      this.scene.setVisible(false);
      return;
    }

    const bgm = this.sound.add('battle');
    const getFX = this.sound.add('get');
    const caughtFX = this.sound.add('pokemon-caught');
    const escapeFX = this.sound.add('pokemon-escape');
    const missThrowFX = this.sound.add('miss');
    const goodThrowFX = this.sound.add('good-throw');
    bgm.setVolume(0.17);
    bgm.play();
    bgm.setLoop(true);

    const { width, height } = this.scale;

    const containerWidth = 400;
    const containerHeight = 400;

    const midX = width / 2;
    const midY = height / 2;

    const innerRect = this.add
      .rectangle(midX, midY, containerWidth + 5, containerHeight + 5, 0x0)
      .setOrigin(0.5);
    this.add.rectangle(midX, midY, containerWidth, containerHeight, 0xf5f5f5).setOrigin(0.5);

    this.add.image(width / 2, height / 2 - 30, 'modal-background');

    const containerRight = innerRect.getBottomRight().x ?? 0;
    const containerMidX = innerRect.getCenter().x ?? 0;
    const containerMidY = innerRect.getCenter().y ?? 0;

    const containerBottom = innerRect.getBottomRight().y ?? 0;
    const containerTop = innerRect.getTopRight().y ?? 0;

    const sliderBackground = this.add
      .rectangle(containerMidX, containerBottom - 80, containerWidth - 50, 10, 0x999999)
      .setOrigin(0.5);

    const goodZone = this.add
      .rectangle(
        containerMidX,
        containerBottom - 80,
        this.goodZoneWidth * sliderBackground.width,
        10,
        0x99ff99,
      )
      .setOrigin(0.5);

    const sliderPointer = this.add.rectangle(
      sliderBackground.getBottomLeft().x,
      containerBottom - 80,
      10,
      20,
      0x0,
    );

    const spaceBar = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    spaceBar?.on('down', () => {
      if (this._sliderTween?.isActive()) {
        this._sliderTween?.pause();
      }
    });

    const runButton = new TextButton(
      this,
      containerRight - 10,
      containerBottom - 10,
      'Run Away',
      () => {
        this.scene.setVisible(false);
        this.scene.stop();
        this.sound.stopAll();
        this.load.off('complete');
        spaceBar?.off('down');
      },
    ).setOrigin(1);
    this.add.existing(runButton);

    const tryAgainButton = new TextButton(
      this,
      runButton.x - 110,
      containerBottom - 10,
      'Throw Again',
      () => {
        if (this._sliderTween?.isPaused()) {
          this._sliderTween?.reset();
          this._sliderTween?.restart();
          tryAgainButton.setEnabled(false);
        }
      },
    ).setOrigin(1);
    tryAgainButton.setEnabled(false);
    this.add.existing(tryAgainButton);

    this._messageText = this.add
      .text(width / 2 - containerWidth / 2, height / 2 + containerHeight / 2 - 150, '', {
        color: '#FF0000',
      })
      .setPadding(20)
      .setAlpha(0);

    this.load.crossOrigin = 'anonymous';
    this.load.baseURL = '';
    const id = nanoid();
    this.load.image(id, this._pokemon?.sprite.front);

    this.load.on('complete', () => {
      const title = this.add
        .text(
          containerMidX,
          containerTop + 20,
          `A wild ${this._pokemon?.name ?? 'Unknown Pokemon'} appeared!`,
          {
            color: '#000000',
          },
        )
        .setPadding(16, 5)
        .setOrigin(0.5)
        .setScrollFactor(0);

      const pokemon = this.add
        .image(containerMidX, containerMidY - 100, id)
        .setScale(1.5)
        .setDepth(10);
      pokemon.preFX?.addShadow();

      this._sliderTween = this.tweens.add({
        targets: sliderPointer,
        repeat: -1,
        x: {
          to: sliderBackground.getBottomRight().x,
          from: sliderBackground.getBottomLeft().x,
        },
        duration: this.duration,
        ease: 'Phaser.Math.Easing.Sine.InOut',
        yoyo: true,
        onStart: () => {
          this.physics.add.existing(pokemon);
          const pokemonBody = pokemon.body as Phaser.Physics.Arcade.Body;
          pokemonBody.immovable = true;
        },
        onPause: async () => {
          const left = goodZone.getBottomLeft().x;
          const right = goodZone.getBottomRight().x;
          if (!left || !right) return;

          if (left < sliderPointer.x && sliderPointer.x < right) {
            goodThrowFX.play();
            const pokeball = await this._pokeballThrowAnimation(pokemon);
            if (Math.random() < this.escapeRate) {
              escapeFX.play();
              this._displayMessage(`The ${this._pokemon?.name} escaped!`, '#000000');
              this.tweens.add({
                targets: pokemon,
                x: containerMidX,
                y: containerMidY - 100,
                alpha: 1,
                scaleX: 1.5,
                scaleY: 1.5,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                  tryAgainButton.setEnabled(true);
                },
              });
              pokeball.destroy();
            } else {
              caughtFX.play();
              this.time.delayedCall(1000, () => getFX.play({ volume: 0.25 }));
              bgm.stop();
              pokeball.preFX?.addGlow(0xf3ff73, 20);
              this.time.delayedCall(300, () => pokeball.preFX?.clear());
              title.setText(`You caught a ${this._pokemon?.name}!`);
              runButton.setText('Leave');
              this._savePokemon();
              eventsCenter.emit('caught-pokemon');
            }
          } else {
            missThrowFX.play();
            this._missedThrowCounter++;
            if (this._missedThrowCounter >= MISSED_THROW_ATTEMPTS_ALLOWED) {
              pokemon.destroy();
              title.setText(`The ${this._pokemon?.name} ran away!`);
              runButton.setText('Leave');
              return;
            }
            this._displayMessage('You missed!', '#FF0000');
            tryAgainButton.setEnabled(true);
          }
        },
      });
    });
    this.load.start();
  }

  private _savePokemon() {
    if (!this._pokemon) return;
    const pokemonList = getUserPokemon();
    pokemonList.push(this._pokemon);
    localStorage.setItem('pokemon', JSON.stringify(pokemonList));
  }

  private async _pokeballThrowAnimation(
    pokemon: Phaser.GameObjects.Image,
  ): Promise<Phaser.GameObjects.Image> {
    const strugglingFX = this.sound.add('pokemon-struggling');
    const collisionFX = this.sound.add('collision');
    this._displayMessage('Nice throw!', '#000000');
    await new Promise(resolve => {
      setTimeout(resolve, 500);
    });
    const pokeball = this.add
      .image(this.scale.width / 2, this.scale.height / 2 + 100, 'pokeball')
      .setScale(0.15)
      .setDepth(50);
    pokeball.preFX?.addShadow();
    pokeball.setDisplaySize(50, 50);
    this.physics.add.existing(pokeball);
    const pokeballBody = pokeball.body as Phaser.Physics.Arcade.Body;
    pokeballBody.setBounceY(0.2);
    pokeballBody.setDragY(150);
    pokeballBody.velocity.y = -500;

    await new Promise<void>(resolve => {
      this.physics.add.collider(pokemon, pokeball, () => {
        collisionFX.play();
        const beam = this.add
          .rectangle(this.scale.width / 2, pokeball.getCenter().y, 5, 100, 0xff6989)
          .setOrigin(0.5, 1)
          .setDepth(9);
        beam.postFX?.addGlow(0xff6989, 10);
        pokemon.preFX?.addGlow(0xff6989, 20);
        pokeball.preFX?.addGlow(0xff6989, 20);
        pokemon.body = null;
        pokeball.setTexture('pokeball-open');
        pokeball.setDisplaySize(50, 50);
        this.tweens.add({
          targets: beam,
          height: 0,
          y: (pokeball.getBottomCenter().y ?? 0) + 80,
          duration: 700,
          delay: 1200,
        });
        this.tweens.chain({
          targets: pokemon,
          tweens: [
            {
              alpha: { from: pokemon.scale, to: 0.6 },
            },
            {
              alpha: 0,
              scaleX: { from: pokemon.scale, to: 0.2 },
              scaleY: { from: pokemon.scale, to: 0.2 },
              y: { from: pokemon.getCenter().y, to: pokeball.getCenter().y },
              repeat: 0,
              ease: 'Exponential',
              onComplete: () => {
                beam.destroy();
                strugglingFX.play({ loop: true });
                pokemon.preFX?.clear();
                pokemon.preFX?.addShadow();
                pokeball.preFX?.clear();
                pokeball.preFX?.addShadow();
                pokeball.setTexture('pokeball');
                pokeball.setDisplaySize(50, 50);
                this.tweens.chain({
                  targets: pokeball,
                  tweens: [
                    { angle: { from: 0, to: 0 }, duration: 150 },
                    {
                      angle: { from: -50, to: 50 },
                      duration: 500,
                      repeat: Math.random() * 4,
                      yoyo: true,
                      ease: 'Phaser.Math.Easing.Circular.InOut',
                    },
                  ],
                  onComplete: () => {
                    resolve();
                    strugglingFX.stop();
                  },
                });
              },
            },
          ],
          duration: 500,
        });
      });
    });
    return pokeball;
  }

  private _displayMessage(text: string, color: string) {
    this._messageText?.setAlpha(1);
    this._messageText?.setText(text);
    this._messageText?.setColor(color);
    this.add.tween({
      targets: this._messageText,
      alpha: 0,
      duration: 200,
      delay: 1500,
    });
  }
}

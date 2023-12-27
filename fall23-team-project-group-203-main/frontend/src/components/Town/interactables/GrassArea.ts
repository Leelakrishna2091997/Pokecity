import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class GrassArea extends Interactable {
  getType(): KnownInteractableTypes {
    return 'grassArea';
  }

  addedToScene(): void {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);
  }

  private _showCaptureModal() {
    const captureScene = this.scene.scene.get('pokemonCapture');
    if (captureScene.scene.isVisible()) return;
    captureScene?.scene.restart();
    captureScene?.scene.setVisible(true);
  }

  overlap(): void {
    this._shouldEncounterPokemon();
  }

  private _shouldEncounterPokemon() {
    const randVal = Math.random();
    if (randVal > 0.93) {
      this._showCaptureModal();
    }
  }
}

// A Phaser Text game object that also serves as a button
export class TextButton extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick: () => void) {
    super(scene, x, y, text, {
      color: '#FFFFFF',
      backgroundColor: '#9999FF',
    });

    this.setPadding(10, 5);
    this.setOrigin(0.5);
    this.setEnabled(true);
    this.on('pointerover', () => this.enterButtonHoverState())
      .on('pointerout', () => this.enterButtonRestState())
      .on('pointerup', () => {
        this.enterButtonHoverState();
        onClick();
      });
  }

  enterButtonHoverState() {
    this.setTint(0x44ff44);
  }

  enterButtonRestState() {
    this.clearTint();
  }

  setEnabled(value: boolean) {
    if (value) {
      this.setInteractive({ useHandCursor: true });
      this.setBackgroundColor('#9999FF');
    } else {
      this.clearTint();
      this.disableInteractive();
      this.setBackgroundColor('#777777');
    }
  }
}

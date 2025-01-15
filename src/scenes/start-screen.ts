export class StartScreen extends Phaser.Scene {
    constructor() {
        super('StartScreen');
    }

    create() {
        const { width, height } = this.scale;
        
        // Add title
        this.add.text(width/2, height/3, 'Simple shoot em up game', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add play button
        const playButton = this.add.text(width/2, height/2, 'PLAY', {
            fontSize: '32px',
            color: '#ff0000',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        // Add how to play button
        const howToPlayButton = this.add.text(width/2, height/2 + 80, 'HOW TO PLAY', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        // Button interactions for play button
        playButton.on('pointerover', () => playButton.setTint(0x808080));
        playButton.on('pointerout', () => playButton.clearTint());
        playButton.on('pointerdown', () => this.scene.start('HospitalScene'));

        // Button interactions for how to play button
        howToPlayButton.on('pointerover', () => howToPlayButton.setTint(0x808080));
        howToPlayButton.on('pointerout', () => howToPlayButton.clearTint());
        howToPlayButton.on('pointerdown', () => {
            // Create an overlay with instructions
            const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
                .setOrigin(0)
                .setInteractive();
            
            const instructions = this.add.text(width/2, height/3, 
                'How to Play:\n\n' +
                'WASD / Arrow Keys - Move\n' +
                'Space / Left Click - Shoot\n' +
                'Mouse - Aim\n' +
                'Survive as long as you can!\n\n' +
                'Click anywhere to close',
                {
                    fontSize: '24px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5);

            // Click anywhere to close the instructions
            overlay.on('pointerdown', () => {
                overlay.destroy();
                instructions.destroy();
            });
        });
    }
} 
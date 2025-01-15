export class EndScreen extends Phaser.Scene {
    private score: number;
    
    constructor() {
        super('EndScreen');
    }

    init(data: { score: number }) {
        this.score = data.score;
    }

    create() {
        const { width, height } = this.scale;
        
        // Get high score from localStorage
        const highScore = localStorage.getItem('highScore') || '0';
        const newHighScore = Math.max(parseInt(highScore), this.score);
        localStorage.setItem('highScore', newHighScore.toString());

        // Add score texts
        this.add.text(width/2, height/2 - 100, 'Game Over', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(width/2, height/2, `Score: ${this.score}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(width/2, height/2 + 50, `High Score: ${newHighScore}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add play again button
        const playAgainButton = this.add.text(width/2, height/2 + 150, 'Play Again', {
            fontSize: '32px',
            color: '#ff0000',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        // Add back to menu button
        const menuButton = this.add.text(width/2, height/2 + 220, 'Back to Menu', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        // Button interactions
        playAgainButton.on('pointerover', () => playAgainButton.setTint(0x808080));
        playAgainButton.on('pointerout', () => playAgainButton.clearTint());
        playAgainButton.on('pointerdown', () => this.scene.start('HospitalScene'));

        menuButton.on('pointerover', () => menuButton.setTint(0x808080));
        menuButton.on('pointerout', () => menuButton.clearTint());
        menuButton.on('pointerdown', () => this.scene.start('StartScreen'));
    }
} 
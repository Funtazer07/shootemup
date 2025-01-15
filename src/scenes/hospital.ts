import hospitalJSON from '../assets/hospital.json'
import { Enemy } from '../entities/enemy';
import { Player } from '../entities/player';
import { LAYERS, SIZES, SPRITES, TILES } from '../utils/constants'

export class Hospital extends Phaser.Scene {
    private readonly CONTROLS_DISPLAY_TIME: number = 10000; // 10 seconds in milliseconds
    private player?: Player;
    private zombies: Enemy[] = [];
    private maxZombies: number = 7;
    private spawnDistance: number = 300; // Initial spawn distance
    killsText: Phaser.GameObjects.Text;
    killsCounter: number = 0;
    private wallsLayer: Phaser.Tilemaps.TilemapLayer;
    private controlsText: Phaser.GameObjects.Text;
    private controlsTimer: Phaser.Time.TimerEvent;
    shoot: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    constructor() {
        super('HospitalScene');
    }

    preload () {
        this.load.audio('shoot', 'src/assets/sounds/shoot.wav')
        this.load.image(TILES.HOSPITAL, 'src/assets/neo_zero_tiles_and_buildings_01.png')
        this.load.tilemapTiledJSON('map', 'src/assets/hospital.json')
        // still animation
        this.load.spritesheet(SPRITES.PLAYER_STILL, 'src/assets/characters/gunner.png', {
            frameWidth: SIZES.PLAYER.WIDTH,
            frameHeight: SIZES.PLAYER.HEIGHT
        });
        // movement animation
        this.load.spritesheet(SPRITES.PLAYER_RUN, 'src/assets/characters/gunnerrun.png', {
            frameWidth: SIZES.PLAYER.WIDTH,
            frameHeight: SIZES.PLAYER.HEIGHT
        });
        // zombie
        this.load.spritesheet(SPRITES.ZOMBIE.base, 'src/assets/characters/zombies.png', {
            frameWidth: SIZES.ZOMBIE.WIDTH,
            frameHeight: SIZES.ZOMBIE.HEIGHT
        });
        // bullet
        this.load.image('bullet', 'src/assets/characters/bullet.png');
    }
    

    create () {
        // Sound
        this.shoot = this.sound.add('shoot');

        // Reset game state
        this.killsCounter = 0;
        this.zombies = [];
        this.maxZombies = 7; // Reset to initial value
        this.spawnDistance = 300; // Reset to initial spawn distance

        if (this.controlsText) {
            this.controlsText.destroy();
        }

        this.showControls();

        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage(hospitalJSON.tilesets[0].name, TILES.HOSPITAL, SIZES.TILE, SIZES.TILE);
        const groundLayer = map.createLayer(LAYERS.GROUND, tileset, 0, 0);
        this.wallsLayer = map.createLayer(LAYERS.WALLS, tileset, 0, 0);
        groundLayer.setScale(1);
        this.wallsLayer.setScale(1);

        this.player = new Player(this, 250, 150, SPRITES.PLAYER_STILL);
        
        // Highlight circle around player
        const highlight = this.add.circle(this.player.x, this.player.y, 50, 0xffff00, 0.3);
        
        this.tweens.add({
            targets: highlight,
            scale: 1.5,
            alpha: 0,
            duration: 2000,
            ease: 'Cubic.easeOut',
            onComplete: () => highlight.destroy()
        });

        this.zombies = [];

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Collision with walls
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.player.setCollideWorldBounds(true);
        this.zombies.forEach(zombie => zombie.setCollideWorldBounds(true));

        this.physics.add.collider(this.player, this.wallsLayer);
        this.wallsLayer.setCollisionByExclusion([-1]);

        this.physics.add.collider(this.player.getBullets(), this.wallsLayer, (bullet) => {
            bullet.destroy();
        });

        this.killsText = this.add.text(1500, 20, `${this.killsCounter}`, { fontFamily: 'Arial', fontSize: 24, color: '#00FF00'});
        this.killsText.setScrollFactor(0);

        // Update controls text based on input method
        this.updateControlsText();

        // Listen for gamepad connected/disconnected events
        this.input.gamepad.on('connected', () => {
            this.updateControlsText();
        });

        this.input.gamepad.on('disconnected', () => {
            this.updateControlsText();
        });

        // Timer to fade out controls
        this.time.delayedCall(10000, () => {
            this.tweens.add({
                targets: this.controlsText,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    this.controlsText.destroy();
                }
            });
        });

        // Initial zombie spawn
        this.spawnZombies();

        // Add this after zombie spawning
        this.physics.add.collider(this.zombies, this.wallsLayer);
        
        // Add collision between zombies and player
        this.physics.add.collider(this.zombies, this.player);
        
        // Add collision between zombies themselves
        this.physics.add.collider(this.zombies, this.zombies);

        // Add timer for increasing difficulty
        this.time.addEvent({
            delay: 5000, // 5 sec
            callback: this.increaseDifficulty,
            callbackScope: this,
            loop: true
        });

        // Collision between bullets and zombies
        this.physics.add.collider(
            this.player.getBullets(),
            this.zombies,
            (bullet: Phaser.Physics.Arcade.Sprite, zombie: Enemy) => {
                bullet.destroy();
                zombie.takeDamage(100); // Instant kill
            }
        );
    }

    private increaseDifficulty() {
        this.maxZombies++;
        this.spawnDistance = Math.max(50, this.spawnDistance - 20); // Don't go below 50
        this.spawnZombies(); // Spawn new zombies with updated parameters
    }

    private spawnZombies() {
        while (this.zombies.length < this.maxZombies) {
            let randomX, randomY, distanceToPlayer;
            
            do {
                randomX = Phaser.Math.Between(50, this.scale.width - 50);
                randomY = Phaser.Math.Between(50, this.scale.height - 50);
                distanceToPlayer = Phaser.Math.Distance.Between(
                    randomX, randomY,
                    this.player.x, this.player.y
                );
            } while (distanceToPlayer < this.spawnDistance);
            
            const zombie = new Enemy(this, randomX, randomY, SPRITES.ZOMBIE.base);
            zombie.setPlayer(this.player);
            zombie.setWallLayer(this.wallsLayer);
            zombie.setCollideWorldBounds(true);
            
            this.zombies.push(zombie);
            this.physics.add.collider(zombie, this.wallsLayer);
            
            // Add collisions for the new zombie
            this.physics.add.collider(zombie, this.player);
            this.physics.add.collider(zombie, this.zombies);
        }
        this.player.setEnemies(this.zombies);
    }

    update(_: number, delta: number): void {
        this.player.update(delta);
        
        // Update and check zombies
        this.zombies = this.zombies.filter(zombie => zombie.active);
        this.zombies.forEach(zombie => zombie.update());
        
        // Respawn zombies if needed
        if (this.zombies.length < this.maxZombies) {
            this.spawnZombies();
        }

        this.killsText.setText(`${this.killsCounter}`);
    }

    private updateControlsText() {
        const pad = this.input.gamepad?.pad1;
        
        const controlsMessage = pad?.connected
            ? 'Controls:\nLeft Stick - Move\nRight Stick - Aim\nRT Button - Shoot'
            : 'Controls:\nWASD / Arrows - Move\nSpace / Left Click - Shoot\nMouse - Aim';

        if (this.controlsText) {
            this.controlsText.destroy();
        }
        
        this.controlsText = this.add.text(1400, 60, 
            controlsMessage, 
            { 
                fontFamily: 'Arial', 
                fontSize: 16, 
                color: '#FFFFFF',
                align: 'right',
                backgroundColor: '#000000',
                padding: { x: 10, y: 10 }
            }
        );
        this.controlsText.setScrollFactor(0);

        this.time.delayedCall(10000, () => {
            this.tweens.add({
                targets: this.controlsText,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    this.controlsText.destroy();
                }
            });
        });
    }

    private showControls() {
        // Update controls text based on current input method
        this.updateControlsText();

        this.controlsText.setAlpha(1);

        // Clear any existing timer
        if (this.controlsTimer) {
            this.controlsTimer.destroy();
        }

        // Set new timer to fade out controls
        this.controlsTimer = this.time.delayedCall(this.CONTROLS_DISPLAY_TIME, () => {
            this.tweens.add({
                targets: this.controlsText,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    this.controlsText.destroy();
                }
            });
        });
    }
}
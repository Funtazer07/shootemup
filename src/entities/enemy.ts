import { Hospital } from "../scenes/hospital";
import { Entity } from "./entity";

export class Enemy extends Entity {
    private player: Entity;
    private isFollowing: boolean;
    private agroDistance: number;
    private attackRange: number;
    private followRange: number;
    private isAlive: boolean;
    private moveSpeed: number;
    private initialPosition: { x: number; y: number; };
    private lastBlockedTime: number = 0;
    private alternativeDirection: Phaser.Math.Vector2 | null = null;
    // @ts-ignore
    private wallLayer: Phaser.Tilemaps.TilemapLayer;
    constructor(scene: Phaser.Scene, x: number, y:number, texture: string) {
        super(scene,x, y, texture);

        this.isFollowing = false;
        this.agroDistance = 2000;
        this.isAlive = true;
        this.moveSpeed = 130;
        this.initialPosition = { x, y };
        this.attackRange = 40;

        this.setSize(28, 28);
        this.setOffset(3, 10);

        this.cycleTween();
        this.setFlipX(true)

        this.on('blocked', this.handleCollision, this);
    }

    cycleTween() {
        this.scene.tweens.add({
            targets: this,
            duration: 2000,
            repeat: -1,
            yoyo: true,
            x: this.x + 100,
            onRepeat: () => {
                this.setFlipX(false);
            },
            onYoyo: () => {
                this.setFlipX(true);
            }

        })
    }

    setPlayer (player: Entity) {
        this.player = player;
    }

    stopCycleTween() {
        this.scene.tweens.killTweensOf(this);
    }

    followToPlayer(player) {
        if (this.alternativeDirection) {
            const speed = this.moveSpeed;
            this.setVelocity(
                this.alternativeDirection.x * speed,
                this.alternativeDirection.y * speed
            );
            
            setTimeout(() => {
                this.alternativeDirection = null;
            }, 500);
        } else {
            this.scene.physics.moveToObject(this, player, this.moveSpeed);
        }
    }

    returnToOriginalPosition(distanceToPosition) {
        this.setVelocity(0,0);

        this.scene.tweens.add({
            targets: this,
            x: this.initialPosition.x,
            y: this.initialPosition.y,
            duration: distanceToPosition * 1000 / this.moveSpeed,
            onComplete: () => {
                this.cycleTween();
            }

        })
     }

     attack (target: Entity) {
        const time = Math.floor(this.scene.game.loop.time);

        if (time % 500 <= 16) {
            target.takeDamage(8);
        }
     }

     takeDamage (damage) {
        super.takeDamage(damage);

        if (this.health <= 0) {
            this.deactivate()
        }
     }

     deactivate () {
        const scene = this.scene as Hospital;
        this.stopCycleTween();
        
        // Add floating score text
        const scoreText = this.scene.add.text(this.x, this.y - 20, '+100', { 
            fontSize: '20px',
            color: '#00ff00'
        });
        
        // Animate the score text floating up and fading out
        this.scene.tweens.add({
            targets: scoreText,
            y: this.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                scoreText.destroy();
            }
        });

        this.setPosition(this.initialPosition.x, this.initialPosition.y);
        this.setVisible(false);
        this.isAlive = false;
        this.destroy();
        scene.killsCounter += 100;
     }

    update() {
        const player = this.player;
        const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (!this.isFollowing && distanceToPlayer < this.agroDistance) {
            this.isFollowing = true;
            this.stopCycleTween();
        }

        if (this.isFollowing && this.isAlive) {
            this.followToPlayer(player);
            if (distanceToPlayer < this.attackRange) {
                this.setVelocity(0, 0);
                this.attack(player);
            }
        }
    }

    private handleCollision(direction: Phaser.Physics.Arcade.Body) {
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastBlockedTime < 500) return;
        
        this.lastBlockedTime = currentTime;
        
        const velocity = new Phaser.Math.Vector2(this.body.velocity.x, this.body.velocity.y);
        if (velocity.length() === 0) return;
        
        this.alternativeDirection = new Phaser.Math.Vector2(-velocity.y, velocity.x).normalize();
    }

    setWallLayer(layer: Phaser.Tilemaps.TilemapLayer) {
        this.wallLayer = layer;
    }
}
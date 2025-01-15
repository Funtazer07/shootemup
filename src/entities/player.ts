import { SPRITES } from "../utils/constants";
import { Entity } from "./entity";
import { Bullet } from "./bullet";
import { Hospital } from "../scenes/hospital";

export class Player extends Entity {
    textureKey: string;
    private moveSpeed: number;
    enemies: Entity[];
    playerHealthBar: Phaser.GameObjects.Graphics;
    private bullets: Phaser.GameObjects.Group;
    private lastShotTime: number = 0;
    private shootCooldown: number = 370; // 370ms between shots
    private readonly STICK_DEADZONE: number = 0.2;
    private readonly GAMEPAD_BUTTONS = {
        RB: 7
    };
    private readonly GAMEPAD_STICKS = {
        LEFT: {
            H: 0,  // Horizontal axis
            V: 1   // Vertical axis
        },
        RIGHT: {
            H: 2,  // Horizontal axis
            V: 3   // Vertical axis
        }
    };
    
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, type?: string) {
        super(scene, x, y, texture, SPRITES.PLAYER_STILL);  // Default to still animation

        const anims = this.scene.anims;
        const animsFrameRate = 9;
        this.textureKey = texture;
        this.moveSpeed = 30;
        // Hitbox
        this.setSize(28, 32);
        this.setOffset(10, 8);
        this.setScale(1.1);
        this.drawPlayerHealthBar();
        this.setupKeysListeners();

        anims.create({
            key: 'still',
            frames: anims.generateFrameNumbers(SPRITES.PLAYER_STILL, {
                start: 0,
                end: 4
            }),
            frameRate: animsFrameRate,
            repeat: -1
        })

        anims.create({
            key: 'up',
            frames: anims.generateFrameNumbers(SPRITES.PLAYER_RUN, {
                start: 0,
                end: 4
            }),
            frameRate: animsFrameRate,
            repeat: -1
        })

        anims.create({
            key: 'down',
            frames: anims.generateFrameNumbers(SPRITES.PLAYER_RUN, {
                start: 0,
                end: 4
            }),
            frameRate: animsFrameRate,
            repeat: -1
        })

        anims.create({
            key: 'left',
            frames: anims.generateFrameNumbers(SPRITES.PLAYER_RUN, {
                start: 0,
                end: 4
            }),
            frameRate: animsFrameRate,
            repeat: -1
        })

        anims.create({
            key: 'right',
            frames: anims.generateFrameNumbers(SPRITES.PLAYER_RUN, {
                start: 0,
                end: 4
            }),
            frameRate: animsFrameRate,
            repeat: -1
        })

        // Add bullets group
        this.bullets = this.scene.add.group({
            classType: Bullet,
            runChildUpdate: true
        });
    }

    private drawPlayerHealthBar() {
        this.playerHealthBar = this.scene.add.graphics();
        this.playerHealthBar.setScrollFactor(0);
        this.drawHealthBar(this.playerHealthBar, 20, 20, this.health / 100)
    }

    private drawHealthBar(graphics, x, y, percentage) {
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(x, y, 100, 10)

        graphics.fillStyle(0x00ff00, 1);
        graphics.fillRect(x, y, 100 * percentage, 10)
    }


    setEnemies(enemies: Entity[]) {
        this.enemies = enemies;
    }

    private findTarget (enemies: Entity[]) {
        let target = null;
        let minDistance = Infinity;

        for (const enemy of enemies) {
            const distanceToEnemy = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);

            if (distanceToEnemy < minDistance) {
                minDistance = distanceToEnemy;
                target = enemy;
            }
        }
        return target;
    }

    private setupKeysListeners() {
        this.scene.input.keyboard.on('keydown-SPACE', () => {
            const target = this.findTarget(this.enemies);
            if (target) {
                this.shoot(target);
            }
        });

        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                const target = this.findTarget(this.enemies);
                if (target) {
                    this.shoot(target);
                }
            }
        });
    }

    private shoot(target: Entity) {
        const currentTime = this.scene.time.now;
        
        if (currentTime - this.lastShotTime < this.shootCooldown) {
            return;
        }
        
        const bullet = this.bullets.get(this.x, this.y) as Bullet;
        
        if (bullet) {
            (this.scene as Hospital).shoot.play();

            let targetX: number;
            let targetY: number;
            
            const pad = this.scene.input.gamepad?.pad1;
            if (pad?.connected) {
                // Use right stick for aiming direction when gamepad is connected
                const rightH = pad.axes[this.GAMEPAD_STICKS.RIGHT.H].getValue();
                const rightV = pad.axes[this.GAMEPAD_STICKS.RIGHT.V].getValue();
                
                if (Math.abs(rightH) > this.STICK_DEADZONE || Math.abs(rightV) > this.STICK_DEADZONE) {
                    targetX = this.x + rightH * 100; // Use an offset to determine direction
                    targetY = this.y + rightV * 100;
                } else {
                    targetX = target.x;
                    targetY = target.y;
                }
            } else {
                const pointer = this.scene.input.activePointer;
                const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                targetX = worldPoint.x;
                targetY = worldPoint.y;
            }
            
            bullet.fire(this.x, this.y, targetX, targetY);
            
            this.enemies.forEach(enemy => {
                this.scene.physics.add.collider(bullet, enemy, () => {
                    bullet.destroy();
                    enemy.takeDamage(100);
                }, null, this);
            });
            
            this.lastShotTime = currentTime;
        }
    }

    private handleGamepadMovement(pad: Phaser.Input.Gamepad.Gamepad, delta: number) {
        // Left stick movement
        const leftH = pad.axes[this.GAMEPAD_STICKS.LEFT.H].getValue();
        const leftV = pad.axes[this.GAMEPAD_STICKS.LEFT.V].getValue();

        if (Math.abs(leftH) > this.STICK_DEADZONE || Math.abs(leftV) > this.STICK_DEADZONE) {
            const moveX = leftH * delta * this.moveSpeed;
            const moveY = leftV * delta * this.moveSpeed;
            
            this.setVelocity(moveX, moveY);

            if (Math.abs(leftV) > Math.abs(leftH)) {
                this.play(leftV > 0 ? 'down' : 'up', true);
            } else {
                this.play(leftH > 0 ? 'right' : 'left', true);
            }
        } else {
            this.setVelocity(0, 0);
            this.play('still', true);
        }
    }

    private handleGamepadAiming(pad: Phaser.Input.Gamepad.Gamepad) {
        // Right stick aiming
        const rightH = pad.axes[this.GAMEPAD_STICKS.RIGHT.H].getValue();
        const rightV = pad.axes[this.GAMEPAD_STICKS.RIGHT.V].getValue();

        if (Math.abs(rightH) > this.STICK_DEADZONE || Math.abs(rightV) > this.STICK_DEADZONE) {
            this.setFlipX(rightH < 0);
        }

        // RT shooting
        if (pad.buttons[this.GAMEPAD_BUTTONS.RB].pressed) {
            const target = this.findTarget(this.enemies);
            if (target) {
                this.shoot(target);
            }
        }
    }

    update(delta: number) {
        const keys = this.scene.input.keyboard.createCursorKeys();
        const wasd = this.scene.input.keyboard.addKeys('W,A,S,D') as any;
        const pad = this.scene.input.gamepad?.pad1;
        
        this.drawPlayerHealthBar();

        if (pad?.connected) {
            // Use gamepad controls if connected
            this.handleGamepadMovement(pad, delta);
            this.handleGamepadAiming(pad);
        } else {
            let moveX = 0;
            let moveY = 0;

            // Horizontal movement
            if (keys.left.isDown || wasd.A.isDown) {
                moveX = -1;
            } else if (keys.right.isDown || wasd.D.isDown) {
                moveX = 1;
            }

            // Vertical movement
            if (keys.up.isDown || wasd.W.isDown) {
                moveY = -1;
            } else if (keys.down.isDown || wasd.S.isDown) {
                moveY = 1;
            }

            // Diagonal movement
            if (moveX !== 0 && moveY !== 0) {
                const normalizedSpeed = Math.SQRT1_2;
                moveX *= normalizedSpeed;
                moveY *= normalizedSpeed;
            }

            // Apply movement and animations
            if (moveX !== 0 || moveY !== 0) {
                this.setVelocity(moveX * delta * this.moveSpeed, moveY * delta * this.moveSpeed);
                
                // Choose animation based on primary direction
                if (Math.abs(moveY) > Math.abs(moveX)) {
                    this.play(moveY > 0 ? 'down' : 'up', true);
                } else {
                    this.play(moveX > 0 ? 'right' : 'left', true);
                }
            } else {
                this.setVelocity(0, 0);
                this.play('still', true);
            }

            // Mouse aiming for non-gamepad
            const pointer = this.scene.input.activePointer;
            const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.setFlipX(worldPoint.x < this.x);
        }
    }

    getBullets(): Phaser.GameObjects.Group {
        return this.bullets;
    }

    takeDamage(damage: number) {
        super.takeDamage(damage);
        
        if (this.health <= 0) {
            this.die();
        }
    }

    private die() {
        const scene = this.scene as Hospital;
        this.scene.scene.start('EndScreen', { score: scene.killsCounter });
    }
}

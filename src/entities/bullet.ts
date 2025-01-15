export class Bullet extends Phaser.Physics.Arcade.Sprite {
    private speed: number = 300;
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'bullet');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setScale(3); 
    }

    fire(x: number, y: number, targetX: number, targetY: number) {
        this.setPosition(x, y);
        
        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        this.setRotation(angle);
        
        const velocity = this.scene.physics.velocityFromRotation(angle, this.speed);
        this.setVelocity(velocity.x, velocity.y);
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
    }
} 
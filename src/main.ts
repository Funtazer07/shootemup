import Phaser from 'phaser'
import './style.css'
import { scenes } from './scenes'

new Phaser.Game ({
    width: 1600,
    height: 800,
    title: 'Shoot em up shooter',
    scene: scenes,
    backgroundColor: '#000',
    physics: {
      default: 'arcade',
      arcade: {
        // debug: true,
      }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pixelArt: true,
    input: {
        gamepad: true
    },
})
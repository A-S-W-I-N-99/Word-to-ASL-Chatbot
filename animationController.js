import * as THREE from 'three';

export class AnimationController {
    constructor(model, animations) {
        this.mixer = new THREE.AnimationMixer(model);
        this.animations = animations;
        this.queue = [];
        this.current = null;
        this.speed = 1;
        this.isPlaying = false;
    }

    playSequence(list) {
        this.stop();
        this.queue = [...list];
        this.next();
    }

    next() {
        if (!this.queue.length) return;
        const name = this.queue.shift();
        const clip = THREE.AnimationClip.findByName(this.animations, name);
        if (!clip) return this.next();

        const action = this.mixer.clipAction(clip);
        action.reset().setLoop(THREE.LoopOnce).play();
        action.timeScale = this.speed;
        this.current = action;

        this.mixer.addEventListener('finished', () => this.next(), { once: true });
        this.isPlaying = true;
    }

    pause() {
        if (this.current) this.current.timeScale = 0;
    }

    resume() {
        if (this.current) this.current.timeScale = this.speed;
    }

    stop() {
        this.mixer.stopAllAction();
        this.queue = [];
        this.isPlaying = false;
    }

    setSpeed(s) {
        this.speed = s;
        if (this.current) this.current.timeScale = s;
    }

    update(delta) {
        this.mixer.update(delta);
    }
}

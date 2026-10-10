import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { BlackAndWhitePostProcess } from "@babylonjs/core/PostProcesses/blackAndWhitePostProcess";
import { Player } from "../Player";
import { PlayerInput } from "../../Controllers/PlayerInput";

const DESKTOP_DISTANCE = 42;
const TOUCH_DISTANCE = 47;
const CAMERA_HEIGHT_RATIO = 0.58;
const LOOK_AHEAD_DISTANCE = 3.2;
const TAU = Math.PI * 2;

export class PlayerCamera {
    private player: Player;
    private _scene: Scene;
    private _input: PlayerInput;
    public _camRoot: TransformNode;
    public camera: UniversalCamera;
    public cameraPos: Vector3;
    private _postProcess: BlackAndWhitePostProcess;
    private chaseYaw = 2.7;
    private desiredYaw = 2.7;

    constructor(player) {
        this._scene = player._scene;
        this._input = player._input;
        this.init();
    }

    public init() {
        this._camRoot = new TransformNode("arkadii_camera_target", this._scene);
        this._camRoot.position = new Vector3(0, 1.6, 0);

        // A chase camera stays behind the direction chosen by the player. It keeps
        // a readable tactical distance without exposing an awkward manual orbit.
        this.camera = new UniversalCamera("arkadii_camera", Vector3.Zero(), this._scene);
        this.camera.fov = 0.48;
        this.camera.minZ = 0.2;
        this.camera.maxZ = 1100;
        this.camera.inputs.clear();
        this._scene.activeCamera = this.camera;
        this.cameraPos = this.camera.position;
    }

    public attach(player: Player) {
        this.player = player;
        this.snapToPlayer();
    }

    public update(): void {
        if (!this.player) {
            return;
        }

        const deltaSeconds = Math.min(this._scene.getEngine().getDeltaTime() / 1000, 0.1);
        const targetBlend = 1 - Math.exp(-deltaSeconds * 7.5);
        const cameraBlend = 1 - Math.exp(-deltaSeconds * 9);
        const isMoving = this._input.player_can_move;
        this.updateChaseYaw();
        const lookAhead = isMoving
            ? new Vector3(this._input.horizontal, 0, this._input.vertical).scale(LOOK_AHEAD_DISTANCE)
            : Vector3.Zero();
        const desiredTarget = this.player.position.add(new Vector3(0, 1.6, 0)).add(lookAhead);
        this._camRoot.position = Vector3.Lerp(this._camRoot.position, desiredTarget, targetBlend);

        const baseDistance = this.player._game.controlMode === "touch" ? TOUCH_DISTANCE : DESKTOP_DISTANCE;
        const distance = baseDistance + (isMoving ? 2.2 : 0);
        const yaw = this.chaseYaw;
        const offset = new Vector3(
            -Math.sin(yaw) * distance,
            distance * CAMERA_HEIGHT_RATIO,
            -Math.cos(yaw) * distance
        );
        const desiredPosition = this._camRoot.position.add(offset);
        this.camera.position = Vector3.Lerp(this.camera.position, desiredPosition, cameraBlend);
        this.camera.setTarget(this._camRoot.position);
        this.cameraPos = this.camera.position;
    }

    private snapToPlayer(): void {
        const target = this.player.position.add(new Vector3(0, 1.6, 0));
        const distance = this.player._game.controlMode === "touch" ? TOUCH_DISTANCE : DESKTOP_DISTANCE;
        this.chaseYaw = this.normalizeAngle(this.player.rotation.y + Math.PI);
        this.desiredYaw = this.chaseYaw;
        const yaw = this.chaseYaw;
        const offset = new Vector3(
            -Math.sin(yaw) * distance,
            distance * CAMERA_HEIGHT_RATIO,
            -Math.cos(yaw) * distance
        );
        this._camRoot.position.copyFrom(target);
        this.camera.position.copyFrom(target.add(offset));
        this.camera.setTarget(target);
        this.cameraPos = this.camera.position;
    }

    private updateChaseYaw(): void {
        // Third-person follow camera: the view is mounted behind the character,
        // so its bearing always matches the character's facing direction. The
        // pi offset places the camera behind the visual forward axis.
        this.desiredYaw = this.normalizeAngle(this.player.rotation.y + Math.PI);
        this.chaseYaw = this.desiredYaw;
        this.player._game.deltaCamY = this.chaseYaw;
    }

    private normalizeAngle(angle: number): number {
        return ((angle % TAU) + TAU) % TAU;
    }

    // post processing effect black and white
    // used when current player dies and click ressurects
    public vfx_black_and_white_on() {
        if (this._postProcess) {
            this._postProcess.dispose();
        }
        this._postProcess = new BlackAndWhitePostProcess("bandw", 1.0, this.camera);
    }

    public vfx_black_and_white_off() {
        if (this._postProcess) {
            this._postProcess.dispose();
        }
    }
}

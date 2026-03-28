// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MissionController
 * @author Ajanm: Sky-Sync Team
 * @notice 1st Person True Flight Simulator powered by Monad's Parallel EVM.
 *
 * ═══════════════════════════════════════════════════════════════
 * WHY THIS CONTRACT IS DESIGNED FOR MONAD'S PARALLEL EVM
 * ═══════════════════════════════════════════════════════════════
 *
 * This contract translates realtime 8-axis keyboard inputs 
 * (Thrust, Strafe, Yaw, Altitude) into distinct on-chain transactions.
 *
 * With Monad's 400ms finality and Optimistic Concurrency Control,
 * the player physically controls a true 3D flight simulator camera *through* 
 * the blockchain without queueing blocks.
 */
contract MissionController {

    // ─────────────────────────────────────────────────────────────
    // STATE STRUCTURES
    // ─────────────────────────────────────────────────────────────

    struct DroneState {
        uint256 droneId;
        bool    isActive;
        int256  x;                // X Coordinate (Easting)
        int256  y;                // Y Coordinate (Altitude)
        int256  z;                // Z Coordinate (Northing)
        int256  heading;          // Yaw Angle (Degrees 0-359)
        uint256 missionCount;     // Total movement transactions executed
        uint256 lastUpdateBlock;  
        uint256 lastUpdateTime;   
        address lastOperator;     
    }

    mapping(uint256 => DroneState) public drones;
    uint256 public swarmSize;
    address public immutable commander;
    mapping(address => bool) public authorizedGateways;

    // Fixed step sizes for generic state tracking.
    // The actual physics math happens in the frontend flight controller.
    int256 public constant MOVE_STEP = 10;
    int256 public constant TURN_STEP = 5;

    // ─────────────────────────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────────────────────────

    event FlightAction(
        uint256 indexed droneId,
        string  actionType,
        int256  newX,
        int256  newY,
        int256  newZ,
        int256  newHeading,
        uint256 missionCount,
        uint256 timestamp,
        address indexed operator
    );

    event DroneRegistered(uint256 indexed droneId, address operator, uint256 timestamp);
    event GatewayAuthorizationChanged(address indexed gateway, bool authorized);

    // ─────────────────────────────────────────────────────────────
    // MODIFIERS
    // ─────────────────────────────────────────────────────────────

    modifier onlyCommander() { require(msg.sender == commander, "DMC: Caller is not commander"); _; }
    modifier onlyAuthorized() { require(authorizedGateways[msg.sender] || msg.sender == commander, "DMC: Unauthorized"); _; }
    modifier droneExists(uint256 droneId) { require(drones[droneId].isActive, "DMC: Inactive"); _; }

    // ─────────────────────────────────────────────────────────────
    // CONSTRUCTOR & ADMIN
    // ─────────────────────────────────────────────────────────────

    constructor() {
        commander = msg.sender;
        authorizedGateways[msg.sender] = true;
    }

    function setGatewayAuthorization(address gateway, bool authorized) external onlyCommander {
        authorizedGateways[gateway] = authorized;
        emit GatewayAuthorizationChanged(gateway, authorized);
    }

    function registerDrone(uint256 droneId, int256 initX, int256 initY, int256 initZ, int256 initHeading) external onlyAuthorized {
        require(!drones[droneId].isActive, "DMC: Drone already registered");

        drones[droneId] = DroneState({
            droneId:          droneId,
            isActive:         true,
            x:                initX,
            y:                initY,
            z:                initZ,
            heading:          initHeading,
            missionCount:     0,
            lastUpdateBlock:  block.number,
            lastUpdateTime:   block.timestamp,
            lastOperator:     msg.sender
        });

        swarmSize++;
        emit DroneRegistered(droneId, msg.sender, block.timestamp);
    }

    // ─────────────────────────────────────────────────────────────
    // 8-AXIS FLIGHT FUNCTIONS (Thrust, Strafe, Alt, Yaw)
    // ─────────────────────────────────────────────────────────────

    // 1. Thrust Forward (W)
    function thrustForward(uint256 droneId) external onlyAuthorized droneExists(droneId) {
        DroneState storage state = drones[droneId];
        // Note: For simplicity on-chain, we just log a forward displacement.
        // True trigonometric translation occurs in CesiumJS frontend.
        state.z -= MOVE_STEP;  
        _finalizeAction(state, "THRUST_FORWARD");
    }

    // 2. Thrust Reverse (S)
    function thrustReverse(uint256 droneId) external onlyAuthorized droneExists(droneId) {
        DroneState storage state = drones[droneId];
        state.z += MOVE_STEP;
        _finalizeAction(state, "REVERSE");
    }

    // 3. Strafe Left (A)
    function strafeLeft(uint256 droneId) external onlyAuthorized droneExists(droneId) {
        DroneState storage state = drones[droneId];
        state.x -= MOVE_STEP;
        _finalizeAction(state, "STRAFE_LEFT");
    }

    // 4. Strafe Right (D)
    function strafeRight(uint256 droneId) external onlyAuthorized droneExists(droneId) {
        DroneState storage state = drones[droneId];
        state.x += MOVE_STEP;
        _finalizeAction(state, "STRAFE_RIGHT");
    }

    // 5. Yaw Left (Q)
    function yawLeft(uint256 droneId) external onlyAuthorized droneExists(droneId) {
        DroneState storage state = drones[droneId];
        state.heading -= TURN_STEP;
        if (state.heading < 0) state.heading += 360;
        _finalizeAction(state, "YAW_LEFT");
    }

    // 6. Yaw Right (E)
    function yawRight(uint256 droneId) external onlyAuthorized droneExists(droneId) {
        DroneState storage state = drones[droneId];
        state.heading = (state.heading + TURN_STEP) % 360;
        _finalizeAction(state, "YAW_RIGHT");
    }

    // 7. Ascend (Space)
    function ascend(uint256 droneId) external onlyAuthorized droneExists(droneId) {
        DroneState storage state = drones[droneId];
        state.y += MOVE_STEP;
        _finalizeAction(state, "ASCEND");
    }

    // 8. Descend (Shift)
    function descend(uint256 droneId) external onlyAuthorized droneExists(droneId) {
        DroneState storage state = drones[droneId];
        state.y -= MOVE_STEP;
        if (state.y < 0) state.y = 0; // Hard floor
        _finalizeAction(state, "DESCEND");
    }

    // Internal helper
    function _finalizeAction(DroneState storage state, string memory actionType) internal {
        state.missionCount += 1;
        state.lastUpdateBlock = block.number;
        state.lastUpdateTime = block.timestamp;
        state.lastOperator = msg.sender;

        emit FlightAction(
            state.droneId,
            actionType,
            state.x,
            state.y,
            state.z,
            state.heading,
            state.missionCount,
            block.timestamp,
            msg.sender
        );
    }
}

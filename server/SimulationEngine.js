const {ENTITIES} = require('./entities');
const logger = require('./logger');
const {TICK_MS, KM_PER_DEG, DEFAULT_SPEED_MULT} = require('./constants');

class SimulationEngine {
    constructor(onEvent) {
        this.onEvent = onEvent;
        this.simState = 'stopped';
        this.simTime = 0;
        this.speedMult = DEFAULT_SPEED_MULT;
        this.entities = this._cloneEntities();
        this.intervalId = null;
        this._positionLogTimers = {};
    }
    getSnapshot() {
        return {
            simState: this.simState,
            simTime: this.simTime,
            speedMult: this.speedMult,
            entities: this._serializeEntities(),
        };
    }

    handleCommand(msg) {
        switch (msg.type) {
            case 'PLAY':
                return this._play();
            case 'PAUSE':
                return this._pause();
            case 'STOP':
                return this._stop();
            case 'STEP':
                return this._step();
            case 'ADD_WAYPOINT':
                return this._addWaypoint(msg.entityId, msg.position);
            case 'SET_SPEED':
                return this._setSpeed(msg.multiplier);
            case 'LOAD_STATE':
                return this._loadState(msg.entities);
            case 'ADD_ENTITY':
                return this._addEntity(msg.entity);
            case 'REMOVE_ENTITY':
                return this._removeEntity(msg.entityId);
            case 'RESET':
                return this._reset();
        }
    }

    _play() {
        if (this.simState === 'running') return;
        this.simState = 'running';
        this.intervalId = setInterval(() => this._tick(), TICK_MS);
        this._emitSimState();
        this._emitLog('log.started', 'info', {}, 'system');
        logger.engine('PLAY', `simTime=${this.simTime.toFixed(1)}s`);
    }

    _pause() {
        if (this.simState !== 'running') return;
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.simState = 'paused';
        this._emitSimState();
        this._emitLog('log.paused', 'warning', {}, 'system');
        logger.engine('PAUSE', `simTime=${this.simTime.toFixed(1)}s`);
    }

    _stop() {
        if (this.simState === 'stopped') return;
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.simState = 'stopped';
        this.simTime = 0;
        this.entities = this._cloneEntities();
        this._emitSimState();
        for (const entity of this.entities) {
            this._emitEntityUpdate(entity);
            this.onEvent({type: 'ROUTE_UPDATED', id: entity.id, route: entity.route});
        }
        this._emitLog('log.stopped', 'error', {}, 'system');
        logger.engine('STOP', 'state reset');
    }

    _step() {
        if (this.simState === 'running') return;
        if (this.simState === 'stopped') this.simState = 'paused';
        this._tick();
        this._emitSimState();
        this._emitLog('log.step', 'info', {}, 'system');
        logger.engine('STEP', `simTime=${this.simTime.toFixed(1)}s`);
    }

    // ── Tick / Movement ─────────────────────────────────────────

    _tick() {
        const dt = TICK_MS / 1000; // seconds
        this.simTime += dt * this.speedMult;

        let anyMoved = false;
        for (const entity of this.entities) {
            if (entity.speed > 0 && entity.damage < 100 && entity.route.length >= 2 && entity._routeIndex < entity.route.length - 1) {
                this._moveEntity(entity, dt);
                anyMoved = true;
            }
        }

        if (!anyMoved) {
            this.onEvent({type: 'SIM_TIME', simTime: this.simTime});
        }
    }

    _moveEntity(entity, dt) {
        if (entity._routeIndex === undefined) entity._routeIndex = 0;
        if (entity._segProgress === undefined) entity._segProgress = 0;

        const route = entity.route;
        let remaining = (entity.speed / 3600) * dt * this.speedMult;

        while (remaining > 0 && entity._routeIndex < route.length - 1) {
            const from = route[entity._routeIndex];
            const to = route[entity._routeIndex + 1];

            const dLon = to[0] - from[0];
            const dLat = to[1] - from[1];
            const cosLat = Math.cos((from[1] * Math.PI) / 180);
            const segLenKm = Math.sqrt(
                (dLon * KM_PER_DEG * cosLat) ** 2 +
                (dLat * KM_PER_DEG) ** 2
            );

            if (segLenKm === 0) {
                entity._routeIndex++;
                continue;
            }

            const segRemaining = segLenKm * (1 - entity._segProgress);

            if (remaining < segRemaining) {
                entity._segProgress += remaining / segLenKm;
                const t = entity._segProgress;
                entity.position = [from[0] + dLon * t, from[1] + dLat * t];
                remaining = 0;
            } else {
                remaining -= segRemaining;
                entity._routeIndex++;
                entity._segProgress = 0;
                entity.position = to;

                if (entity._routeIndex >= route.length - 1) {
                    this._emitLog('log.reachedEndOfRoute', 'info', {callsign: entity.callsign}, 'route');
                    logger.engine('ROUTE_END', `callsign=${entity.callsign}`);
                    break;
                }
            }
        }

        this._emitEntityUpdate(entity);
        this._maybeLogPosition(entity);
    }

    _maybeLogPosition(entity) {
        const now = Date.now();
        const last = this._positionLogTimers[entity.id] || 0;
        if (now - last >= 1000) {
            this._positionLogTimers[entity.id] = now;
            this._emitLog('log.position', 'info', {
                callsign: entity.callsign,
                lon: entity.position[0].toFixed(4),
                lat: entity.position[1].toFixed(4),
            }, 'position');
        }
    }

    _loadState(entityData) {
        const wasRunning = this.simState === 'running';
        if (wasRunning) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.simState = 'stopped';
        this.simTime = 0;
        this.entities = this._cloneEntities();

        // Apply loaded positions and routes
        for (const loaded of entityData) {
            const entity = this.entities.find(e => e.id === loaded.id);
            if (!entity) continue;
            if (loaded.position) entity.position = loaded.position;
            if (loaded.route) {
                entity.route = loaded.route;
                entity._routeIndex = 0;
                entity._segProgress = 0;
            }
        }

        this._emitSimState();
        for (const entity of this.entities) {
            this._emitEntityUpdate(entity);
            this.onEvent({type: 'ROUTE_UPDATED', id: entity.id, route: [...entity.route]});
        }
        this._emitLog('log.stateLoaded', 'info', {}, 'system');
        logger.engine('LOAD_STATE', `entities=${entityData.length}`);
    }

    _addEntity(data) {
        const id = String(Date.now());
        const entity = {
            ...data,
            id,
            route: data.position ? [data.position] : [],
            damage: 0,
            ammo: 100,
            _routeIndex: 0,
            _segProgress: 0,
        };
        this.entities.push(entity);
        const {_routeIndex, _segProgress, ...pub} = entity;
        this.onEvent({type: 'ENTITY_CREATED', entity: pub});
        this._emitLog('log.entityAdded', 'info', {callsign: entity.callsign}, 'system');
        logger.engine('ADD_ENTITY', `callsign=${entity.callsign} | id=${id}`);
    }

    _reset() {
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.simState = 'stopped';
        this.simTime = 0;
        this._positionLogTimers = {};
        this.entities = this._cloneEntities();
        this._emitSimState();
        for (const entity of this.entities) {
            this._emitEntityUpdate(entity);
            this.onEvent({type: 'ROUTE_UPDATED', id: entity.id, route: [...entity.route]});
        }
        this.onEvent({type: 'ENTITIES_RESET', entities: this._serializeEntities()});
        this._emitLog('log.reset', 'warning', {}, 'system');
        logger.engine('RESET', 'state restored to defaults');
    }

    _removeEntity(entityId) {
        const idx = this.entities.findIndex(e => e.id === entityId);
        if (idx === -1) return;
        const entity = this.entities[idx];
        this.entities.splice(idx, 1);
        delete this._positionLogTimers[entityId];
        this.onEvent({type: 'ENTITY_DESTROYED', id: entityId});
        this._emitLog('log.entityRemoved', 'warning', {callsign: entity.callsign}, 'system');
        logger.engine('REMOVE_ENTITY', `callsign=${entity.callsign} | id=${entityId}`);
    }

    _setSpeed(multiplier) {
        this.speedMult = Math.max(1, Math.min(1000, multiplier));
        logger.engine('SET_SPEED', `multiplier=${this.speedMult}`);
    }

    _addWaypoint(entityId, position) {
        const entity = this.entities.find(e => e.id === entityId);
        if (!entity || entity.speed === 0) return;

        entity.route.push(position);

        this.onEvent({type: 'ROUTE_UPDATED', id: entity.id, route: [...entity.route]});
        this._emitLog('log.waypointAdded', 'info', {callsign: entity.callsign}, 'route');
        logger.engine('WAYPOINT_ADDED', `callsign=${entity.callsign} | route.length=${entity.route.length} | pos=[${position.map(v => v.toFixed(4))}]`);
    }

    _cloneEntities() {
        return JSON.parse(JSON.stringify(ENTITIES)).map(e => ({
            ...e,
            _routeIndex: 0,
            _segProgress: 0,
        }));
    }

    _serializeEntities() {
        return this.entities.map(({_routeIndex, _segProgress, _lastSpeed, ...rest}) => rest);
    }

    _emitEntityUpdate(entity) {
        this.onEvent({
            type: 'ENTITY_UPDATE',
            id: entity.id,
            position: [...entity.position],
            speed: entity.speed,
            damage: entity.damage,
            ammo: entity.ammo,
            simTime: this.simTime,
        });
    }

    _emitSimState() {
        this.onEvent({type: 'SIM_STATE_CHANGED', simState: this.simState, simTime: this.simTime});
    }

    _emitLog(message, severity = 'info', params = {}, category = 'system') {
        this.onEvent({
            type: 'LOG',
            message,
            params,
            severity,
            category,
            timestamp: new Date().toISOString(),
        });
    }
}

module.exports = SimulationEngine;

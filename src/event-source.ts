import * as crypto from "crypto";
import EventEmitter from "events";
import MaterializeIt from "./materialize-it";

class Event {
	@MaterializeIt()
	static get event(): string { return this.name + " (" + crypto.randomUUID() + ")";}
	toString(): string {return (this.constructor as typeof Event).event}
}

export default class EventSource {
	readonly eventEmitter: EventEmitter;
	constructor() {this.eventEmitter = new EventEmitter();}
	static readonly Event: typeof Event = Event;
	on(event: string, ...listeners: Array<(...args: any[]) => void>): void { listeners.forEach(listener => this.eventEmitter.addListener(event, listener)); }
	emit(event: string | Event, ...args) {
		if (event instanceof Event) args.unshift(event);
		this.eventEmitter.emit(event.toString(), ...args);
	}
}

class TransferEntry {
	constructor(readonly target: typeof Object, readonly property: string, readonly transformer: (any) => any | null) { }
}

class Transfers {
	private storage: { [key: string]: Array<TransferEntry> } = {};

	public add(entry: TransferEntry) {
		if (typeof this.storage[entry.property] === "undefined") this.storage[entry.property] = [];
		this.storage[entry.property].push(entry);
	}
	public find(target: typeof Object, property: string): TransferEntry | null {
		if (typeof this.storage[property] === "undefined") return null;
		for (const entry of this.storage[property]) {
			if (entry.target === target) return entry;
		}
		return null;
	}
	public all(target: typeof Object, ...properties: Array<string>): { [key: string]: TransferEntry | null } {
		let entries = {};
		if (properties.length === 0) {
			for (const property in this.storage) {
				let found = this.find(target, property);
				if (found !== null) {
					entries[property] = found;
				}
			}
		} else {
			properties.forEach(property => entries[property] = this.find(target, property));
		}
		return entries;
	}
}

let exportTransfers = new Transfers();
let importTransfers = new Transfers();

class Transfer {
	constructor(private exportTransfers: Transfers, private importTransfers: Transfers) { }
	export(item: Object, ...properties: Array<string>): object {
		let transfers = this.exportTransfers.all(item.constructor as typeof Object, ...properties);
		let data = {};
		for (let property in transfers) {
			let transfer = transfers[property];
			data[property] = transfer === null || transfer.transformer === null ? item[property] : transfer.transformer(item[property]);
		}
		return data;
	}
	import(item: Object, data: {}, ...properties: Array<string>) {
		let transfers = this.importTransfers.all(item.constructor as typeof Object, ...properties);
		for (let property in transfers) {
			let transfer = transfers[property];
			if (typeof data[property] !== "undefined") {
				item[property] = transfer === null || transfer.transformer === null ? data[property] : transfer.transformer(data[property]);
			}
		}
	}
}

export let transfer = new Transfer(exportTransfers, importTransfers);

export function Export(transformer: ((any) => any) | null = null) {
	return function (target: Object, propertyKey: string) {
		exportTransfers.add(new TransferEntry(target.constructor as typeof Object, propertyKey, transformer));
	}
}

export function Import(transformer: ((any) => any) | null = null) {
	return function (target: Object, propertyKey: string) {
		importTransfers.add(new TransferEntry(target.constructor as typeof Object, propertyKey, transformer));
	}
}

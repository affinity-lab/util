import * as fs from "fs";
import * as mime from "mime-types";
import sharp from "sharp";
import * as path from "path";
import MaterializeIt from "./materialize-it";

export default class FileDescriptor {

	constructor(readonly file: string) {}

	@MaterializeIt() get stat(): Promise<fs.Stats | null> { return fs.promises.stat(this.file).catch(() => null);}
	@MaterializeIt() get isImage(): boolean { return this.mimeType.toString().substring(0, 6) === 'image/';}
	@MaterializeIt() get image(): Promise<{meta:sharp.Metadata, stats: sharp.Stats} | null> {
		if(!this.isImage) return null;
		let img = sharp(this.file);
		return Promise.all([img.metadata(), img.stats()]).then(res=>({meta:res[0], stats:res[1]}))
	}
	@MaterializeIt() get mimeType(): string | false { return mime.lookup(this.file) }
	get size(): Promise<number | null> { return this.stat.then(stat => stat?.size);}
	get exists(): Promise<boolean> { return this.stat.then(stat => stat !== null);}
	get name(): string { return this.parsedPath.base}
	@MaterializeIt() get parsedPath(): path.ParsedPath { return path.parse(this.file)}

}
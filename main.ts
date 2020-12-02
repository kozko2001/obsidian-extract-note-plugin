
import { Plugin } from 'obsidian';


export default class ExtractPlugin extends Plugin {
	codemirror: CodeMirror.Editor;

 	onload() {
		console.log('loading extract plugin');

 		this.addCommand({
 			id: 'extract-notes-plugin',
 			name: 'Extract Notes plugin',
			callback: () => this.trigger(),
 		});

		this.registerEvent(this.app.on('codemirror', (cm: CodeMirror.Editor) => {
			this.codemirror = cm;
		}))

	 }
	 
	 trigger() {
		 console.log("something 2222");
		 const logger = (t: any) => { console.log(t); return t; }

		 this.getSelection()
		 	.then(logger)
			.then(async selection => {
				const filename = await this.getNewFilenameFromSelection(selection);
                const tags = filename.match(/(#[^\W]+)|()\[\[[^\W]+]]/g) || [];

                return {filename: filename.replace(/#|\[|]/g,''), selection, tags}
			})
			.then(logger)
			.then(async ({filename, selection, tags}) => {
                for (const tag of tags) {
                    await this.addToTagfile(tag, `![[${filename}]]`);
                }

                return {filename, selection};
			}) 
			.then(logger)
			.then(async ({filename, selection}) => await this.createFile(`${filename}.md`, selection))
			.then(logger)
			.then((filename) => this.codemirror.replaceSelection(`![[${filename}]]`))
			.catch(e => alert(e));
	 }

	 getSelection(): Promise<string> {
		 return new Promise((resolve, reject) => {
			 const selections = this.codemirror.getSelections();

			 if(selections.length === 1 && selections[0] !== '') {
				 resolve(selections[0]);
			 }

			 reject('not valid selection found');
		 })
	 }   
	 
	getNewFilenameFromSelection(selection: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const re = /^\s*#{3,}(.*)$/m
            const g = selection.match(re);

            if(g && g.length === 2) {
                const filename = g[1].trim();

                resolve(filename);
            }

            reject("no title of the note found")
        });
	}
	
	async createFile(filename: string, text: string) {
		const exists = await this.app.vault.adapter.exists(filename, false);
		
		if(exists) {
			throw new Error(`file ${filename} alreaddy exists`);
		} else {
			await this.app.vault.adapter.write(filename, text);
            console.log(`created new file at ${filename}`)
            return filename;
		}
	}	

	async addToTagfile(tag: string, text: String) {
        tag = tag.replace(/#|\[|]/g,''); //remove # [ ]
		const filename = `${tag}.md`

		const exists = await this.app.vault.adapter.exists(filename, false);

		
		if(exists) {
			let content = await this.app.vault.adapter.read(filename)
			content = `\n${text}\n\n${content}`
			await this.app.vault.adapter.write(filename, content);

			return filename;
		}

		throw new Error(`not find tag file name ${tag}`)
    }

	onunload() {
		console.log('unloading extract notes plugin plugin');
	}
}
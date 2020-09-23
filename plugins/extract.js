'use strict';

class ExtractPlugin {
    constructor() {
        this.id = 'Extract';
        this.name = 'Extract plugin';
        this.description = 'Extract notes plugin';
        this.defaultOn = true; // Whether or not to enable the plugin on load
    }
    
    init(app, instance) {
        this.app = app;
        this.instance = instance;
        
        this.instance.registerGlobalCommand({
            id: 'extract',
            name: 'Extract selection',
            callback: () => this.trigger()
        });
    }
    
    trigger() {
        const codeMirror =  this.app.workspace.activeLeaf.view.sourceMode.cmEditor;
        
        const logger = (t) => { console.log(t); return t; };
        this.getSelection(codeMirror)
            .then(logger)
            .then(async selection =>  {
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
            .then(async ({filename, selection, tags}) => await this.createFile(`${filename}.md`, selection))
            .then(logger)
            .then((filename) => codeMirror.replaceSelection(`![[${filename}]]`))
            
            .catch(e => alert(e));
    }
    
    getSelection(codeMirror) {
        return new Promise((resolve, reject) => {
            const selections = codeMirror.getSelections();

            if(selections.length === 1 && selections[0] !== '') {
                resolve(selections[0]);
            }   

            reject("not valid selection found");
        }) 
    }

    getNewFilenameFromSelection(selection) {
        return new Promise((resolve, reject) => {
            const re = /^\s*#{3,}(.*)$/m;
            const g = selection.match(re);

            if(g && g.length === 2) {
                const filename = g[1].trim();

                resolve(filename);
            }

            reject("no title of the note found");
        });
    }

    createFile(filename, text) {
        return new Promise((resolve, reject) => {
            const fullPath = require('path').join(this.app.vault.adapter.basePath, filename);
            if(this.app.vault.adapter.fs.existsSync(fullPath)) {
                reject(`file ${fullPath} alreaddy exists`);
                return;
            } 


            this.app.vault.adapter.fs.writeFileSync(fullPath, text);
            console.log(`created new file at ${fullPath}`);
            resolve(filename);
        });   
    }

    addToTagfile(tag, text) {
        tag = tag.replace(/#|\[|]/g,''); //remove # [ ]

        return new Promise((resolve, reject) => {
            const fullPath = require('path').join(this.app.vault.adapter.basePath, `${tag}.md`);

            if(this.app.vault.adapter.fs.existsSync(fullPath)) {
                let content = this.app.vault.adapter.fs.readFileSync(fullPath);
                content = `\n${text}\n\n${content}`;
                
                this.app.vault.adapter.fs.writeFileSync(fullPath, content);
            
                resolve(fullPath);
            }

            reject(`not find tag file name ${tag}`);
        });
    
    }
}

module.exports = () => new ExtractPlugin();

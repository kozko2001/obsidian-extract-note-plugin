
class ExtractPlugin {
    constructor() {
        this.id = 'Extract'
        this.name = 'Extract plugin'
        this.description = 'Extract notes plugin'
        this.defaultOn = true // Whether or not to enable the plugin on load
    }
    
    init(app, instance) {
        this.app = app
        this.instance = instance
        
        this.instance.registerGlobalCommand({
            id: 'extract',
            name: 'Extract selection',
            callback: () => this.trigger()
        });
    }
    
    trigger() {
        const codeMirror =  this.app.workspace.activeLeaf.view.sourceMode.cmEditor;
        
        const logger = (t) => { console.log(t); return t; }
        this.getSelection(codeMirror)
            .then(logger)
            .then(async selection =>  {
                const title = await this.getNewFilenameFromSelection(selection);
                return {title, selection}
            })
            .then(logger)
            .then(async ({title, selection}) => await this.createFile(`${title}.md`, selection))
            .then(logger)
            .then((filename) => codeMirror.replaceSelection(`![[${filename}]]`))
            .catch(e => alert(e))
    }
    
    getSelection(codeMirror) {
        return new Promise((resolve, reject) => {
            const selections = codeMirror.getSelections()

            if(selections.length === 1 && selections[0] !== '') {
                resolve(selections[0]);
            }   

            reject("not valid selection found")
        }) 
    }

    getNewFilenameFromSelection(selection) {
        return new Promise((resolve, reject) => {
            const re = /^\s*#{3,}(.*)$/m
            const g = selection.match(re);

            if(g && g.length === 2) {
                resolve(g[1].trim().replace("#", ""));
            }

            reject("no title of the note found")
        });
    }

    createFile(filename, text) {
        return new Promise((resolve, reject) => {
            const fullPath = require('path').join(this.app.vault.adapter.basePath, filename)
            if(this.app.vault.adapter.fs.existsSync(fullPath)) {
                reject(`file ${fullPath} alreaddy exists`);
                return;
            } 


            this.app.vault.adapter.fs.writeFileSync(fullPath, text)
            console.log(`created new file at ${fullPath}`)
            resolve(filename)
        });   
    }
}

module.exports = () => new ExtractPlugin()
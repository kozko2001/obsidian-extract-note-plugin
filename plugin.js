class TestPlugin {
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
        
        const selection = this.getSelection(codeMirror);

        let title;
        if(selection) {
            title = this.getNewFilenameFromSelection(selection);
        } else {
            alert("no valid selection found")
            return;
        }

        if(title) {
            this.createFile(`${title}.md`, selection);
            codeMirror.replaceSelection(`![[${title}]]`);
        } else {
            alert("could not extract the title from the selection");
            return
        }

    }
    
    getSelection(codeMirror) {
        const selections = codeMirror.getSelections()

        if(selections.length === 1 && selections[0] !== '') {
            return selections[0];
        }   

        return undefined;
    }

    getNewFilenameFromSelection(selection) {
        const re = /^\s*#{3,}(.*)$/m
        const g = selection.match(re);

        if(g && g.length === 2) {
            return g[1].trim().replace("#", "");
        }

        return undefined;
    }

    createFile(filename, text) {
        const fullPath = require('path').join(this.app.vault.adapter.basePath, filename)
        this.app.vault.adapter.fs.writeFileSync(fullPath, text)
        console.log(`created new file at ${fullPath}`)
    }

    
}

module.exports = () => new TestPlugin()
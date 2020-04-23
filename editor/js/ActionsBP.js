function ActionsBP(actions) {
    this.init(actions);
};

ActionsBP.prototype.init = function(actions) {
    var ui = actions.editorUi;
    var editor = ui.editor;
    var graph = editor.graph;

    var lastUndo = 0;

    actions.addAction('editCode', function () {
        var cell = graph.getSelectionCell() || graph.getModel().getRoot();

        if (cell != null) {
            var dlg = new CodeEditorDialog(ui, cell);
            ui.showDialog(dlg.container, 520, 420, true, true);
            dlg.init();
        }
    });

    actions.addAction('runModel', function() {
        var cells = graph.getModel().cells;
        fixValues(Object.values(cells));

        var code = mxUtils.getPrettyXml(ui.editor.getGraphXml());
        console.log(code);
        parse_graph(code);

        mxUtils.alert("Code deployed");
    }, null, null, 'Alt+Shift+R');

    actions.addAction('editBsync', function() {
        var cell = graph.getSelectionCell() || graph.getModel().getRoot();

        if (cell != null) {
            var dlg = new BSyncForm(ui, cell);
            ui.showDialog(dlg.container, 520, 420, true, true);
            dlg.init();
        }
    });

    actions.addAction('next_sbs', function() {
        graph.getModel().beginUpdate();

        ui.redo();
        ui.disableActionsForDebugging(false);

        graph.clearSelection()

        graph.getModel().endUpdate();
    }, false, null);

    actions.addAction('back_sbs', function() {

        if(editor.undoManager.indexOfNextAdd > lastUndo) {
            graph.getModel().beginUpdate();

            ui.undo();
            ui.disableActionsForDebugging(false);

            graph.clearSelection()

            graph.getModel().endUpdate();
        }
    }, false, null);

    actions.addAction('stop_sbs', function() {

        editor.undoManager.indexOfNextAdd = editor.undoManager.history.length
        var numOfNewUndos = editor.undoManager.history.length - lastUndo + 1;
        while(numOfNewUndos-- > 0) {
            ui.undo()
            editor.undoManager.history.pop()
        }

        ui.endDebugging();

        graph.clearSelection()

    }, false, null);

     actions.addAction('debug_sbs', function() {

         var cells = graph.getModel().cells;
         fixValues(Object.values(cells));

         lastUndo = editor.undoManager.indexOfNextAdd + 1;

         var mod = graph.getModel()
         lockLayer(mod, true)

         var code = mxUtils.getPrettyXml(ui.editor.getGraphXml());
         console.log(code);
         parse_graph(code);

         // coloring
         var record = getProgramRecord();

         for (let i = 0; i < record.length; i++) {
             graph.model.beginUpdate();

             var curRec = record[i];
             for (let j = 0; j < curRec.length; j++) {
                 var cell = mod.getCell(curRec[j][0]);
                 var val = cell.clone().getValue();
                 val.setAttribute('Payload', curRec[j][1]);
                 // indicator
                 var style = cell.getStyle()
                 style = style.replace('strokeColor=#000000', 'strokeColor=#ff0000');
                 mod.setStyle(cell, style);
                 ////////////
                 mod.setValue(cell, val);
             }

             graph.model.endUpdate();
         }
         //

         let numOfUndos = editor.undoManager.indexOfNextAdd - lastUndo
         for (let i = 0; i < numOfUndos; i++) {
             graph.model.beginUpdate();

             ui.undo();

             graph.model.endUpdate();
         }

         ui.startDebugging();

         ui.noUndo();

         graph.clearSelection()

     }, null, null);
};

function lockLayer(mod, lock) {
    var locker;
    lock ? locker = 1 : locker = 0;
    mod.root.children.forEach(layer => {
        if(mod.isLayer(layer)) {
            var style = layer.getStyle();
            style !== undefined ? style = style.replace('locked=' + locker, 'locked=' + !locker) : style = 'locked=' + locker;
            mod.setStyle(layer, style);
        }
    });
}

function fixValues(cells) {
    for(let i = 0; i < cells.length; i++)
    {
        let c = cells[i];
        let value = c.getValue();

        // Converts the value to an XML node
        if (value == "")
        {
            var doc = mxUtils.createXmlDocument();
            var obj = doc.createElement('object');
            obj.setAttribute('label', value || '');
            value = obj;
        }

        c.setValue(value);
    }
}
// mxGraphBP.prototype.init = function(container)

// function mxGraphBP(container, model, renderHint, stylesheet){
//     mxGraph.call(this,container, model, renderHint, stylesheet);
// };
//
// mxGraphBP.prototype = Object.create(mxGrap.prototype);


mxGraph.prototype.insertEdge = function(parent, id, value, source, target, style, state)
{

    var edge = this.createEdge(parent, id, value, source, target, style, state);
    if( edge==null)
        return null;
    return this.addEdge(edge, parent, source, target);
};

function isOutEdge(source,edge){
    return edge.source.getId()==source.getId();
};

function getNumOfOutEdges(source){
    var result = 0 ;
    for(var i=0 ; i<source.getEdgeCount() ; i++){
        if (isOutEdge(source,source.edges[i]))
            result++;
    }
    return result;
};


function findCurrLabel(source, state) {
    //there is only one constraint point
    if(source.new_constraints == null)
        return 1;
    //search for the source constraint of the edge
    var index = 0;
    for(; index <= source.new_constraints.length; index++){
        var constraint = source.new_constraints[index];
        if(constraint.point.x == state.exitX && constraint.point.y == state.exitY)
            break;
    }
    return index+1;
}
function getOutEdges(source) {
    var outEdges = [];
    for (let i = 0; i < source.getEdgeCount(); i++) {
        if (isOutEdge(source, source.edges[i]))
            outEdges.push(source.edges[i])
    }
    outEdges.sort((edge)=>edge.getAttribute('labelNum'));
    return outEdges;
}


mxGraph.prototype.createEdge = function(parent, id, value, source, target, style, state)
{
    // Creates the edge
    var edge = new mxCell(value, new mxGeometry(), style);
    edge.setId(id);
    edge.setEdge(true);
    edge.geometry.relative = true;

    //check basic legal Edge
    if(source!=null && ( target ==null || getshape(target.getStyle())=="startnode"))
        return null;

    //cases by nodes
    if(source!=null && getshape(source.getStyle())=="general" ){
        var numberOfOutEdges = getNumOfOutEdges(source);
        // if(numberOfOutEdges >= source.getAttribute('numberOfOutputs',1))
        //     return null;
        var indexLabel =findCurrLabel(source, state);
        var label = source.getAttribute('Outputnumber'+(indexLabel),' ');

        var doc = mxUtils.createXmlDocument();
        var obj = doc.createElement('object');
        obj.setAttribute('label','');
        var value = obj;

        value.setAttribute('labelNum',indexLabel);
        value.setAttribute('label',label);
        edge.setValue(value);

    }else if(source!=null && getshape(source.getStyle())=="bsync" ){
        var numberOfOutEdges = getNumOfOutEdges(source);
        if(numberOfOutEdges >= 1)
            return null;

    }else if(source!=null && getshape(source.getStyle())=="startnode" ){
        var numberOfOutEdges = getNumOfOutEdges(source);
        if(numberOfOutEdges >= 1)
            return null;
    }
    return edge;
};



mxGraph.prototype.createConnectionHandler = function()
{
    return new mxConnectionHandlerBP(this);
};


function mxConnectionHandlerBP(graph, factoryMethod){
    mxConnectionHandler.call(this,graph, factoryMethod);
};


mxConnectionHandlerBP.prototype = Object.create(mxConnectionHandler.prototype);


mxConnectionHandlerBP.prototype.checkLeftConstraints = function(c1, c2) {
    if(c2 != null && c2.point != null)
        return ((c2.point.x <= 0.03) || (c2.point.y < 0.95 && c2.point.y > 0.05));
    return true;
};

mxConnectionHandlerBP.prototype.insertEdge = function(parent, id, value, source, target, style, state)
{
    if (this.factoryMethod == null)
    {
        return this.graph.insertEdge(parent, id, value, source, target, style, state);
    }
    else
    {
        var edge = this.createEdge(value, source, target, style);
        edge = this.graph.addEdge(edge, parent, source, target);

        return edge;
    }
};


function addEntryPerimeter(edge) {
    return edge.style+="entryX=0;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;"
}

function checkAndFixBorder(edge) {
    var styles = edge.style.split(";");
    styles=styles.map(x=>x.split("="));
    var stylesDic={};
    function toDictionary(style,val) {
        stylesDic[style]=val;
    }

    for (let i = 0; i < styles.length; i++) {
        toDictionary(styles[i][0],styles[i][1])
    }
    stylesDic["entryX"]="0";
    if (stylesDic["entryY"]>"0.98" || stylesDic["entryY"]<"0.02")
        stylesDic["entryY"]= "0.5";
    var newStyle="";
    for (var key in stylesDic) {
        newStyle+=key+"="+stylesDic[key]+";";
    }
    edge.style=newStyle;

}

//this is for labels per constraint point
mxConnectionHandlerBP.prototype.connect = function(source, target, evt, dropTarget)
{
    if (target != null || this.isCreateTarget(evt) || this.graph.allowDanglingEdges)
    {
        // Uses the common parent of source and target or
        // the default parent to insert the edge
        var model = this.graph.getModel();
        var terminalInserted = false;
        var edge = null;

        model.beginUpdate();
        try
        {
            if (source != null && target == null && !this.graph.isIgnoreTerminalEvent(evt) && this.isCreateTarget(evt))
            {
                target = this.createTargetVertex(evt, source);

                if (target != null)
                {
                    dropTarget = this.graph.getDropTarget([target], evt, dropTarget);
                    terminalInserted = true;

                    // Disables edges as drop targets if the target cell was created
                    // FIXME: Should not shift if vertex was aligned (same in Java)
                    if (dropTarget == null || !this.graph.getModel().isEdge(dropTarget))
                    {
                        var pstate = this.graph.getView().getState(dropTarget);

                        if (pstate != null)
                        {
                            var tmp = model.getGeometry(target);
                            tmp.x -= pstate.origin.x;
                            tmp.y -= pstate.origin.y;
                        }
                    }
                    else
                    {
                        dropTarget = this.graph.getDefaultParent();
                    }

                    this.graph.addCell(target, dropTarget);
                }
            }

            var parent = this.graph.getDefaultParent();

            if (source != null && target != null &&
                model.getParent(source) == model.getParent(target) &&
                model.getParent(model.getParent(source)) != model.getRoot())
            {
                parent = model.getParent(source);

                if ((source.geometry != null && source.geometry.relative) &&
                    (target.geometry != null && target.geometry.relative))
                {
                    parent = model.getParent(parent);
                }
            }

            // Uses the value of the preview edge state for inserting
            // the new edge into the graph
            var value = null;
            var style = null;

            if (this.edgeState != null)
            {
                value = this.edgeState.cell.value;
                style = this.edgeState.cell.style;
            }

            edge = this.insertEdge(parent, null, value, source, target, style);

            if (edge != null)
            {
                // Updates the connection constraints
                this.graph.setConnectionConstraint(edge, source, true, this.sourceConstraint);
                this.graph.setConnectionConstraint(edge, target, false, this.constraintHandler.currentConstraint);
                if(!edge.style.includes("entryPerimeter"))
                    edge.style+=addEntryPerimeter(edge);
                checkAndFixBorder(edge);
                // Uses geometry of the preview edge state
                if (this.edgeState != null)
                {
                    model.setGeometry(edge, this.edgeState.cell.geometry);
                }

                var parent = model.getParent(source);

                // Inserts edge before source
                if (this.isInsertBefore(edge, source, target, evt, dropTarget))
                {
                    var index = null;
                    var tmp = source;

                    while (tmp.parent != null && tmp.geometry != null &&
                    tmp.geometry.relative && tmp.parent != edge.parent)
                    {
                        tmp = this.graph.model.getParent(tmp);
                    }

                    if (tmp != null && tmp.parent != null && tmp.parent == edge.parent)
                    {
                        model.add(parent, edge, tmp.parent.getIndex(tmp));
                    }
                }

                // Makes sure the edge has a non-null, relative geometry
                var geo = model.getGeometry(edge);

                if (geo == null)
                {
                    geo = new mxGeometry();
                    geo.relative = true;

                    model.setGeometry(edge, geo);
                }

                // Uses scaled waypoints in geometry
                if (this.waypoints != null && this.waypoints.length > 0)
                {
                    var s = this.graph.view.scale;
                    var tr = this.graph.view.translate;
                    geo.points = [];

                    for (var i = 0; i < this.waypoints.length; i++)
                    {
                        var pt = this.waypoints[i];
                        geo.points.push(new mxPoint(pt.x / s - tr.x, pt.y / s - tr.y));
                    }
                }

                if (target == null)
                {
                    var t = this.graph.view.translate;
                    var s = this.graph.view.scale;
                    var pt = (this.originalPoint != null) ?
                        new mxPoint(this.originalPoint.x / s - t.x, this.originalPoint.y / s - t.y) :
                        new mxPoint(this.currentPoint.x / s - t.x, this.currentPoint.y / s - t.y);
                    pt.x -= this.graph.panDx / this.graph.view.scale;
                    pt.y -= this.graph.panDy / this.graph.view.scale;
                    geo.setTerminalPoint(pt, false);
                }

                this.fireEvent(new mxEventObject(mxEvent.CONNECT, 'cell', edge, 'terminal', target,
                    'event', evt, 'target', dropTarget, 'terminalInserted', terminalInserted));
            }
        }
        catch (e)
        {
            mxLog.show();
            mxLog.debug(e.message);
        }
        finally
        {
            model.endUpdate();
        }

        if (this.select)
        {
            this.selectCells(edge, (terminalInserted) ? target : null);
        }
    }
};



mxGraph.prototype.setCellStyles = function(key, value, cells)
{
    cells = cells || this.getSelectionCells();
    mxUtils.setCellStyles(this.model, cells, key, value);
};

//mxGraphBP.prototype.constructor = mxGraph;
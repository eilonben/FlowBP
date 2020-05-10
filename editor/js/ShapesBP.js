
function FlowShape()
{
    mxRectangleShape.call(this);
};

mxUtils.extend(FlowShape, mxRectangleShape);

var outputPoint = new mxPoint(mxConnectionHandlerBP.defultOutputX, mxConnectionHandlerBP.defultOutputY);
var inputPoint = new mxPoint(mxConnectionHandlerBP.defultInputX, mxConnectionHandlerBP.defultInputY);

FlowShape.prototype.constraints = [new mxConnectionConstraint(outputPoint, true, "O"),
    new mxConnectionConstraint(inputPoint, true, "I")];


FlowShape.prototype.width = 110;
FlowShape.prototype.height = 25;
FlowShape.prototype.corner = 10;
FlowShape.prototype.getLabelMargins = function(rect)
{
    return new mxRectangle(0, 0,
        rect.width - (parseFloat(mxUtils.getValue(this.style, 'width', this.width) * this.scale)),
        rect.height - (parseFloat(mxUtils.getValue(this.style, 'height', this.height) * this.scale)));
};


FlowShape.prototype.paintBackground = function(c, x, y, w, h)
{
    var co = this.corner;
    var w0 = Math.min(w, Math.max(co, parseFloat(mxUtils.getValue(this.style, 'width', this.width))));
    var h0 = Math.min(h, Math.max(co * 1.5, parseFloat(mxUtils.getValue(this.style, 'height', this.height))));
    var bg = mxUtils.getValue(this.style, mxConstants.STYLE_SWIMLANE_FILLCOLOR, mxConstants.NONE);

    if (bg != mxConstants.NONE)
    {
        c.setFillColor(bg);
        c.rect(x, y, w, h);
        c.fill();
    }

    if (this.fill != null && this.fill != mxConstants.NONE && this.gradient && this.gradient != mxConstants.NONE)
    {
        var b = this.getGradientBounds(c, x, y, w, h);
        c.setGradient(this.fill, this.gradient, x, y, w, h, this.gradientDirection);
    }
    else
    {
        c.setFillColor(this.fill);
    }

    c.begin();
    c.moveTo(x, y);
    c.lineTo(x + w0, y);
    c.lineTo(x + w0, y + Math.max(0, h0 - co * 1.5));
    c.lineTo(x + Math.max(0, w0 - co), y + h0);
    c.lineTo(x, y + h0);
    c.close();
    c.fillAndStroke();

    c.begin();
    c.moveTo(x + w0, y);
    c.lineTo(x + w, y);
    c.lineTo(x + w, y + h);
    c.lineTo(x, y + h);
    c.lineTo(x, y + h0);
    c.stroke();
};


//*******************************start node*******************************
function BsyncStartNosde()
{
    mxTriangle.call(this);
};

mxUtils.extend(BsyncStartNosde, FlowShape);
mxUtils.extend(BsyncStartNosde, mxTriangle);

BsyncStartNosde.prototype.constraints = [new mxConnectionConstraint(outputPoint, true, "O")];

mxCellRenderer.registerShape('flow.startnode', BsyncStartNosde);



//*******************************bsync node*******************************

function BsyncShape()
{
    FlowShape.call(this);
};
mxUtils.extend(BsyncShape, FlowShape);

mxCellRenderer.registerShape('flow.bsync', BsyncShape);


//*******************************general node*******************************
function GeneralShape()
{
    FlowShape.call(this);
};
mxUtils.extend(GeneralShape, FlowShape);

//filed only in general constraints
BsyncShape.prototype.constraints[0].index = 0;

mxCellRenderer.registerShape('flow.general', GeneralShape);


//******************************************console***********************************************
function ConsoleShape()
{
    // mxImageShape.call(this);
    FlowShape.call(this);
};



mxUtils.extend(ConsoleShape, FlowShape);
// mxUtils.extend(ConsoleShape, mxImageShape);

mxCellRenderer.registerShape('flow.console', ConsoleShape);


//******************************************text***********************************************
function TextSBP()
{
    // mxImageShape.call(this);
    mxText.call(this);
};



mxUtils.extend(TextSBP, mxText);

mxText.prototype.constraints = [];
TextSBP.prototype.constraints = [];

mxCellRenderer.registerShape('flow.text', TextSBP);


//******************************************labele***********************************************
function LabelBP()
{
    // mxImageShape.call(this);
    mxLabel.call(this);
};



mxUtils.extend(LabelBP, mxLabel);

LabelBP.prototype.constraints = [];

mxCellRenderer.registerShape('flow.label', LabelBP);

//******************************************line***********************************************
function LineBP()
{
    // mxImageShape.call(this);
    mxLine.call(this);
};



mxUtils.extend(LineBP, mxLine);

LineBP.prototype.constraints = [];

mxCellRenderer.registerShape('flow.line', LineBP);

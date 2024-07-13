//Copyright (c) ©1994-2023 SmartDraw, LLC. All rights reserved.
//This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.


//VisualScript SDK 2.0 Classes
///////////////////// Defines ////////////////////
VS = {};
VS.Version = 20;
VS.DefaultMaxShapes = 200;


VS.ShapeConnectorTypes =
    {
        Flowchart: "Flowchart",
        DecisionTree: "Decisiontree",
        Mindmap: "Mindmap",
        OrgChart: "Orgchart",
        Hierarchy: "Hierarchy",
    };

VS.ShapeContainerArrangement =
{
    Row: "Row",
    Column: "Column",
    Matrix: "Square",
    Kanban: "Kanban",
    Sparse: "Sparse",
    Kanban_Row: "Kanban_Row",
    Sparse_Row: "Sparse_Row",
};

VS.ShapeContainerAllowedTypes =
{
    All: 0,
    AllowOnlyContainers: 1,
    AllowOnlyNonContainers: 2,
};

VS.ShapeTypes =
    {
    Rectangle:"Rect",
    RoundedRectangle: "RRect",
    Oval: "Oval",
    Circle: "Circle",
    Square: "Square",
    Diamond: "Diamond",
    };

VS.DataColumnTypes =
    {
    Text: "string",
    Int: "int",
    Float: "float",
    Bool: "bool",
    Date: "date",
    Header: "header",
    JSON: "json",
    };

VS.TextAlignH =
    {
        Left: "left",
        Right: "right",
        Center: "center",
    };

VS.TextAlignV =
    {
        Top: "top",
        Bottom: "bottom",
        Middle: "middle",
    };

VS.TextGrow = {
    Proportional:"Proportional",
    Horizontal: "Horizontal",
    Vertical: "Vertical",
};

VS.LabelPosition =
	{
		Above: "above",
		Below: "below",
		Inside: "inside",
	};

VS.LinePatterns =
    {
        Solid: "Solid",
        Dotted: "Dotted",
        Dashed: "Dashed",
    };

VS.Arrowheads =
    {
    None: 0,
    Filled: 1,
    LineArrow: 2,
    Fancy: 3,
    FilledCircle: 4,
    EmptyCircle: 5,
    FilledSquare: 6,
    EmptySquare: 7,
    CrowsFoot: 8,
    BackSlash: 9,
    FilledCrowsFoot: 10,
    Diamond: 11,
    ZeroToMany: 12,
    OneToMany: 13,
    ZeroToOne: 14,
    OneToOne: 15,
    OneToZero: 16,
    CenterFilled: 17,
    CenterLineArrow: 18,
    CenterFancy: 19,
    Double: 20,
    DimensionFilled: 21,
    DimensionPlain: 22,
    DimensionLine: 23,
    Metafile: 24,
    ArcDown: 25,
    ArcUp: 26,
    HalfUp: 27,
    HalfDown: 28,
    CenterCross: 29,
    HalfLineUp: 30,
    HalfLineDown: 31,
    ForwardSlash: 32,
    OpenFilled: 33,
    OpenCrowsFoot: 34,
    OpenDiamond: 35,
    Cross: 36,
    IndicatorDown: 37,
    IndicatorUp: 38,
    RoundEnd: 39
    };

VS.NoteIcons =
    {
    Note: "Note",
    Info: "Info",
	};

VS.ReturnLineTypes =
	{
		Standard: "Standard",
		Curved: "Curved",
		Straight: "Straight",
	};

VS.Directions =
    {
        Left: "Left",
        Right: "Right",
        Top: "Top",
        Bottom: "Bottom",
        Up: "Up",
        Down:"Down",
    };

VS.CellFlags =
    {
        IconPhotoCell: 1
    };

VS.ConnectorArrangement =
    {
    Row: "Row",
    Stagger: "Stagger",
    Column: "Column",
    LeftColumn: "LeftColumn",
    TwoColumn: "TwoColumn",
    };

VS.Templates =
    {
    Mindmap:"Mindmap",
    Flowchart:"Flowchart",
    Orgchart:"Orgchart",
    Hierarchy:"Hierarchy",
    Decisiontree:"Decisiontree",
    Gantt:"Gantt",
    DatabaseERD:"DatabaseERD",
    Classdiagram:"Classdiagram",
    Sitemap:"Sitemap",
    Timeline: "Timeline",
    AWS: "AWS",
    Azure: "Azure",
    LineDrawUML: "LineDrawUML",
    WhiteBoarding: "WhiteBoarding",
    PIBoard: "PIBoard",
    ProductRoadmap: "ProductRoadmap",
    EpicDependencies: "EpicDependencies",
    BlockingIssue: "BlockingIssue",
    };

VS.GanttChartHolidays =
    {
    None: "None",
    USA: "USA",
    UK: "UK",
    Australia: "Australia",
    Canada: "Canada",
    };

VS.GanttChartColumnNames =
    {
    Row: "Row",
    Task: "Task",
	Start: "Start",
	StartTime: "StartTime",
    Length: "Length",
	End: "End",
	EndTime: "EndTime",
    Parent: "Parent",
    Master: "Master",
    Person: "Person",
    PercentComplete: "PercentComplete",
    Department: "Department",
    Cost: "Cost",
	Custom: "Custom",
	DateGrid:"DateGrid",
    };

VS.Timeline_Arrangements =
    {
    Row1: "Row-1",
	Grid1: "Grid-1",
    GridBlock1: "Grid-Block1",
    GridSwimlane1: "Grid-Swimlane1",
    };

VS.TimelineUnits =
    {
    HundredYear: 100,           // 100 years in days
    FiftyYear: 50,              // 50 years in days
    TenYear: 10,                // Ten years in days
    FiveYear: 5,                // Five years in days
    TwoYear: 2,                 // Two years in days
    Year: 365,                  // One year in days
    Quarter: 92,	            // one quarter
    Month: 31,	                // one month
    Week: 7,	                // one week
    Day: 1,	                    // one day
    TwelveHour: -12,	        // 12 hours
    SixHour: -6,	            // six hours
    FourHour: -4,	            // four hours
    TwoHour: -2,	            // two hours
    Hour: -1,	                // hour
    };

VS.Timeline_EventTypes =
    {
    Bubble: "Bubble",
    BubbleVertical: "Bubble-Vertical",
    BubbleTextOnly: "TextOnly",
    GridBullet: "Grid-Bullet",
    GridBar: "Grid-Bar",
    GridBlock: "Grid-Block",
    GridSwimlane: "Grid-Swimlane",
    };

VS.Timeline_BubbleEventPositions =
    {
    Above: "above",
    AboveCenter: "above-center",
    Below: "below",
    BelowCenter: "below-center",
    Alternate: "alternate",
    AlternateCenter: "alternate-center",
	};

VS.Timeline_RowTypes =
	{
		EventRow: "event-row",
		LabelRow: "label-row",
    };

VS.Timeline_RowIndexes =
    {
        Year: "year",
    Date: "date",
    Event: "event",
    };

VS.Gauge_Types =
    {
    RadialDetail: "RadialGauge",
    RadialDetailTop: "RadialGaugeTop",
	RadialSimpleTop: "RadialSimpleTop",
	RadialSimpleLeft: "RadialSimpleLeft",
	RadialSimpleBottom: "RadialSimpleBottom",
	RadialSimpleRight: "RadialSimpleRight",
    RadialSimpleFull: "RadialSimpleFull",
    RadialRangeTop: "RadialRangeTop",
    RadialRangeLeft: "RadialRangeLeft",
    RadialRangeBottom: "RadialRangeBottom",
    RadialRangeRight: "RadialRangeRight",
    RadialRangeFull: "RadialRangeFull",
    LinearDetailHorizontal: "LinearGauge",
    LinearDetailRampHorizontal: "LinearDetailRampHorizontal",
    LinearSimpleHorizontal: "LinearSimpleHorizontal",
    LinearSimpleRampHorizontal: "LinearSimpleRampHorizontal",
    LinearRangeHorizontal: "LinearRangeHorizontal",
    LinearRangeRampHorizontal: "LinearRangeRampHorizontal",
    LinearDetailVertical: "LinearGaugeVertical",
    LinearDetailRampVertical: "LinearDetailRampVertical",
    LinearSimpleVertical: "LinearSimpleVertical",
    LinearSimpleRampVertical: "LinearSimpleRampVertical",
    LinearRangeVertical: "LinearRangeVertical",
    LinearRangeRampVertical: "LinearRangeRampVertical",
    };

VS.RadialGauge_Properties =
    {
    Min: "min",
    Max:"max",
    Val: "val",
    MinAngle: "minAngle",
    MaxAngle: "maxAngle",
	MinTickMax: "minTickMax",
	MajTickMax: "majTickMax",
	MinTickLen: "minTickLen",
	MajTickLen: "majTickLen",
	MinTickColor: "minTickColor",
	MajTickColor: "majTickColor",
	UnitLabel: "unitLabel",
	NoUnits: "noUnits",
	CenterColor: "centerColor",
	CenterRadius: "centerRadius",
	IndicatorColor: "indicatorColor",
	PartialArcType: "partialArcType",
	HollowCenter: "hollowCenter",
	RangeIndicators: "rangeIndicators",
	FilledRange: "filledRange",
	TickLabelFreq: "tickLabelFreq",
	LabelFontSize: "labelFontSize",
	UnitFontSize: "unitFontSize",
	Radius: "radius",
	};

VS.LinearGauge_Properties =
	{
		Min: "min",
		Max: "max",
		Val: "val",
		BarWidth: "barWidth",
		Orientation: "orientation",
		MinTickMax: "minTickMax",
		MajTickMax: "majTickMax",
		MinTickLen: "minTickLen",
		MajTickLen: "majTickLen",
		MinTickColor: "minTickColor",
		MajTickColor: "majTickColor",
		IndicatorColor: "indicatorColor",
		IndicatorType: "indicatorType",
		RangeIndicators: "rangeIndicators",
		IndicatorType: "indicatorType",
		RangeWidthScale: "rangeWidthScale",
		TickLabelFreq: "tickLabelFreq",
		TickLocation: "tickLocation",
		LabelLocation: "labelLocation",
		LabelFontSize: "labelFontSize",
		UnitFontSize: "unitFontSize",
		UnitLabel: "unitLabel",
		UnitPosition: "unitPosition",
		NoUnits: "noUnits",
	};

VS.Graph_Types =
	{
		LineChart: "LineChart",
		AreaChart: "AreaChart",
		PieChart: "PieChart",
		DonutChart: "Donut",
		BarChart: "BarChart",
		BarChartStacked: "BarChartStacked",
		BarChartHorizontal: "BarChartHorizontal",
        BarChartStackedHorizontal: "BarChartStackedHorizontal",
        SankeyChart: "SankeyChart",
        SankeyChartColored: "SankeyChartColored",
        SankeyChartLeft: "SankeyChartLeft",
        SankeyChartRight: "SankeyChartRight",
	};

VS.LineChart_Properties =
	{
	GraphAreaWidth:"graphAreaWidth",	//width of the core graph area(minus axis, legend and title)
	GraphAreaHeight:"graphAreaHeight",	//height of the core graph area(minus axis, legend and title)
    LegendPos: "legendPos",			//data set legend positioning	
    LegendShape: "legendShape",		//legend color shape (round or square)	
	UnitLabel:"unitLabel",			//y axis units label that is displayed at the top of the y axis
	TickLen:"tickLen",				//axis tick lengths
	TickWidth:"tickWidth",			//line thickness of the ticks
	GraphLineWidth:"graphLineWidth", //line thickness of the graph data lines
	YTickCount:"yTickCount",		//# of ticks on the y axis
	YMinZero:"yMinZero",			//if true, sets the min value of the yAxis to 0, otherwise, min value is computed from the data
	YRuleLines:"yRuleLines",		//if true, displays ruling lines behind the graph, aligned with the y axis ticks
	YAxisHide:"yAxisHide",			//if true, hides the main(vertical) part of the y axis(ticks and tick labels will still be shown unless yTickCount = 0)
    XAxisStep: "xAxisStep",			//the step count for the x axis labels(and ticks).Defaults to 1, meaning no labels are skipped.Note: the step will be increased if there is not enough room for the x axis labels.
    XLabelBehavior: "xLabelBehavior",   //x-axis label behavior: 'wrap', 'vertical', 'none'
    XLabelMaxLen: "xLabelMaxLen",   //max # chars for x-axis label.  If exceeds max length, text will be truncated and ellipsed
	YFormatter:"yFormatter",		//D3-based format string for the yAxis labels(see https://github.com/d3/d3-format for full documentation.  Default is "s")
	DataSetColors:"dataSetColors",	//comma - separated list of colors that define the data set colors
	LabelFontSize:"labelFontSize",	//font size of the axis, unit and legend text
	Title: "title",					//title text
	TitlePos:"titlePos",			//title position
	TitleColor:"titleColor",		//title text color(defaults to textColor)
    TitleFontSize: "titleFontSize",	//title font size
    DisplayType: "displayType",	//"line" or "area"
	};

VS.PieChart_Properties =
	{
		ChartRadius: "chartRadius",			//radius of the core pie graph area (minus labels, legend and title)
		InnerRadius: "innerRadius",			//inner radius of the pie chart (a non-zero value creates a donut-type pie chart)
		LegendPos: "legendPos",				//data set legend positioning	
		DisplayDivider: "displayDivider",	//If true, display a divider between pie wedges.
		DataSetColors: "dataSetColors",		//comma-separated list of colors that define the data set colors
		LabelFontSize: "labelFontSize",		//font size of the axis, unit and legend text
		LabelColor:"labelColor",			//color of data labels when displayed outside of chart area as callouts(defaults to textColor)
		AltLabelColor: "altLabelColor",		//color of data labels when displayed inside of chart area(defaults to labelColor)		
		DataSetColors: "dataSetColors",		//comma - separated list of colors that define the data set colors
		LabelPos: "labelPos",				//location of data labels
		LabelFormat: "labelFormat",			//defines how the data labels are displayed
		ShowDataLabels: "showDataLabels",	//Boolean.If true, prepend data title to the data.
		LabelLineLength:"labelLineLength",	//length of data callout lines when displayed as outside.
		Title: "title",					//title text
		TitlePos: "titlePos",			//title position
		TitleColor: "titleColor",		//title text color(defaults to textColor)
		TitleFontSize: "titleFontSize",	//title font size
	};


VS.BarChart_Properties =
{
    GraphAreaWidth: "graphAreaWidth",	//width of the core graph area(minus axis, legend and title)
    GraphAreaHeight: "graphAreaHeight",	//height of the core graph area(minus axis, legend and title)
    LegendPos: "legendPos",			//data set legend positioning	
    LegendShape: "legendShape",		//legend color shape (round or square)	
    UnitLabel: "unitLabel",			//y axis units label that is displayed at the top of the y axis
    TickLen: "tickLen",				//axis tick lengths
    TickWidth: "tickWidth",			//line thickness of the ticks
    YTickCount: "yTickCount",		//# of ticks on the y axis
    YMinZero: "yMinZero",			//if true, sets the min value of the yAxis to 0, otherwise, min value is computed from the data
    YRuleLines: "yRuleLines",		//if true, displays ruling lines behind the graph, aligned with the y axis ticks
    YAxisHide: "yAxisHide",			//if true, hides the main(vertical) part of the y axis(ticks and tick labels will still be shown unless yTickCount = 0)
    XAxisStep: "xAxisStep",			//the step count for the x axis labels(and ticks).Defaults to 1, meaning no labels are skipped.Note: the step will be increased if there is not enough room for the x axis labels.
    XLabelBehavior: "xLabelBehavior",   //x-axis label behavior: 'wrap', 'vertical', 'none'
    XLabelMaxLen: "xLabelMaxLen",   //max # chars for x-axis label.  If exceeds max length, text will be truncated and ellipsed
    YFormatter: "yFormatter",		//D3-based format string for the yAxis labels(see https://github.com/d3/d3-format for full documentation.  Default is "s")
    DataSetColors: "dataSetColors",	//comma - separated list of colors that define the data set colors
    LabelFontSize: "labelFontSize",	//font size of the axis, unit and legend text
    Title: "title",					//title text
    TitlePos: "titlePos",			//title position
    TitleColor: "titleColor",		//title text color(defaults to textColor)
    TitleFontSize: "titleFontSize",	//title font size
    BarGroupType: "barGroupType",	//"group" or "stack"
    BarOrient: "barOrient",		//"vert" or "horiz"
};

VS.SankeyChart_Properties =
{
    GraphAreaWidth: "graphAreaWidth",	//width of the core graph area(minus title)
    GraphAreaHeight: "graphAreaHeight",	//height of the core graph area(minus title)
    NodeAlign: "nodeAlign",			    //chart layout alignment ('left', 'right', 'center', 'justify')
    NodeWidth: "nodeWidth",		        //width of node boxes
    NodePadding: "nodePadding",			//space between nodes
    LabelPadding: "labelPadding",	    //offset of label from node
    LabelFontSize: "labelFontSize",	    //font size of node label
    DefLinkColor: "defLinkColor",		//default link color
    LinkOpacity: "linkOpacity",			//link transparency
    UnitLabel: "unitLabel",		        //unit string to append to values in tooltips
    BlendNodeColorsForLinks: "blendNodeColorsForLinks",			//if true, creates a gradient between the 2 linked nodes, using the node colors, otherwise uses the DefLinkColor
    DataSetColors: "dataSetColors",	    //comma - separated list of colors that define the data set colors
    Title: "title",					    //title text
    TitlePos: "titlePos",			    //title position
    TitleColor: "titleColor",		    //title text color(defaults to textColor)
    TitleFontSize: "titleFontSize", 	//title font size
};

////////////////// Base Object /////////////////////////
VS.BaseObject = function ()
{
    this.Properties = {};
    return (this);
};

/**
 * @method BaseObject.SetLabel
 * @param {string} Label  - the text label
 */
VS.BaseObject.prototype.SetLabel = function (Label)
{
    this.Properties.Label = Label;
    return (this);
};

/**
 * @method BaseObject.SetTextTruncate
 * @param {int} nchar  - number of characters to show
 */
VS.BaseObject.prototype.SetTextTruncate = function (nchar)
{
    this.Properties.Truncate = nchar;
    return (this);
};

/**
 * @method BaseObject.SetTextSize
 * @param {string} size  - the text size
 */
VS.BaseObject.prototype.SetTextSize = function (size)
{
    this.Properties.TextSize = size;
    return (this);
};

/**
 * @method BaseObject.SetTextFont
 * @param {string} font  - the text font
 */
VS.BaseObject.prototype.SetTextFont = function (font)
{
    this.Properties.TextFont = font;
    return (this);
};

/**
 * @method BaseObject.SetTextBold
 * @param {bool} state  - true or false
 */
VS.BaseObject.prototype.SetTextBold = function (state)
{
    this.Properties.TextBold = state;
    return (this);
};

/**
 * @method BaseObject.SetTextItalic
 * @param {bool} state  - true or false
 */
VS.BaseObject.prototype.SetTextItalic = function (state)
{
    this.Properties.TextItalic = state;
    return (this);
};

/**
 * @method BaseObject.SetTextUnderline
 * @param {bool} state  - true or false
 */
VS.BaseObject.prototype.SetTextUnderline = function (state)
{
    this.Properties.TextUnderline = state;
    return (this);
};

/**
 * @method BaseObject.SetTextHyperlink
 * @param {str} url  - the url
 */
VS.BaseObject.prototype.SetTextHyperlink = function (url)
{
    this.Properties.TextHyperlink = { url: url };
    return (this);
};

/**
 * @method BaseObject.SetHyperlink
 * @param {str} url  - the url
 */
VS.BaseObject.prototype.SetHyperlink = function (url)
{
    this.Properties.Hyperlink = { url: url };
    return (this);
};

/**
 * @method BaseObject.SetImage
 * @param {str} url  - the url
 */
VS.BaseObject.prototype.SetImage = function (url)
{
    this.Properties.Image = { url: url };
    return (this);
};

/**
 * @method BaseObject.SetTextColor
 * @param {str} color  - "#NNNNNN"
 */
VS.BaseObject.prototype.SetTextColor = function (color)
{
    this.Properties.TextColor = color;
    return (this);
};

/**
 * @method BaseObject.SetFillColor
 * @param {str} color  - "#NNNNNN"
 */
VS.BaseObject.prototype.SetFillColor = function (color)
{
    this.Properties.FillColor = color;
    return (this);
};

/**
 * @method BaseObject.SetLineColor
 * @param {str} color  - "#NNNNNN"
 */
VS.BaseObject.prototype.SetLineColor = function (color)
{
    this.Properties.LineColor = color;
    return (this);
};

/**
 * @method BaseObject.SetLineThickness
 * @param {int} thickness  - in 1/100
 */
VS.BaseObject.prototype.SetLineThickness = function (thickness)
{
    this.Properties.LineThick = thickness;
    return (this);
};

/**
 * @method BaseObject.SetBorderThickness
 * @param {int} thickness  - in 1/100
 */
VS.BaseObject.prototype.SetBorderThickness = function (thickness)
{
    this.Properties.BorderThick = thickness;
    return (this);
};

/**
 * @method BaseObject.SetLinePattern
 * @param {str) pattern 
 */
VS.BaseObject.prototype.SetLinePattern = function (pattern)
{
    this.Properties.LinePattern = pattern;
    return (this);
};

/**
 * @method BaseObject.SetStartArrow
 * @param {int) arrowid 
 */
VS.BaseObject.prototype.SetStartArrow = function (arrowid)
{
    this.Properties.StartArrow = arrowid;
    return (this);
};


/**
 * @method BaseObject.SetEndArrow
 * @param {int) arrowid 
 */
VS.BaseObject.prototype.SetEndArrow = function (arrowid)
{
    this.Properties.EndArrow = arrowid;
    return (this);
};

/**
 * @method BaseObject.SetObjectType
 * @param {int) objecttype 
 */
VS.BaseObject.prototype.SetObjectType = function (objecttype)
{
    this.Properties.objecttype = objecttype;
    return (this);
};

/**
 * @method BaseObject.SetNote-  add a note
 * @param {str} - note
 */
VS.BaseObject.prototype.SetNote = function (note)
{
    this.Properties.Note = note;
    return (this);
};

/**
 * @method BaseObject.SetNoteIcon-  set the icon for a note
 * @param {int} - iconid
 */
VS.BaseObject.prototype.SetNoteIcon = function (iconid)
{
    this.Properties.NoteIcon = iconid;
    return (this);
};

/**
 * @method BaseObject.SetTextAlignH- set the horizontal justification
 * @param {str} - just - left,right center
 */
VS.BaseObject.prototype.SetTextAlignH = function (just)
{
    this.Properties.TextAlignH = just;
    return (this);
};

/**
 * @method BaseObject.SetTextAlignV- set the vertical justification
 * @param {str} - vjust - top,bottom middle
 */
VS.BaseObject.prototype.SetTextAlignV = function (vjust)
{
    this.Properties.TextAlignV = vjust;
    return (this);
};


/**
 * @method BaseObject.ReturnProperties - return an object that is not a function for stringifying
 */
VS.BaseObject.prototype.ReturnProperties = function ()
{
    return (this.Properties);
}

/**
 * @method BaseObject.AddExpandedView - add an expanded view to a shape or cell
 */
VS.BaseObject.prototype.AddExpandedView = function ()
{
	var ExpandedView = new VS.Document();
	this.ExpandedView = ExpandedView;
	this.Properties.ExpandedView = ExpandedView.Properties;

	return (ExpandedView);
}

//////////////////////// Shape /////////////////////////////
/// SDON Shape Object derived from the base object
VS.Shape = function ()
{
    var retObj = VS.BaseObject.apply(this);
    return (retObj);
};

VS.Shape.prototype = new VS.BaseObject();
VS.Shape.prototype.constructor = VS.Shape;

/**
 * @method Shape.SetID- set the id
 * @param {int} - ID - id for the shape (for returns)
 */
VS.Shape.prototype.SetID = function (ID)
{
    this.Properties.ID = ID;
    return (this);
};

/**
 * @method Shape.SetShapeType- set the id
 * @param {str} - ShapeType - a standard shape type or a custom one
 * @param {bool} - Fixed - optional parameter for rrect - used a fixed radius
 * @param {int} - CornerSize - optional size of the fixed radius corner in pixels (5-20)
 */
VS.Shape.prototype.SetShapeType = function (ShapeType,Fixed,CornerSize)
{
	this.Properties.ShapeType = ShapeType;
	if (ShapeType === VS.ShapeTypes.RoundedRectangle)
	{
		if (Fixed === true)
		{
			if (CornerSize == null) CornerSize = 5;
			if (CornerSize < 5) CornerSize = 5;
			if (CornerSize > 20) CornerSize = 20;
			this.Properties.RRect_Fixed = Fixed;
			this.Properties.RRect_ShapeParam = CornerSize/100;
		}
	}
    return (this);
};



/**
 * @method Shape.SetLineLabel- set the id
 * @param {str} - Label - the label on a connector attached to a shape
 */
VS.Shape.prototype.SetLineLabel = function (Label)
{
    this.Properties.LineLabel = Label;
    return (this);
}; 

/**
 * @method Shape.SetTextMargin- set the text margin on a shape
 * @param {int} - value - margin in 1/100
 */
VS.Shape.prototype.SetTextMargin = function (value)
{
    this.Properties.TextMargin = value;
    return (this);
};

/**
 * @method Shape.SetTextGrow- set the text margin on a shape
 * @param {int} - value - margin in 1/100
 */
VS.Shape.prototype.SetTextGrow = function (value)
{
    this.Properties.TextGrow = value;
    return (this);
};

/**
 * @method Shape.SetTextPosition- set the text position to be above, below or inside the shape
 * @param {int} - value - the position
 */
VS.Shape.prototype.SetTextPosition = function (value)
{
	switch (value)
	{
		case VS.LabelPosition.Above:
            //this.Properties.TextFlags = SDJS.ListManager.TextFlags.SED_TF_AttachA;     // RLM - temp replacement.  SDJS.ListManager not defined
            this.Properties.TextFlags = 8;
			break;
		case VS.LabelPosition.Below:
            //this.Properties.TextFlags = SDJS.ListManager.TextFlags.SED_TF_AttachA;     // RLM - temp replacement.  SDJS.ListManager not defined
            this.Properties.TextFlags = 4;
			break;
		default:
			this.Properties.TextFlags = 0;
			break;
	}
	return (this);
};


/**
 * @method Shape.SetMinWidth- set the min width for a shape
 * @param {int} - width 
 */
VS.Shape.prototype.SetMinWidth = function (width)
{
    this.Properties.MinWidth = width;
    return (this);
};

/**
 * @method Shape.SetMinHeight- set the min height for a shape
 * @param {int} - height 
 */
VS.Shape.prototype.SetMinHeight = function (height)
{
    this.Properties.MinHeight = height;
    return (this);
};

/**
 * @method Shape.Hide- set the hide boolean true (for shapecontainers)
 */
VS.Shape.prototype.Hide = function ()
{
    this.Properties.Hide = true;
    return (this);
};

/**
 * @method Shape.SetAttachPoint- set attach point for an icon shape
 * @param {int} - x (0- 30000)
 * @param {int} - y (0- 30000)
 */
VS.Shape.prototype.SetAttachPoint = function (x,y)
{
	if (this.Properties.AttachPoint == null)
	{
		this.Properties.AttachPoint = {};
	}
	this.Properties.AttachPoint.x = x;
	this.Properties.AttachPoint.y = y;
	return (this);
};

/**
 * @method Shape.SetConnectPoint- set connect point for an icon shape
 * @param {int} - x (0- 30000)
 * @param {int} - y (0- 30000)
 */
VS.Shape.prototype.SetConnectPoint = function (x, y)
{
	if (this.Properties.Connect == null)
	{
		this.Properties.Connect = {};
	}
	this.Properties.Connect.x = x;
	this.Properties.Connect.y = y;
	return (this);
};

/**
 * @method Shape.SetShapeDataRow- set data for a shape from a document level defined table
 * @param {int} - TableID - id of the data table
 * @param {int} - RowID - id of the row in the data table
 */
VS.Shape.prototype.SetShapeDataRow = function (TableID,RowID)
{
    this.Properties.Data = { TableID: TableID, RowID: RowID };
    return (this);
};

/**
 * @method Shape.AddShapeDataRow- add a data row and assign it to the shape
 * @param {VS.Document} - Document - the VS.Document
 * @param {int} - TableID - id of the data table
 */
VS.Shape.prototype.AddShapeDataRow = function (Document,TableID)
{
    //get the data table
    var theDataTable = Document.GetDataTable(TableID);
    var theDataRow = theDataTable.AddDataRow();
    this.Properties.Data = { TableID: TableID, RowID: theDataRow.Properties.RowID };
    return (theDataRow);
};


/**
 * @method Shape.AddShapeConnector - add a shape connector and return it
 * @param {str} - ShapeConnectorType - the type of shape connector
 */
VS.Shape.prototype.AddShapeConnector = function (ShapeConnectorType)
{
    var S = VS.ShapeConnectorTypes;
    //only allow a limited number of shape connectors
    switch (this.ShapeConnectorType)
    {
        case S.OrgChart:
        case S.Hierarchy:
        case S.DecisionTree:
            //we already have one
            return (this.ShapeConnector[0]);
            break;
        case S.Mindmap:
            if (this.ShapeConnector && this.ShapeConnector.length >= 2)
            {
                return (this.ShapeConnector[0]);
            }
            break;
    }
    switch (ShapeConnectorType)
    {
        case S.OrgChart:
        case S.Hierarchy:
        case S.DecisionTree:
        case S.Mindmap:
        case S.Flowchart:
            break;
        default:
            ShapeConnectorType = S.Hierarchy;
            break;
    }
    var ShapeConnector = new VS.ShapeConnector(ShapeConnectorType);
    this.Properties.ShapeConnectorType = ShapeConnectorType;
    if (this.Properties.ShapeList === undefined)
    {
        this.Properties.ShapeList = [];
        this.ShapeConnector = [];
    }
    this.Properties.ShapeList.push(ShapeConnector.Properties);
    this.ShapeConnector.push(ShapeConnector);

    return (ShapeConnector);
};

/**
 * @method Shape.AddShapeContainer - add a shape container and return it
 * @param {str} - ContainerArrangement - row, col or matrix
 */
VS.Shape.prototype.AddShapeContainer = function (ContainerArrangement)
{
    if (this.ShapeContainer !== undefined) return (this.ShapeContainer);

    var ShapeContainer = new VS.ShapeContainer(ContainerArrangement);
    this.Properties.ShapeArray = ShapeContainer.Properties;
    this.ShapeContainer = ShapeContainer;

    return (ShapeContainer);
};

/**
 * @method Shape.AddIconShape - add an iconshape and return it
 */
VS.Shape.prototype.AddIconShape = function ()
{
	var IconSize = 50;
	if (this.Properties.IconShapes === undefined)
	{
		this.Properties.IconShapes = [];
		this.IconShapes = [];
	}

	var IconShape = new VS.Shape();
    var SED_CDim = 30000;
    //var SED_CDim = SDJS.ListManager.Defines.SED_CDim; // RLM - temp replacement.  SDJS.ListManager not defined

	IconShape.Properties.AttachPoint = { x: SED_CDim / 2, y: SED_CDim / 2 };
	IconShape.Properties.Connect = { x: 1000, y: 0 };
	IconShape.Properties.MinWidth = IconSize;
	IconShape.Properties.MinHeight = IconSize;
    this.Properties.IconShapes.push(IconShape.Properties);


	IconShape.AttachPoint = { x: SED_CDim / 2, y: SED_CDim / 2 };
	IconShape.Connect = { x: 1000, y: 0 };
	IconShape.MinWidth = IconSize;
	IconShape.MinHeight = IconSize;
	this.IconShapes.push(IconShape);

	return (IconShape);
};


/**
 * @method Shape.AddTable - add a table to a shape and return it
 * @param {int} NRows- Number of rows
 * @param {int} NColumns- Number of cols
 */
VS.Shape.prototype.AddTable = function (NRows, NColumns)
{
    if (this.Gantt != null) return (null);
    if (this.Timeline != null) return (null);
    if (this.Table !== undefined) return (this.Table);

    var Table = new VS.Table(NRows, NColumns);
    this.Properties.Table = Table.Properties;
    this.Table = Table;

    return (Table);
};


/**
 * @method Shape.AddTimeline - add a timeline to a shape and return it
 */
VS.Shape.prototype.AddTimeline = function (Arrangement)
{
    var Timeline = new VS.Timeline(Arrangement);
    this.Timeline = Timeline;
    this.Properties.Timeline = Timeline.Properties;

    return (Timeline);
};

/**
 * @method Shape.AddGantt - add a Gantt to a shape and return it
 */
VS.Shape.prototype.AddGantt = function (projectname)
{
    var Gantt = new VS.Gantt(projectname);
    this.Gantt = Gantt;
    this.Properties.Gantt = Gantt.Properties;

    return (Gantt);
};

/**
 * @method Shape.AddGauge - add a gauge to a shape and return it
 * @param {string} GaugeType- the type of Gauge - defaults to RadialDetail
*/
VS.Shape.prototype.AddGauge = function (GaugeType)
{
    var Gauge = new VS.Gauge(GaugeType);
    this.Gauge = Gauge;
    this.Properties.Gauge = Gauge.Properties;

    return (Gauge);
}

/**
 * @method Shape.AddGraph - add a graph to a shape and return it
 * @param {string} GraphType- the type of Gauge - defaults to LineChart
*/
VS.Shape.prototype.AddGraph = function (GraphType)
{
	var Graph = new VS.Graph(GraphType);
	this.Graph = Graph;
	this.Properties.Graph = Graph.Properties;

	return (Graph);
}

//////////////////////// Shape Connector /////////////////////////////
/// SDON ShapeConnector Object derived from the base object
VS.ShapeConnector = function (ShapeConnectorType)
{
    var retObj = VS.BaseObject.apply(this);
    this.Properties.ShapeConnectorType = ShapeConnectorType;
    return (retObj);
};

VS.ShapeConnector.prototype = new VS.BaseObject();
VS.ShapeConnector.prototype.constructor = VS.ShapeConnector;

/**
 * @method ShapeConnector.AddShape - add a shape to a connector and return it
 */
VS.ShapeConnector.prototype.AddShape = function ()
{
    var Shape = new VS.Shape();
    if (this.Shapes === undefined)
    {
        this.Shapes = [];
        this.Properties.Shapes = [];
    }
    this.Shapes.push(Shape);
    this.Properties.Shapes.push(Shape.Properties);
    return (Shape);
};


/**
 * @method ShapeConnector.AddDefaultShape - add a default shape to a connector and return it - sets defaults for all shapes
 */
VS.ShapeConnector.prototype.AddDefaultShape = function ()
{
    if (this.DefaultShape) return (this.DefaultShape);

    var DefaultShape = new VS.Shape();
    this.DefaultShape = DefaultShape;
    this.Properties.DefaultShape = DefaultShape.Properties;
    return (DefaultShape);
};

/**
 * @method ShapeConnector.SetArrangement- set connector arrangement for hierarchy
 * @param {str} - arrangement 
 */
VS.ShapeConnector.prototype.SetArrangement = function (arrangement)
{
    this.Properties.Arrangement = arrangement;
    this.Arrangement = arrangement;
    return (this);
};

/**
 * @method ShapeConnector.SetDirection- set connector direction
 * @param {str} - direction 
 */
VS.ShapeConnector.prototype.SetDirection = function (direction)
{
    this.Properties.Direction = direction;
    return (this);
};

/**
 * @method ShapeConnector.Collapse- collapse the connector
 */
VS.ShapeConnector.prototype.Collapse = function ()
{
    this.Properties.Collapse = true;
    return (this);
};


//////////////////////// Shape Container /////////////////////////////
/// SDON Container Object derived from the base object
VS.ShapeContainer = function (ContainerArrangement)
{
    var retObj = VS.BaseObject.apply(this);
    this.Properties.Arrangement = ContainerArrangement;
    this.Arrangement = ContainerArrangement;

    return (retObj);
};

VS.ShapeContainer.prototype = new VS.BaseObject();
VS.ShapeContainer.prototype.constructor = VS.ShapeContainer;

/**
 * @method ShapeConnector.AddShape - add a shape to a connector and return it
 */
VS.ShapeContainer.prototype.AddShape = function ()
{
    var Shape = new VS.Shape();
    if (this.Shapes === undefined)
    {
        this.Shapes = [];
        this.Properties.Shapes = [];
    }
    this.Shapes.push(Shape);
    this.Properties.Shapes.push(Shape.Properties);
    return (Shape);
};

/**
 * @method ShapeContainer.AddDefaultShape - add a default shape to a container and return it - sets defaults for all shapes
 */
VS.ShapeContainer.prototype.AddDefaultShape = function ()
{
    if (this.DefaultShape) return (this.DefaultShape);

    var DefaultShape = new VS.Shape();
    this.DefaultShape = DefaultShape;
    this.Properties.DefaultShape = DefaultShape.Properties;
    return (DefaultShape);
};

/**
 * @method ShapeContainer.SetHorizontalSpacing- set the spacing between columns
 * @param {int} - spacing 
 */
VS.ShapeContainer.prototype.SetHorizontalSpacing = function (spacing)
{
    this.Properties.HorizontalSpacing = spacing;
    return (this);
};

/**
 * @method ShapeContainer.SetVerticalSpacing- set the spacing between rows
 * @param {int} - spacing 
 */
VS.ShapeContainer.prototype.SetVerticalSpacing = function (spacing)
{
    this.Properties.VerticalSpacing = spacing;
    return (this);
};

/**
 * @method ShapeContainer.SetAlignH- set the H alignment for shapes
 * @param {str} - just 
 */
VS.ShapeContainer.prototype.SetAlignH = function (just)
{
    this.Properties.ArrayAlignH = just;
    return (this);
};

/**
 * @method ShapeContainer.SetAlignV- set the H alignment for shapes
 * @param {str} - vjust 
 */
VS.ShapeContainer.prototype.SetAlignV = function (vjust)
{
    this.Properties.ArrayAlignV = vjust;
    return (this);
};

/**
 * @method ShapeContainer.SetWrap set the number of shapes at which to wrap
 * @param {int} - wrap 
 */
VS.ShapeContainer.prototype.SetWrap = function (wrap)
{
    this.Properties.Wrap = wrap;
    return (this);
};

/**
 * @method ShapeContainer.SetArrangement set the number of shapes at which to wrap
 * @param {int} - arrangement 
 */
VS.ShapeContainer.prototype.SetArrangement = function (arrangement)
{
    this.Properties.Arrangement = arrangement;
    return (this);
};

/**
 * @method ShapeContainer.SetEmptyWidth set the width of empty shapes in a sparse container
 * @param {int} - arrangement 
 */
VS.ShapeContainer.prototype.SetEmptyWidth = function (width)
{
    this.Properties.EmptyWidth = width;
    return (this);
};

/**
 * @method ShapeContainer.SetEmptyHeight set the height of empty shapes in a sparse container
 * @param {int} - arrangement 
 */
VS.ShapeContainer.prototype.SetEmptyHeight = function (height)
{
    this.Properties.EmptyHeight = height;
    return (this);
};

/**
 * @method ShapeContainer.ShowAdjustmwent show an adjustment handle in a kanban
 * @param {int} - show 
 */
VS.ShapeContainer.prototype.ShowAdjustmwent = function (show)
{
    this.Properties.ShowAdjustment = show;
    return (this);
};

/**
 * @method ShapeContainer.AllowShapes set whether container can accept containers
 * @param {int} - show 
 */
VS.ShapeContainer.prototype.AllowShapeTypes = function (allow)
{
    this.Properties.AllowShapeTypes = allow;
    return (this);
};




//////////////////////// Return /////////////////////////////
/// SDON Return Object derived from the base object
VS.Return = function (StartID,EndID)
{
    var retObj = VS.BaseObject.apply(this);
    this.Properties.StartID = StartID;
    this.Properties.EndID = EndID;
    return (retObj);
};

VS.Return.prototype = new VS.BaseObject();
VS.Return.prototype.constructor = VS.Return;

/**
 * @method Return.SetStartDirection-  set direction out of the first  shape for the return (default is down)
 * @param {int} - direction 
 */
VS.Return.prototype.SetStartDirection = function (direction)
{
    this.Properties.StartDirection = direction;
    return (this);
};

/**
 * @method Return.SetEndDirection-  set direction out of the last  shape for the return (default is down)
 * @param {int} - direction 
 */
VS.Return.prototype.SetEndDirection = function (direction)
{
    this.Properties.EndDirection = direction;
    return (this);
};

/**
 * @method Return.Curved-  make the return curved
 */
VS.Return.prototype.Curved = function ()
{
    this.Properties.Curved = true;
    return (this);
};

/**
 * @method Return.SetLineType-  set the type of return line
 */
VS.Return.prototype.SetLineType = function (linetype)
{
	this.Properties.LineType = linetype;
	return (this);
};

/**
 * @method Return.SetBehindID  set the shape that this line is behind
 */
VS.Return.prototype.SetBehindID = function (ShapeID)
{
	this.Properties.BehindID = ShapeID;
	return (this);
};

//////////////////////// Table /////////////////////////////
/// SDON Table
VS.Table = function (NRows,NColumns)
{
    this.Properties = {Rows:NRows,Columns:NColumns};
    return (this);
};

/**
 * @method Table.SetAlternateRows set rows to alternate colors
 * @param {str} - color1
 * @param {str} - color2
 */
VS.Table.prototype.SetAlternateRows = function (color1, color2)
{
    this.Properties.AlternateRows = { Color1: color1, Color2: color2 };

    return (this);
};

/**
 * @method Table.SetAlternateColumns set rows to alternate colors
 * @param {str} - color1
 * @param {str} - color2
 * @param {int} - startrow - optional starting row (1 by default)
 * @param {str} - endrow - optional ending row (last row by default)
 * @param {str} - StartCol - optional starting column (first by default)
 */
VS.Table.prototype.SetAlternateColumns = function (color1, color2, startrow, endrow, startcol)
{
    if (this.Properties.AlternateColumns == null)
    {
        this.Properties.AlternateColumns = [];
    }
    this.Properties.AlternateColumns.push({ Color1: color1, Color2: color2, StartRow: startrow, EndRow: endrow, StartCol:startcol });

    return (this);
};


/**
 * @method Table.SetColumnWidth-  set the desired default width for columns
 * @param {int} - width
 */
VS.Table.prototype.SetColumnWidth = function (width)
{
    this.Properties.ColumnWidth = width;

    return (this);
};

/**
 * @method Table.SetRowHeight-  set the desired default height for rows
 * @param {int} - height
 */
VS.Table.prototype.SetRowHeight = function (height)
{
    this.Properties.RowHeight = height;

    return (this);
};

/**
 * @method Table.SetShapeMarginH-  set the space between a shape in a cell and its left and right border.
 * @param {int} - margin
 */
VS.Table.prototype.SetShapeMarginH = function (margin)
{
	this.Properties.ShapeMarginH = margin;

	return (this);
};

/**
 * @method Table.SetShapeMarginV-  set the space between a shape in a cell and its top and bottom border.
 * @param {int} - margin
 */
VS.Table.prototype.SetShapeMarginV = function (margin)
{
	this.Properties.ShapeMarginV = margin;

	return (this);
};

/**
 * @method Table.SetHooksToRows-  set the hookflags of the shape to make the connection points the center of rows (used by ERD)
 * @param {int} - margin
 */
VS.Table.prototype.SetHooksToRows = function ()
{
    this.Properties.SetHooksToRows = true;

    return (this);
};

/**
 * @method Table.JoinAcross- joincells in a row
 * @param {int} - row
 * @param {int} - column
 * @param {int} - ntojoin
 */
VS.Table.prototype.JoinAcross = function (row, column,ntojoin)
{
    if (this.Properties.Join == undefined)
    {
        this.Properties.Join = [];
    }
    var join = { Row: row, Column: column, N: ntojoin, Down:false };
    this.Properties.Join.push(join);

    return (this);
};

/**
 * @method Table.JoinAcross- joincells in a row
 * @param {int} - row
 * @param {int} - column
 * @param {int} - ntojoin
 */
VS.Table.prototype.JoinDown = function (row, column, ntojoin)
{
    if (this.Properties.Join == undefined)
    {
        this.Properties.Join = [];
    }
    var join = { Row: row, Column: column, N: ntojoin,Down:true };
    this.Properties.Join.push(join);

    return (this);
};


/**
 * @method Table.AddCell - add a cell
 * @param {int} - Row
 * @param {int} - Column
 */
VS.Table.prototype.AddCell = function (Row, Column)
{
    var len, i, cell;
    if (this.Cell !== undefined)
    {
        //check for existing cell
        len = this.Cell.length;
        for (i = 0; i < len; i++)
        {
            cell = this.Cell[i];
            if ((cell.Row === Row) && (cell.Column === Column))
            {
                return (cell);
            }
        }
    }
    else
    {
        this.Cell = [];
        this.Properties.Cell = [];
    }
    cell = new VS.Cell(Row, Column);
    this.Cell.push(cell);
    this.Properties.Cell.push(cell.Properties);
    return (cell);
};


/**
 * @method Table.GetCell - get a cell
 * @param {int} - Row
 * @param {int} - Column
 */
VS.Table.prototype.GetCell = function (Row, Column)
{
    var len, i, cell;
    if (this.Cell !== undefined)
    {
        //check for existing cell
        len = this.Cell.length;
        for (i = 0; i < len; i++)
        {
            cell = this.Cell[i];
            if ((cell.Row == Row) && (cell.Column == Column))
            {
                return (cell);
            }
        }
    }
    return (null);
};

/**
 * @method Table.AddRowProperties - add a row properties record
 * @param {int} - index - index of the row (1..N)
 */
VS.Table.prototype.AddRowProperties = function (Index)
{
    var len, i, row;
    if (this.RowProperties !== undefined)
    {
        //check for existing row
        len = this.RowProperties.length;
        for (i = 0; i < len; i++)
        {
            row = this.RowProperties[i];
            if (row.Index === Index)
            {
                return (row);
            }
        }
    }
    else
    {
        this.RowProperties = [];
        this.Properties.RowProperties = [];
    }
    row = new VS.RowProperties(Index);
    this.RowProperties.push(row);
    this.Properties.RowProperties.push(row.Properties);
    return (row);
};

/**
 * @method Table.AddColumnProperties - add a column properties record
 * @param {int} - index - index of the row (1..N)
 */
VS.Table.prototype.AddColumnProperties = function (Index)
{
    var len, i, col;
    if (this.ColumnProperties !== undefined)
    {
        //check for existing row
        len = this.ColumnProperties.length;
        for (i = 0; i < len; i++)
        {
            col = this.ColumnProperties[i];
            if (col.Index === Index)
            {
                return (col);
            }
        }
    }
    else
    {
        this.ColumnProperties = [];
        this.Properties.ColumnProperties = [];
    }
    col = new VS.ColumnProperties(Index);
    this.ColumnProperties.push(col);
    this.Properties.ColumnProperties.push(col.Properties);
    return (col);
};



/// SDON Table Cells
VS.Cell = function (Row, Column)
{
    var retObj = VS.BaseObject.apply(this);
    retObj.Properties.Row = Row;
    retObj.Row = Row;
    retObj.Properties.Column = Column;
    retObj.Column = Column;
    
    return (retObj);
};

VS.Cell.prototype = new VS.BaseObject();
VS.Cell.prototype.constructor = VS.Cell;

/**
 * @method Cell.AddShape - add a shape to a cell
 */
VS.Cell.prototype.AddShape = function ()
{
    if (this.Shape !== undefined)
    {
        return (this.Shape);
    }
    var shape = new VS.Shape();
    this.Properties.Shape = shape.Properties;
    this.Shape = shape;

    return (shape);
};

/**
 * @method Cell.SetCellDisplayRectAsText - set the display rect for this cell as the text rectangle and respect text margins
 * @param {bool} - state - true or false
 */
VS.Cell.prototype.SetCellDisplayRectAsText = function (state)
{
	this.Properties.UseTextRectAsFrame = state;

	return (this);
};


/**
 * @method Cell.SetImage
 * @param {str} url  - the url
 * @param {int} flags  - cell flags (optional)
 */
VS.Cell.prototype.SetImage = function(url, flags) 
{
    this.Properties.Image = { url: url };

    if (flags)
    {
        this.Properties.CellFlags = this.Properties.CellFlags == "undefined" ? flags : (this.Properties.CellFlags | flags);
    }
    
    return (this);
}



/// SDON Table Rows Properties
VS.RowProperties = function (Index)
{
    var retObj = VS.BaseObject.apply(this);
    retObj.Properties.Index = Index;
    retObj.Index = Index;

    return (retObj);
};

VS.RowProperties.prototype = new VS.BaseObject();
VS.RowProperties.prototype.constructor = VS.RowProperties;

/**
 * @method RowProperties.SetHeight - set row height in 1/100
 * @param {int} - height
 */
VS.RowProperties.prototype.SetHeight = function (height)
{
    this.Properties.Height = height;

    return (this);
};

/**
 * @method RowProperties.FixedHeight - make the height fixed
 */
VS.RowProperties.prototype.FixedHeight = function ()
{
    this.Properties.FixedHeight = true;

    return (this);
};


/// SDON Table Column Properties
VS.ColumnProperties = function (Index)
{
    var retObj = VS.BaseObject.apply(this);
    retObj.Properties.Index = Index;
    retObj.Index = Index;

    return (retObj);
};

VS.ColumnProperties.prototype = new VS.BaseObject();
VS.ColumnProperties.prototype.constructor = VS.ColumnProperties;

/**
 * @method ColumnProperties.SetWidth
  * @param {int} - width
*/
VS.ColumnProperties.prototype.SetWidth = function (width)
{
    this.Properties.Width = width;

    return (this);
};

/**
 * @method ColumnProperties.FixedWidth - make the width fixed
 */
VS.ColumnProperties.prototype.FixedWidth = function ()
{
    this.Properties.FixedWidth = true;

    return (this);
};

//////////////////////// Data Table /////////////////////////////
/// SDON DataTable
VS.DataTable = function (ID,Name)
{
    this.Properties = { ID:ID,Name:Name };
    return (this);
};


/**
 * @method DataTable.SetColumns
 * @param {[]} columnarray  - array of {Name:"",Type:""}
 */
VS.DataTable.prototype.SetColumns = function (columnarray)
{
    if (columnarray == null) return;
    if ((columnarray.length === undefined) || (columnarray.length === 0)) return;
    if (this.Properties.Columns === undefined)
    {
        this.Properties.Columns = [];
    }
    this.Properties.Columns=this.Properties.Columns.concat(columnarray);
    return (this);
};

/**
 * @method DataTable.SetLock
 * @param {bool} locked  - set lock status of data table
 */
VS.DataTable.prototype.SetLock = function (locked)
{
    this.Properties.Locked = locked;
    return (this);
};

/**
 * @method DataTable.AddDataRow - add a row
 * @param {int} ID  - the row id - will be defaulted to index
 */
VS.DataTable.prototype.AddDataRow = function (ID)
{
    var len, i;
    if (this.Rows)
    {
        len = this.Rows.length;
        if (isNaN(ID))
        {
            ID = len + 1;
        }
  
        for (i = 0; i < len; i++)
        {
            if (this.Rows[i].ID === ID) return (this.Rows[i]);
        }
    }
    else
    {
        if (isNaN(ID)) ID = 1;
        this.Rows = [];
        this.Properties.Rows = [];
    }
    var theRow = new VS.DataRow(ID);
    theRow.ID = ID;
    this.Rows.push(theRow);
    this.Properties.Rows.push(theRow.Properties);
    return (theRow);
};

/**
 * @method DataTable.GetDataRow - get an existing row
 * @param {int} ID  - the row id 
 */
VS.DataTable.prototype.GetDataRow = function (ID)
{
    var len, i;
    if (this.Rows)
    {
        len = this.Rows.length;
        ID = parseInt(ID);

        for (i = 0; i < len; i++)
        {
            if (this.Rows[i].ID === ID) return (this.Rows[i]);
        }
    }
    return (null);
};

//////////////////////// Data Row /////////////////////////////
/// SDON DataRow
VS.DataRow = function (ID)
{
    ID = parseInt(ID);
    this.Properties = { RowID: ID,Fields:[] };
    return (this);
};

/**
 * @method DataRow.SetValues
 * @param {[]} valuearray  - array of {Name:"",Value:""} - where "Name" is a column names
 */
VS.DataRow.prototype.SetValues = function (valuearray)
{
    if (valuearray == null) return;
    if ((valuearray.length === undefined) || (valuearray.length === 0)) return;
    this.Properties.Fields=this.Properties.Fields.concat(valuearray);
    return (this);
};

///////////////// Document Object ///////////////////
VS.Document = function ()
{
    this.Properties = {};
	this.Properties.Version = VS.Version;
	this.Properties.MaximumShapes = VS.DefaultMaxShapes;
    this.Shape = new VS.Shape();
    this.Properties.Shape = this.Shape.Properties;
    return (this);
};

VS.Document.prototype.toJSON = function ()
{
    var JSONStr = JSON.stringify(this.Properties);
    return (JSONStr);
};

/**
 * @method Document.GetTheShape - return the main shape
 */
VS.Document.prototype.GetTheShape = function ()
{
    return (this.Shape);
};

/**
 * @method Document.SetTemplate
 * @param {str} TemplateName  - name of template
 */
VS.Document.prototype.SetTemplate = function (TemplateName)
{
    this.Properties.Template = TemplateName;
    return (this);
};

/**
 * @method Document.SetMaximumShapes
 * @param {int} N  - maximum number
 */
VS.Document.prototype.SetMaximumShapes = function (N)
{
	this.Properties.MaximumShapes = N;
	return (this);
};

/**
 * @method Document.SetColors
 * @param {[]} colorarray  - array of {Name:"myname","Value":"#FF00FF"}
 */
VS.Document.prototype.SetColors = function (colorarray)
{
    if (colorarray == null) return;
    if ((colorarray.length === undefined) || (colorarray.length === 0)) return;
    if (this.Properties.Colors === undefined)
    {
        this.Properties.Colors = [];
    }
    this.Properties.Colors = this.Properties.Colors.concat(colorarray);
    return (this);
};

/**
 * @method Document.SetSymbols
 * @param {[]} symbolarray  - array of {Name:"",ID:""}
 */
VS.Document.prototype.SetSymbols = function (symbolarray)
{
    if (symbolarray == null) return;
    if ((symbolarray.length === undefined) || (symbolarray.length === 0)) return;
    if (this.Properties.Symbols === undefined)
    {
        this.Properties.Symbols = [];
    }
    this.Properties.Symbols = this.Properties.Symbols.concat(symbolarray);
    return (this);
};

/**
 * @method Document.SetConnectorVerticalSpacing
 * @param {int} spacing  - spacing in inches
 */
VS.Document.prototype.SetConnectorVerticalSpacing = function (spacing)
{
    if (this.Properties.DocumentDefaults === undefined)
    {
        this.Properties.DocumentDefaults = {};
    }
    this.Properties.DocumentDefaults.VerticalSpacing = spacing / 100;
    return (this);
};

/**
 * @method Document.SetConnectorHorizontalSpacing
 * @param {int} spacing  - spacing in inches
 */
VS.Document.prototype.SetConnectorHorizontalSpacing = function (spacing)
{
    if (this.Properties.DocumentDefaults === undefined)
    {
        this.Properties.DocumentDefaults = {};
    }
    this.Properties.DocumentDefaults.HorizontalSpacing = spacing / 100;
    return (this);
};

/**
 * @method Document.AddDataTable
 * @param {int} ID  - id of the table for reference later by shapes
 * @param {str} Name  - name of the shape data table (will default to Table-N)
 * @param {str} CSVString  - string of CSV data to be parsed to build the table
 */
VS.Document.prototype.AddDataTable = function (ID, Name,CSVString)
{
    if (this.Properties.DataTable === undefined)
    {
        this.Properties.DataTable = [];
        this.DataTable = [];
    }
	var theDataTable = new VS.DataTable(ID, Name);
	if (CSVString != null)
	{
		theDataTable.Properties.CSVString = CSVString;
	}
    theDataTable.ID = theDataTable.Properties.ID;
    this.DataTable.push(theDataTable);
    this.Properties.DataTable.push(theDataTable.Properties);
    return (theDataTable);
};


/**
 * @method Document.GetDataTable
 * @param {int} TableID  - id of the table for reference later by shapes
 */
VS.Document.prototype.GetDataTable = function (TableID)
{
    if (this.DataTable === undefined)
    {
        return (null);
    }
    var i, len;
    len = this.DataTable.length;
    for (i = 0; i < len; i++)
    {
        if (this.DataTable[i].ID == TableID) return (this.DataTable[i]);
    }
    return (null);
};


/**
 * @method Document.AddReturn
 * @param {int} StartID  - id of the starting shape
 * @param {int} EndID  - id of the ending shape
 */
VS.Document.prototype.AddReturn = function (StartID, EndID)
{
    if (this.Properties.Returns === undefined)
    {
        this.Properties.Returns = [];
    }
    var theReturn = new VS.Return(StartID, EndID);
    this.Properties.Returns.push(theReturn.Properties);
    return (theReturn);
};

/**
 * @method Document.AddTitle
 * @param {str} Title  - title string
 */
VS.Document.prototype.AddTitle = function (Title)
{
    if (Title == null) return;
    if (Title.length === 0) return;

    if (this.Title === undefined)
    {
        this.Title = new VS.Shape();
        this.Properties.Title = this.Title.Properties;
    }
    this.Title.SetLabel(Title);
    return (this.Title);
};

//////////////////// Gantt SDON Document /////////////
VS.GanttDocument = function ()
{
    var retObj = VS.Document.apply(this);
    retObj.Properties.Template = VS.Templates.Gantt;
    var UseDataTable = new VS.DataTable();
    retObj.UseDataTable = UseDataTable;
    retObj.Properties.UseDataTable = UseDataTable.Properties;
    retObj.Properties.Shape = null;
    return (retObj);
};

VS.GanttDocument.prototype = new VS.Document();
VS.GanttDocument.prototype.constructor = VS.GanttDocument;


/**
 * @method GanttDocument.SetTemplate
 * @param {str} TemplateName  - name of template
 */
VS.GanttDocument.prototype.SetTemplate = function (TemplateName)
{
    //do not allow a change in the template
    return (this);
};

/**
 * @method GanttDocument.AddTask
 * @param {[]} columnvalues  - array of field values {Name:"",Value:""}
 */
VS.GanttDocument.prototype.AddTask = function (columnvalues)
{
    if (columnvalues == null) return;
    if (columnvalues.length === 0) return;
    var row = this.UseDataTable.AddDataRow();
    row.SetValues(columnvalues);
    return (row);
};

/**
 * @method GanttDocument.SetColumnSettings
 * @param {str} Name  - name of the column
 * @param {str} Title  - title of the column
 * @param {int} Width  - width in 1/100
 */
VS.GanttDocument.prototype.SetColumnSettings = function (Name, Title, Width)
{
    if (Name == null) return;
    if (Name.length == 0) return;

    if (this.Properties.GanttColumns === undefined)
    {
        this.Properties.GanttColumns = [];
    }
    var len = this.Properties.GanttColumns.length, i, GanttColumn;
    var name = Name.toLowerCase();
    for (i = 0; i < len; i++)
    {
        if (this.Properties.GanttColumns[i].Name === name)
        {
            GanttColumn = this.Properties.GanttColumns[i];
        }
    }
    if (GanttColumn === undefined)
    {
        GanttColumn = { Name: name, Settings: {} };
        this.Properties.GanttColumns.push(GanttColumn);
    }
    if (Title != null)
    {
        GanttColumn.Settings.Title = Title;
    }
    if (Width != null)
    {
        GanttColumn.Settings.Width = Width;
    }
    return (this);
};

/**
 * @method GanttDocument.SetOptions
 * @param {bool} AllWorkingDays  - make all days working days
 * @param {str} Holidays  - name of the holiday country
 */
VS.GanttDocument.prototype.SetOptions = function (AllWorkingDays, Holidays)
{
    if (this.Properties.GanttOptions == undefined)
    {
        this.Properties.GanttOptions = {};
    }
    if (AllWorkingDays != null)
    {
        this.Properties.GanttOptions.AllWorkingDays = AllWorkingDays;
    }
    if (Holidays != null)
    {
        this.Properties.GanttOptions.Holidays = Holidays;
    }
    return (this);
};



/////////////////////////////// Timeline /////////////////////////////////////
/// VisualScript Timeline Object derived from the table object


VS.Timeline = function (Arrangement)
{
    this.Properties = {};
    if (Arrangement != null)
    {
        this.Properties.Arrangement = Arrangement;
    }
    return (this);
};

VS.Timeline.prototype = new VS.Table();
VS.Timeline.prototype.constructor = VS.Timeline;

/**
 * @method Timeline.SetAuto set the auto scale
 * @param {bool} - autoscale - if true autoscale
 */
VS.Timeline.prototype.SetAuto = function (autoscale)
{
    this.Properties.Auto = autoscale;

    return (this);
};

/**
 * @method Timeline.SetGridLabelColumn set the auto scale
 * @param {bool} - show - if true show the column for a grid
 */
VS.Timeline.prototype.SetGridLabelColumn = function (show)
{
	if (show != null)
	{
		this.Properties.HideGridLabelColumn = show===false;
	}

	return (this);
};

/**
 * @method Timeline.SetStart set the start day of an non autoscale timeline
 * @param {string} - start "YYYY-MM-DD"
 */
VS.Timeline.prototype.SetStart = function (start)
{
    this.Properties.Start = start;

    return (this);
};

/**
 * @method Timeline.SetStartTime set the start time of an non autoscale timeline
 * @param {string} - starttime "HH:MM:SS"
 */
VS.Timeline.prototype.SetStartTime = function (starttime)
{
    this.Properties.StartTime = starttime;

    return (this);
};

/**
 * @method Timeline.SetDuration -  set the duration of a non-autoscale timeline
 * @param {int} - duration - in days. can include decimal parts of a day
 */
VS.Timeline.prototype.SetDuration = function (duration)
{
    this.Properties.Length = duration;

    return (this);
};

/**
 * @method Timeline.SetUnits set the units of an non autoscale timeline
 * @param {int} - units (VS.TimelineUnits)
 */
VS.Timeline.prototype.SetUnits = function (units)
{
    this.Properties.Units = units;

    return (this);
};

/**
 * @method Timeline.SetEventType set the default event type for the time line
 * @param {str} - eventtype (VS.Timeline_EventTypes)
 */
VS.Timeline.prototype.SetEventType = function (eventtype)
{
    this.Properties.EventType = eventtype;

    return (this);
};

/**
 * @method Timeline.SetEventPosition set the default event position for the time line - either VS.Timeline_BubbleEventPositions or the row number for grids
 * @param {str/int} - position (either VS.Timeline_BubbleEventPositions or the row number for grids)
 */
VS.Timeline.prototype.SetEventPosition = function (position)
{
    this.Properties.Position = position;

    return (this);
};

/**
 * @method Timeline.SetBubbleLineLength set the default length of a bubble event line for the timeline
 * @param {int} - length  in 1/100"
 */
VS.Timeline.prototype.SetBubbleLineLength = function (length)
{
    if (length < 1) length = 1;
    this.Properties.LineLength = length;

    return (this);
};


/**
 * @method Timeline.AddDefaultShape  - add a default shape to a timeline that describes the properties of the event shapes
 */
VS.Timeline.prototype.AddDefaultShape = function ()
{
    if (this.DefaultShape) return (this.DefaultShape);

    var DefaultShape = new VS.Shape();
    this.DefaultShape = DefaultShape;
    this.Properties.DefaultShape = DefaultShape.Properties;
    return (DefaultShape);
};

/**
 * @method Timeline.AddGridRows  -add a row with an optional label
 * @param {str} - Label - the label for the row
 * @param {int} - RowType - optional type - default is eventtype, or title 
*/
VS.Timeline.prototype.AddGridRow = function (Label,RowType)
{
    if (this.Rows == null)
    {
        this.Rows = [];
        this.Properties.Rows = [];
    }
    var Index = this.Rows.length + 1;
    var theRow = new VS.TimelineRow();
    this.Rows.push(theRow);
    this.Properties.Rows.push(theRow.Properties);
    if ((Label != null) && Label.length)
    {
        theRow.Properties.Label = Label;
	}
	if (RowType === VS.Timeline_RowTypes.LabelRow)
	{
		theRow.Properties.RowType = VS.Timeline_RowTypes.LabelRow;
	}

    return (theRow);
};

/**
 * @method Timeline.AddEvent  - add an event to the timeline
 * @param {string} - Start "YYYY-MM-DD"
 */
VS.Timeline.prototype.AddEvent = function (Start)
{

    var Event = new VS.Event();
    if (this.Events === undefined)
    {
        this.Events = [];
        this.Properties.Events = [];
    }
    this.Events.push(Event);
    this.Properties.Events.push(Event.Properties);
    Event.SetStart(Start);
    return (Event);
};

/// SDON Table Rows Properties
VS.TimelineRow = function ()
{
    this.Properties = {};
    return (this);
};

/**
 * @method TimelineRow.SetLabel  - add a label to a row
 * @param {string} - Label
 */
VS.TimelineRow.prototype.SetLabel = function (Label)
{
    this.Properties.Label = Label;
}



//////////////////////// VS Event Object derived from the shape object ////////////////////
VS.Event = function ()
{
    var retObj = VS.Shape.apply(this);
    return (retObj);
};

VS.Event.prototype = new VS.Shape();
VS.Event.prototype.constructor = VS.Event;

/**
 * @method Event.SetStart set the start day of an event
 * @param {string} - start "YYYY-MM-DD"
 */
VS.Event.prototype.SetStart = function (start)
{
    this.Properties.Start = start;

    return (this);
};

/**
 * @method Event.SetStartTime set the start time on the start day of an event
 * @param {string} - starttime "HH:MM:SS"
 */
VS.Event.prototype.SetStartTime = function (starttime)
{
    this.Properties.StartTime = starttime;

    return (this);
};

/**
 * @method Event.SetDuration -  set the duration of an event
 * @param {int} - duration - in days. can include decimal parts of a day
 */
VS.Event.prototype.SetDuration = function (duration)
{
    this.Properties.Duration = duration;

    return (this);
};

/**
 * @method Event.SetEventType set the event type an event
 * @param {str} - eventtype (VS.Timeline_EventTypes)
 */
VS.Event.prototype.SetEventType = function (eventtype)
{
    this.Properties.EventType = eventtype;

    return (this);
};


/**
 * @method Event.SetEventPosition set the  event position  either VS.Event_BubbleEventPositions or the row number for grids
 * @param {str/int} - position (either VS.Event_BubbleEventPositions or the row number for grids)
 */
VS.Event.prototype.SetEventPosition = function (position)
{
    this.Properties.Position = position;

    return (this);
};

/**
 * @method Event.SetBubbleLineLength set the  length of a bubble event line
 * @param {int} - length  in 1/100"
*/
VS.Event.prototype.SetBubbleLineLength = function (length)
{
    if (length < 1) length = 1;
    this.Properties.LineLength = length;

    return (this);
};


/////////////////////////////// Gantt /////////////////////////////////////
/// VisualScript Gantt Object derived from the table object


VS.Gantt = function (projectname)
{
    var retObj = VS.Table.apply(this);
    retObj.Properties.Projectname = projectname;
	return (this);
};

VS.Gantt.prototype = new VS.Table();
VS.Gantt.prototype.constructor = VS.Gantt;

/**
 * @method Gantt.AddTask  - add a task to the Gantt chart
 * @param {string} - Name
 */
VS.Gantt.prototype.AddTask = function (Name)
{

	var Task = new VS.GanttTask();
	if (this.UseDataTable === undefined)
	{
		this.UseDataTable = {Rows:[]};
		this.Properties.UseDataTable = {Rows:[]};
	}
	if ((Name != null) && (Name.length > 0))
	{
		var Field = { Name: VS.GanttChartColumnNames.Task, Value: Name };
		Task.Properties.Fields.push(Field);

	}
	this.UseDataTable.Rows.push(Task);
	this.Properties.UseDataTable.Rows.push(Task.Properties);
	return (Task);
};

/**
 * @method Gantt.GetColumn  - Get the column
 * @param {string} - ColumnName
 */
VS.Gantt.prototype.GetColumn = function (ColumnName)
{
	var prop, col, len, i, column;
	col = ColumnName.toLowerCase();
	for (prop in VS.GanttChartColumnNames)
	{
		if (prop.toLowerCase() === col)
		{
			//real name
			if (this.Properties.GanttColumns === undefined)
			{
				this.Properties.GanttColumns = [];
				column = {Name: prop, Settings: {} };
				this.Properties.GanttColumns.push(column);
			}
			else
			{
				len = this.Properties.GanttColumns.length;
				for (i = 0; i < len; i++)
				{
					if (this.Properties.GanttColumns[i].Name.toLowerCase() === col)
					{
						//found column
						column = this.Properties.GanttColumns[i];
						break;
					}
				}
				if (column == null)
				{
					column = {Name: prop, Settings: {} };
					this.Properties.GanttColumns.push(column);
				}
			}

			break;
		}
		
	}
	return (column);
};

/**
 * @method Gantt.SetColumnTitle  - set the title of a column
 * @param {string} - ColumnName
 * @param {string} - Title
 */
VS.Gantt.prototype.SetColumnTitle = function (ColumnName, Title)
{
	var column = this.GetColumn(ColumnName);
	if (column != null)
	{
		column.Settings.Title = Title;
		return (this);
	}
	return (null);
};

/**
 * @method Gantt.SetColumnWidth  - set the width of a column
 * @param {string} - ColumnName
 * @param {string} - Width
 */
VS.Gantt.prototype.SetColumnWidth = function (ColumnName, Width)
{
	if (isNaN(Width)) return (null);
	var column = this.GetColumn(ColumnName);
	if (column != null)
	{
		column.Settings.Width = Width;
		return (this);
	}
	return (null);
};

/**
 * @method Gantt.SetAllDaysAsWorkingDays  - set workdays to include weekends
 * @param {bool} - all - true for included weekends
 */
VS.Gantt.prototype.SetAllDaysAsWorkingDays = function (all)
{
	if (this.Properties.GanttOptions == null)
	{
		this.Properties.GanttOptions = {};
	}
	this.Properties.GanttOptions.AllWorkingDays = all;
	return (this);
};

/**
 * @method Gantt.SetHolidays  - set country to use for holidays
 * @param {string} - country - VS.GanttChartHolidays
 */
VS.Gantt.prototype.SetHolidays = function (country)
{
	if (this.Properties.GanttOptions == null)
	{
		this.Properties.GanttOptions = {};
	}
	this.Properties.GanttOptions.Holidays = country;
	return (this);
};

//////////////////////// GanttTask /////////////////////////////
///  
VS.GanttTask = function ()
{
    var retObj = VS.BaseObject.apply(this);
    this.Properties.Fields = []; 
	return (this);
};

VS.GanttTask.prototype = new VS.BaseObject();
VS.GanttTask.prototype.constructor = VS.GanttTask;


/**
 * @method GanttTask.GetField get the value of a field
 * @param {string} - Fieldname
 */
VS.GanttTask.prototype.GetField = function (Fieldname)
{
	var len = this.Properties.Fields.length, i;
	var fname = Fieldname.toLowerCase();
	for (i = 0; i < len; i++)
	{
		if (this.Properties.Fields[i].Name.toLowerCase() === fname)
		{
			return (i);
		}
	}
	return (-1);
};


/**
 * @method GanttTask.SetTaskName set the  Name of a task
 * @param {string} - name
 */
VS.GanttTask.prototype.SetTaskName = function (Value)
{
	var index = this.GetField(VS.GanttChartColumnNames.Task);
	if (index >= 0)
	{
		this.Properties.Fields[index] = Value;
	}
	else
	{
		var Field = { Name: VS.GanttChartColumnNames.Task, Value: Value };
		this.Properties.Fields.push(Field);

	}

	return (this);
};

/**
 * @method GanttTask.SetTaskNumber set the  Number of a task
 * @param {int} - value
 */
VS.GanttTask.prototype.SetTaskNumber = function (Value)
{
	var field = VS.GanttChartColumnNames.Row;
	var index = this.GetField(field);
	if (index >= 0)
	{
		this.Properties.Fields[index] = Value;
	}
	else
	{
		var Field = { Name: field, Value: Value };
		this.Properties.Fields.push(Field);

	}

	return (this);
};

/**
 * @method GanttTask.SetStart set the starting date of a task
 * @param {string} - value
 */
VS.GanttTask.prototype.SetStart = function (Value)
{
	var field = VS.GanttChartColumnNames.Start;
	var index = this.GetField(field);
	if (index >= 0)
	{
		this.Properties.Fields[index] = Value;
	}
	else
	{
		var Field = { Name: field, Value: Value };
		this.Properties.Fields.push(Field);

	}

	return (this);
};

/**
 * @method GanttTask.SetStartTime set the start time of a task
 * @param {string} - value
 */
VS.GanttTask.prototype.SetStartTime = function (Value)
{
	var field = VS.GanttChartColumnNames.StartTime;
	var index = this.GetField(field);
	if (index >= 0)
	{
		this.Properties.Fields[index] = Value;
	}
	else
	{
		var Field = { Name: field, Value: Value };
		this.Properties.Fields.push(Field);

	}

	return (this);
};


/**
 * @method GanttTask.SetDuration set the duration of a task
 * @param {string} - value
 */
VS.GanttTask.prototype.SetDuration = function (Value)
{
	var field = VS.GanttChartColumnNames.Length;
	var index = this.GetField(field);
	if (index >= 0)
	{
		this.Properties.Fields[index] = Value;
	}
	else
	{
		var Field = { Name: field, Value: Value };
		this.Properties.Fields.push(Field);

	}

	return (this);
};

/**
 * @method GanttTask.SetParent set the parent of a task
 * @param {int} - value
 */
VS.GanttTask.prototype.SetParent = function (Value)
{
	var field = VS.GanttChartColumnNames.Parent;
	var index = this.GetField(field);
	if (index >= 0)
	{
		this.Properties.Fields[index] = Value;
	}
	else
	{
		var Field = { Name: field, Value: Value };
		this.Properties.Fields.push(Field);

	}

	return (this);
};

/**
 * @method GanttTask.SetMaster set the master of a task
 * @param {int} - value
 */
VS.GanttTask.prototype.SetMaster = function (Value)
{
	var field = VS.GanttChartColumnNames.Master;
	var index = this.GetField(field);
	if (index >= 0)
	{
		this.Properties.Fields[index] = Value;
	}
	else
	{
		var Field = { Name: field, Value: Value };
		this.Properties.Fields.push(Field);

	}

	return (this);
};

/**
 * @method GanttTask.SetAssignedTo set the person for assigbned to the task
 * @param {string} - value
 */
VS.GanttTask.prototype.SetAssignedTo = function (Value)
{
	var field = VS.GanttChartColumnNames.Person;
	var index = this.GetField(field);
	if (index >= 0)
	{
		this.Properties.Fields[index] = Value;
	}
	else
	{
		var Field = { Name: field, Value: Value };
		this.Properties.Fields.push(Field);

	}

	return (this);
};

/**
 * @method GanttTask.SetPercentComplete set the % complete of a task
 * @param {int} - value
 */
VS.GanttTask.prototype.SetPercentComplete = function (Value)
{
	var field = VS.GanttChartColumnNames.PercentComplete;
	var index = this.GetField(field);
	if (index >= 0)
	{
		this.Properties.Fields[index] = Value;
	}
	else
	{
		var Field = { Name: field, Value: Value };
		this.Properties.Fields.push(Field);

	}

	return (this);
};


/**
 * @method GanttTask.SetCost set the cost for the task
 * @param {string} - value
 */
VS.GanttTask.prototype.SetCost = function (Value)
{
	var field = VS.GanttChartColumnNames.Cost;
	var index = this.GetField(field);
	if (index >= 0)
	{
		this.Properties.Fields[index] = Value;
	}
	else
	{
		var Field = { Name: field, Value: Value };
		this.Properties.Fields.push(Field);

	}

	return (this);
};

/**
 * @method GanttTask.SetDepartment set the department for the task
 * @param {string} - value
 */
VS.GanttTask.prototype.SetDepartment = function (Value)
{
	var field = VS.GanttChartColumnNames.Department;
	var index = this.GetField(field);
	if (index >= 0)
	{
		this.Properties.Fields[index] = Value;
	}
	else
	{
		var Field = { Name: field, Value: Value };
		this.Properties.Fields.push(Field);

	}

	return (this);
};

/**
 * @method GanttTask.SetCustom set the custom field for the task
 * @param {string} - value
 */
VS.GanttTask.prototype.SetCustom = function (Value)
{
	var field = VS.GanttChartColumnNames.Custom;
	var index = this.GetField(field);
	if (index >= 0)
	{
		this.Properties.Fields[index] = Value;
	}
	else
	{
		var Field = { Name: field, Value: Value };
		this.Properties.Fields.push(Field);

	}

	return (this);
};

//////////////////////// Gauges /////////////////////////////
/// 

VS.Gauge = function (GaugeType)
{
    this.Properties = {};
    this.Properties.GaugeType = GaugeType;
    this.Properties.Settings = [];
    return (this);
};

/**
 * @method Gauge.SetProperties - set the properties of the Gauge
 * @param {[]} - valuearray - array of {Name:"",Value:""}
 */
VS.Gauge.prototype.SetProperties = function (valuearray)
{
    if (valuearray == null) return;
    if ((valuearray.length === undefined) || (valuearray.length === 0)) return;
    this.Properties.Settings = this.Properties.Settings.concat(valuearray);
    return (this);
};

/**
 * @method Gauge.SetShowDataTable - set whether the gauge has a data table
 * @param {bool} - show
 */
VS.Gauge.prototype.SetShowDataTable = function (show)
{
    if (show)
    {
        this.Properties.ShowDataTable = true;
    }
    return (this);
};

//////////////////////// Graphs /////////////////////////////
/// 

VS.Graph = function (GraphType)
{
	this.Properties = {};
	if (GraphType == null) GraphType = VS.Graph_Types.LineChart;
	this.Properties.GraphType = GraphType;
	this.Properties.Settings = [];
	this.Properties.DataTableID = null;
	return (this);
};

/**
 * @method Graph.SetProperties - set the properties of the Graph
 * @param {[]} - valuearray - array of {Name:"",Value:""}
 */
VS.Graph.prototype.SetProperties = function (valuearray)
{
	if (valuearray == null) return;
	if ((valuearray.length === undefined) || (valuearray.length === 0)) return;
	this.Properties.Settings = this.Properties.Settings.concat(valuearray);
	return (this);
};

/**
 * @method Graph.SetDataTableID - set the data table ID for the graph
 * @param {int} - DataTableID //the ID of the data table in the table of data tables built by VSON
 */
VS.Graph.prototype.SetDataTable = function (DataTableID)
{
	this.Properties.DataTableID = DataTableID;
	return (this);
};

/**
 * @method Graph.SetDataTableRow - set the row to use for the data in a bar chart
 * @param {int} - RowID //the ID of the row in the table
 */
VS.Graph.prototype.SetDataTableRow = function (RowID)
{
	this.Properties.DataTableRowID = RowID;
	return (this);
};



/**
 * Interface class for the pattern of issuing a rest request for information, then passing the resultant information (possibly aggregated over several "paged" calls) to a user-specified handler
 * @param {any} attributes
 */
VS.RestSession = function(attributes) {
    attributes = attributes || {};

    this.url = attributes.url ? attributes.url : "";
    this.query = attributes.query ? attributes.query : "";
    this.handlerFunction = attributes.handlerFunction ? attributes.handlerFunction : undefined;
    this.requestParams = attributes.requestParams ? attributes.requestParams : "";

    return this;
};

/**
 * For calls that require authentication, allow the user to provide basic authentication information
 * @param {string} userid - userid
 * @param {string} password - password
 */
VS.RestSession.prototype.SetBasicAuthInfo = function(userid, password) {
    this.basicAuthInfo = "Basic " + btoa(userid + ":" + password);
};

/**
 * For calls that require authentication.  This call is made after the object is constructed to begin the session
 * @param {string} authenticateUrl
 * @param {any} authenticateInfo
 */
VS.RestSession.prototype.AuthenticateAndRun = function(authenticateUrl, authenticateInfo) { };

/**
 * For calls that require do not require authentication.  This call is made after the object is constructed to begin the session
 */
VS.RestSession.prototype.Run = function() { };

/**
 * Issue request to retrieve information.  First call is passed a 0, subsequent calls pass the index of the results requested to start from
 * @param {int} startAt - starting index for requested information
 */
VS.RestSession.prototype.IssueRequest = function(startAt) { };

/**
 * Response received from a call to IssueRequest. If there is more data to retrieve, aggregate this response's information, and call IssueRequest again (with an updated StartAt number).  When
 * all information has been retrieved and aggregated, then call the user's handlerFunction 
 * @param {Object} response - response information received in rely to request
 */
VS.RestSession.prototype.HandleResponse = function(response) { };

/**
 * Respond to an error
 * @param {int} errorCode - normally an HTTP error code
 * @param {string} msg - message string to report
 */
VS.RestSession.prototype.ReportError = function(errorCode, msg) { };
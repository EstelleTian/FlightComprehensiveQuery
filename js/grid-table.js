/**
 * 2018/01/23
 * author: zxy
 * 表格组件
 */

function GridTable(params) {
    // 检查参数有效性
    if (!$.isValidObject(params)) {
        return;
    }

    /**
     * 表格所在模块对象
     */
    this.moduleObj = params.moduleObj;

    /**
     * 表格所在容器jQuery对象
     */
    this.canvas = {};

    /**
     * 表格元素ID
     */
    this.tableId = params.tableId;

    /**
     * 表格元素jQuery对象
     */
    this.table = {};

    /**
     * 表格元素PagerID
     */
    this.pagerId = params.pagerId;

    /**
     * 表格jqGrid对象
     */
    this.gridTableObject = {};

    /**
     * 列所有名称
     */
    this.colNames = params.colNames;

    /**
     * 列属性
     */
    this.colModel = params.colModel;

    /**
     * 列属性模板
     */
    this.cmTemplate = params.cmTemplate;

    /**
     * 列显示提示信息
     */
    this.colTitle = params.colTitle;

    /**
     * 列样式配置
     */
    this.colStyle = params.colStyle;

    /**
     * 列编辑开放配置
     */
    this.colEdit = params.colEdit;

    /**
     * 列操作权限
     */
    this.colAuthority = params.colAuthority;

    /**
     * 列操作url
     */
    this.colCollaborateUrl = params.colCollaborateUrl;

    /**
     * 列数据转换工具
     */
    this.colConverter = params.colConverter;

    /**
     * jqGrid表格原生配置项
     */
    this.params = params.params;

    /**
     * 数据-原始数据
     */
    this.data = {};

    /**
     * 数据-表格显示数据（Array）
     */
    this.tableData = [];

    /**
     * 数据-表格显示数据（Map）
     */
    this.tableDataMap = {};


    /**
     * 回调方法-选中单行
     */
    this.onSelectRow = params.onSelectRow;

    /**
     * 回调方法-更新单个数据
     */
    this.afterCollaborate = params.afterCollaborate;

    /**
     * 数据-基础数据：如列操作需要的数据
     */
    this.baseData = params.baseData;

    /**
     * 冻结列高度（用以处理冻结列和滚动条中间缝隙）
     */
    this.frozenHeight = 0;

}


/**
 * 常量-当前选择单元格类名
 */
GridTable.SELECTED_CELL_CLASS = 'grid-table-current-select-cell';

/**
 * 常量-协调元素类名
 */
GridTable.COLLABORATE_DOM_CLASS = 'grid-table-collaborate-container';



GridTable.prototype.initGridTableObject = function () {
    // 当前对象this代理
    var thisProxy = this;
    // 表格jQuery对象
    thisProxy.table = $('#' + thisProxy.tableId);
    // 容器jQuery对象
    thisProxy.canvas = thisProxy.table.parent();
    // 初始化jqGrid默认参数
    var gridTableOptions = {
        // 单独使用bootstrap样式，或通过全局设置$.jgrid.defaults.styleUI = 'Bootstrap';
        styleUI: 'Bootstrap',
        // 列名称
        colNames: thisProxy.colNames,
        // 列Model
        colModel: thisProxy.colModel,
        // 列Model模板
        cmTemplate: thisProxy.cmTemplate,
        // 列标题
        colTitle: thisProxy.colTitle,
        // 数据类型
        datatype: 'local',
        // 单次显示数据行数
        rowNum: 999999999,
        // 是否显示行号
        rownumbers: true,
        // 行号列宽(px)
        //rownumWidth: 25,
        // 是否显示表头信息
        headertitles: true,
        // 是否初始化时自适应容器宽度
        //autowidth: true,
        // 是否列宽根据所在容器宽度自适应
        shrinkToFit: false,
        // 定义工具栏，须是有效的html元素
        pager: '#' + this.pagerId,
        // 定义工具栏是否显示翻页键
        pgbuttons: false,
        // 定义工具栏是否显示页数输入框
        pginput: false,
        // 定义导航栏是否显示记录数
        viewrecords: true,
        // 是否支持通过checkbox进行行多选（默认不支持多选）
        multiselect: false,
        // 是否限制仅通过checkbox进行行多选（在“伪”关闭多选模式时开启，默认“伪”关闭）
        multiboxonly: false,
        //当排序时是否取消选择当前行
        deselectAfterSort : false,
        // 绑定左键单击事件
        onCellSelect: function (rowid, iCol, cellcontent, e) {
            thisProxy.onCellSelect(rowid, iCol, cellcontent, e);
        },
        // 绑定左键选中行事件
        onSelectRow: function (rowid, status, e) {

        },
        // 绑定右键单击事件
        onRightClickRow: function (rowid, iRow, iCol, e) {
            // thisProxy.onRightClickRow(rowid, iRow, iCol, e);
        },
        //　绑定排序事件
        // // 当点击排序列但是数据还未进行变化时触发此事件
        // onSortCol : function (index, iCol, sortorder ) {
        //     thisProxy.onSortCol(index, iCol, sortorder);
        // }
    };
    // 追加jqGrid自定义参数
    if (thisProxy.params != undefined && thisProxy.params != null) {
        for (var key in thisProxy.params) {
            gridTableOptions[key] = thisProxy.params[key];
        }
    }
    // 初始化jqGrid
    thisProxy.gridTableObject = thisProxy.table.jqGrid(gridTableOptions);

    // 初始化jqGrid Pager
    thisProxy.gridTableObject.jqGrid('navGrid', '#' + thisProxy.pagerId, {
        add: false,
        edit: false,
        view: false,
        del: false,
        search: false,
        refresh: false
    });

    // 初始化快速过滤工具栏
    thisProxy.gridTableObject.jqGrid('filterToolbar', {
        // 是否开启Enter后查询
        searchOnEnter: false,
        // 是否开启查询逻辑选择
        searchOperators: false,
        // afterSearch: function () {
        //     if( thisProxy.params.hasOwnProperty("afterSearchCallBack") && undefined != thisProxy.params.afterSearchCallBack){
        //         thisProxy.params.afterSearchCallBack();
        //     }
        // }
    });// 隐藏过滤工具栏的X清空过滤条件按钮
    thisProxy.canvas.find('.ui-search-clear').hide();
    // 隐藏快速过滤（默认）
    if (!thisProxy.params.showQuickFilter) {
        thisProxy.gridTableObject[0].toggleToolbar();
    }

    // 绑定Window事件，窗口变化时重新调整表格大小
    $(window).resize(function () {
        thisProxy.resizeToFitContainer()
    });
    //清除冻结列
    // thisProxy.gridTableObject.jqGrid("destroyFrozenColumns");
    // thisProxy.gridTableObject.jqGrid("setFrozenColumns");

    // 初始化完成时，使按照所在容器调整表格大小
    thisProxy.resizeToFitContainer();
};


/**
 * 调整表格大小以适应所在容器
 */
GridTable.prototype.resizeToFitContainer = function () {
    var thisProxy = this;
    GridTableUtil.resizeToFitContainer(thisProxy.tableId);
};

/**
 *
 * */
GridTable.prototype.fireTableDataChange = function (dataObj) {
    // 当前对象this代理
    var thisProxy = this;

    // 校验数据是否有效
    if(!$.isValidObject(dataObj) || !$.isValidObject(dataObj.result)){
        // 清空表格数据
        thisProxy.gridTableObject.jqGrid('clearGridData');
        return;
    }

    // deep copy 保存源数据
    // thisProxy.data = $.extend(true, {}, dataObj);
    // 取得航班集合
    var data = dataObj.result;
    thisProxy.tableDataMap = {};
    thisProxy.tableData = {};
    var tableData = [];
    var tableMap = {};
    for (var index in data) {
        // 取得单个航班数据并转换
        var d = thisProxy.convertData(data[index]);
        var id = d.id;
        tableData.push(d);
        tableMap[id] = d;
    }
    thisProxy.tableDataMap = tableMap;
    thisProxy.tableData = tableData;
    // 绘制表格数据
    thisProxy.drawGridTableData();
    // 调整表格大小以适应所在容器
    thisProxy.resizeToFitContainer();
};



/**
 * 绘制表格数据
 */
GridTable.prototype.drawGridTableData = function () {
    var thisProxy = this;
    // 清空表格数据
    thisProxy.gridTableObject.jqGrid('clearGridData');
    // 更新表格数据
    var params = {data: this.tableData, srcoll: 1};
    this.gridTableObject.jqGrid('setGridParam', params).trigger('reloadGrid');
    //清除冻结列
    // thisProxy.gridTableObject.jqGrid("destroyFrozenColumns");
    // thisProxy.gridTableObject.jqGrid("setFrozenColumns");

    // this.frozenHeight = $('#'+thisProxy.tableId+'_frozen').parent().height();
    // this.resizeFrozenTable();
};

/**
 * 左键单击事件
 *
 * @param rowid
 * @param iCol
 * @param cellcontent
 * @param e
 */
GridTable.prototype.onCellSelect = function (rowid, iCol, cellcontent, e) {
    // 代理
    var thisProxy = this;

    // 清除单元格样式
};


/**
 * 显示/隐藏快速过滤工具条
 */
GridTable.prototype.showQuickFilter = function () {
    // 代理
    var thisProxy = this;
    // 清空过滤条件
    thisProxy.gridTableObject[0].clearToolbar();
    //清除冻结列
    // thisProxy.gridTableObject.jqGrid("destroyFrozenColumns");
    // 切换显示
    thisProxy.gridTableObject[0].toggleToolbar();
    // 隐藏清空条件的x
    thisProxy.canvas.find('.ui-search-clear').hide();
    // 自适应
    thisProxy.resizeToFitContainer();
    //激活冻结列
    // thisProxy.gridTableObject.jqGrid("setFrozenColumns");
};
/**
 * 转换数据
 * */
GridTable.prototype.convertData = function (flight) {
    // 代理
    var thisProxy = this;

    return flight;

}
/**
 * Created by FQL on 2018/5/31.
 */


var FlightComprehensiveQuery = function () {
    // 请求地址
    var url = 'http://192.168.243.187:38180/Flights/retrieve';

    // 表格对象
    var table = {};
    var airportElement = $('.form-opt .airport');
    var startTimeElement = $('.form-opt .start-time');
    var endTimeElement = $('.form-opt .end-time');
    // 错误信息
    var errElement = $('.err-msg');
    // 查询按钮loading对象
    var loading = {};
    // 是否允许查询数据  默认允许
    queryDataFlag = true;
    /**
     * 设置默认时间为当前时间
     */
    var initDefaultDateTime = function(){
        var now = $.getFullTime(new Date());
        var date = now.substring(0,8);
        var strart = date + '0000';
        var end = date + '2359';
        startTimeElement.val(strart);
        endTimeElement.val(end);
    };

    /**
     * 日期控件初始化
     * */
    var initDateComponents = function () {

        var start = new Date();
        start.setHours('00');
        start.setMinutes('00');

        var end = new Date();
        end.setHours('23');
        end.setMinutes('59');
        startTimeElement.datetimepicker({
            language: "zh-CN",
            autoclose: true,
        });
        startTimeElement.datetimepicker('setDate',start);

        endTimeElement.datetimepicker({
            language: "zh-CN",
            autoclose: true

        });
        endTimeElement.datetimepicker('setDate',end);

    };

    /**
     * 初始化表格
     * */
    var initTable = function () {
        var pagerId = 'flight-table-pager';
        var opt = {
            tableId: 'flight-table',
            pagerId: pagerId,
            colNames: GridTableConfig.common.colName,
            colModel: GridTableConfig.common.colModel,
            cmTemplate: GridTableConfig.colModelTemplate,
            colTitle: GridTableConfig.common.colTitle,
            params: {
                sortname: 'sobt',
                shrinkToFit: true,
                sortorder: 'asc',
                onCellSelect: function (rowid, iCol, cellcontent, e) {
                    var colModel = table.gridTableObject.jqGrid('getGridParam')['colModel'];
                    var colName = colModel[iCol].name;
                    // var colData = table.gridTableObject.jqGrid('getGridParam')['data'];
                    // 航班号列单元格
                    if (colName == 'flightId') {
                        // rowid 既为航班id
                        // 查看航班详情
                        var url = "http://192.168.217.233:8080/areacrs/open_flight_detail_dialog.action?id=" + rowid;
                        window.open(url);
                    }
                }
            }
        };
        table = new GridTable(opt);
        table.initGridTableObject();
        // 设置 Pager 按钮
        table.gridTableObject
            .navButtonAdd('#' + pagerId, {
            caption: "快速过滤",
            title: "快速过滤",
            buttonicon: "glyphicon-filter",
            onClickButton: function () {
                table.showQuickFilter();
            },
            position: "first"
        });
    };

    /**
     * 清除表格
     *
     * */
    var clearTable = function () {
        // 清空表格数据
        if($.isValidObject(table) && $.isValidObject( table.gridTableObject)  ){
            // 清空表格数据
            table.gridTableObject.jqGrid('clearGridData');
            // 重新加载表格
            $.jgrid.gridUnload(table.tableId);

            // 释放表格对象
            table = null;
        }

    }

    /**
     * 显示qtip提示信息
     *
     * */
    var showTipMessage = function (targetObj, type, content) {

        // 确定样式设置
        var styleClasses = 'qtip-green';
        if (type == 'SUCCESS') {
            styleClasses = 'qtip-green-custom qtip-rounded';
        } else if (type == 'FAIL') {
            styleClasses = 'qtip-red-custom qtip-rounded';
        } else if (type == 'WARN') {
            styleClasses = 'qtip-default-custom qtip-rounded';
        }
        // 显示提示信息
        targetObj.qtip({
            // 内容
            content: {
                text: content // 显示的文本信息
            },
            // 显示配置
            show: {
                delay: 0,
                target: targetObj,
                ready: true, // 初始化完成后马上显示
                effect: function () {
                    $(this).fadeIn(); // 显示动画
                }
            },
            // 隐藏配置
            hide: {
                target:targetObj, // 指定对象
                event: 'unfocus click keyup', // 失去焦点时隐藏
                effect: function () {
                    $(this).fadeOut(); // 隐藏动画
                }
            },
            // 显示位置配置
            position: {
                my: 'bottom center', // 同jQueryUI Position
                at: 'top center',
                viewport: true, // 显示区域
                // container: thisProxy.canvas, // 限制显示容器，以此容器为边界
                adjust: {
                    resize: true, // 窗口改变时，重置位置
                    method: 'shift shift',  //flipinvert/flip(页面变化时，任意位置翻转)  shift(转变) none(无)
                }
            },
            // 样式配置
            style: {
                classes: styleClasses //
            },
            // 事件配置
            events: {
                hide: function (event, api) {
                    api.destroy(true); // 销毁提示信息
                }
            }
        });
    };


    /**
     * 显示错误提示信息
     * */
    var showErrorMessage = function (targetObj,content) {
        targetObj.text(content).show();
    };
    /**
     * 清除错误提示信息
     * */
    var clearErrorMessage = function (targetObj) {
        if(targetObj.is(":visible")){
            targetObj.hide().text('');
        }

    };
    /**
     * 显示查询条件
     * */
    var showQueryDetail = function (data) {
        var airport = airportElement.val().toUpperCase(); // 机场名称
        var start = startTimeElement.val(); //开始时间
        var end = endTimeElement.val(); // 结束时间
        var fpl = $(".form-opt .fpl:checked").val(); // fpl报
        var fplStr = '';
        if(fpl == 'true'){
            fplStr = '有'
        }else if(fpl == 'false') {
            fplStr = '无'
        }
        // 数据生成时间
        var time = '';
        if($.isValidObject(data) && $.isValidVariable(data.generateTime)){
            var t = data.generateTime;
            time = t.substring(0, 4) + '-' + t.substring(4, 6) +'-' +t.substring(6, 8) + ' ' + t.substring(8, 10) + ':' + t.substring(10, 12);
            
        }
        $('.query-detail .airport').text(airport);
        $('.query-detail .start-time').text(start);
        $('.query-detail .end-time').text(end);
        $('.query-detail .fpl').text(fplStr);
        $('.query-detail .generate-time').text(time);
        $('.query-detail').removeClass('hide');
    }
    /**
     * 隐藏查询条件
     * */
    var hideQueryDetail = function () {
        $('.query-detail').addClass('hide');
    }
    /**
     *禁用表单
     * */
    var disabledForm = function () {
        $('.form-opt input').prop('disabled',true);
    }
    /**
     * 启用表单
     * */
    var enabledForm = function () {
        $('.form-opt input').prop('disabled',false);
    }


    /**
     * 校验表单数据是否有效
     * */
    var validForm = function () {

        var airport = validAirport();
        var start = validStartTime();
        var end = validEndTime();

        var valid = (airport && start && end);
        return valid;
    };

    /**
     * 校验机场名称输入框
     *
     * */
    var validAirport = function () {
        var airportVal = airportElement.val().toUpperCase();
        var regexp = /(^[a-zA-Z]{4}|^[a-zA-Z]{2}|^[a-zA-Z]{3}|^[a-zA-Z]{1})([,]([a-zA-Z]{4}|[a-zA-Z]{2}|[a-zA-Z]{3}|[a-zA-Z]{1}))*$/;

        var valid = regexp.test(airportVal);
        if(valid){
            return true;
        }else {
            showTipMessage(airportElement,'FAIL','请输入有效机场名称');
            return false;
        }
    };

    /**
     * 校验开始时间输入框
     *
     * */
    var validStartTime = function () {
        var time = startTimeElement.val();
        time = convertDateTime(time);
        //时间格式
        var regexp = /(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})(((0[13578]|1[02])(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)(0[1-9]|[12][0-9]|30))|(02(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))0229)/;

        var valid = regexp.test(time);

        if(valid){
            return true;
        }else {
            showTipMessage(startTimeElement,'FAIL','请输入有效开始时间');
            return false;
        }
    };
    /**
     * 校验结束时间输入框
     *
     * */
    var validEndTime = function () {
        var time = endTimeElement.val();
        time = convertDateTime(time);
        //时间格式
        var regexp = /(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})(((0[13578]|1[02])(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)(0[1-9]|[12][0-9]|30))|(02(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))0229)/;

        var valid = regexp.test(time);

        if(valid){
            return true;
        }else {
            showTipMessage(endTimeElement,'FAIL','请输入有效结束时间');
            return false;
        }
    };


    /**
     * 转换日期时间格式字符串
     *
     * */
    var convertDateTime = function (str) {
        var date = new Date(str);
        return $.getFullTime(date);
    };


    /**
    * 查询数据
    * */
    var queryDatas = function () {
        disabledForm();
        queryDataFlag = false;
        var airport = airportElement.val().toUpperCase(); // 机场名称
        var condition = 1; // 1包含
        var startTime = convertDateTime(startTimeElement.val()); // 开始时间
        var endTime = convertDateTime( endTimeElement.val()); // 结束时间
        var hasFPL = $(".form-opt .fpl:checked").val(); // 是否有FPL报

        $.ajax({
            type : "GET",
            data : {airport : airport, "condition" : condition, "start" : startTime, "end" : endTime, "hasFPL" : hasFPL},
            url : url,
            success : function(data) {
                enabledForm();
                queryDataFlag = true;
                // 显示查询条件
                showQueryDetail(data)

                // 关闭loading动画
                loading.stop();
                if($.isValidObject(data) && data.status == 200) {
                    // 绘制数据
                    fireDatas(data)
                } else {
                   //
                   showErrorMessage(errElement,'数据为空')
                }
            },
            error : function(xhr, status, error) {
                enabledForm();
                queryDataFlag = true;
                // 关闭loading动画
                loading.stop();
                showErrorMessage(errElement,status)
            }
        })
    };
    /**
     * 绘制数据
     * */
    var fireDatas = function (data) {
        // 若航班数据有效
        if($.isValidObject(data.result)){
            // 初始化表格
            initTable();
            // 绘制表格数据
            table.fireTableDataChange(data);
        }else {
            showErrorMessage(errElement,'数据为空')
        }
    };

    /**
     * 处理查询
     * */
    var handleSearch = function () {
        if(!queryDataFlag){
            return
        }
        // 隐藏查询条件
        hideQueryDetail();
        // 清除错误提示信息
        clearErrorMessage(errElement);
        // 清除表格
        clearTable();

        // 校验表单数据是否有效
        var valid = validForm();
        if(valid){
            // 启用loading动画
            loading.start();
            // 查询数据
            queryDatas();
        }
    }
    /**
     * 初始化查询
     * */
    var initSearchEvent = function () {
        // 查询按钮点击事件
        $('.form-opt .search').on('click',function () {
            // 处理查询
            handleSearch();
        });
        // 机场名称键入事件
        airportElement.on('keyup',function (e) {
            var event = e || event;
            if(event.keyCode == 13){
                // 处理查询
                handleSearch();
            }
        })

    };

    /**
     * 初始化查询按钮动画
     * */
    var initLoading = function () {

        loading = Ladda.create( $('.form-opt .search')[0]);
    };

    // 初始化组件
    var initComponent = function () {
        // 设置默认时间
        initDefaultDateTime();
        // 日期控件初始化
        initDateComponents();
        // 初始化按钮动画
        initLoading()

    };
    // 初始化事件
    var initEvent = function () {
        // 初始化查询事件
        initSearchEvent();
    };


    return {
        init : function () {
            initComponent();
            initEvent();
        }
    }
}();

$(document).ready(function () {
    FlightComprehensiveQuery.init();
})
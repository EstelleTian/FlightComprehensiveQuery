/**
 * 2018/01/23
 * author: zxy
 * 表格列配置
 */

var GridTableConfig = function () {
    // 通用表
    var common = {
        colName : ['ID','FLIGHTID','DEPAP','ARRAP','SOBT','EOBT','ATOT','EXECUDATE'],
        colModel: [
            // id
            {
                name: 'id',
                index: 'id',
                width:120,
                hidden : true, //隐藏
            },

            // 航班号
            {
                name: 'flightId',
                index: 'flightId'
            },
            // depap
            {
                name: 'depap',
                index: 'depap',
            },
            // arrap
            {
                name: 'arrap',
                index: 'arrap',
            },
            // sobt
            {
                name: 'sobt',
                index: 'sobt',
                formatter : formatterDateTime
            },
            // eobt
            {
                name: 'eobt',
                index: 'eobt',
                formatter : formatterDateTime
            },
            // ATOT
            {
                name: 'atd',
                index: 'atd',
                formatter : formatterDateTime
            },
            // executedate
            {
                name: 'executedate',
                index: 'executedate',
            }
        ],
        colTitle: {
            id: 'ID',
            flightId:'flightId',
            depap:'depap',
            arrap:'arrap',
            sobt:'sobt',
            eobt:'eobt',
            atd:'ATOT',
            executedate:'executedate'
        }
    };

    // ......
    // colModel模板
    var colModelTemplate = {
        width: 100,
        align: 'center',
        sortable : true,
        search : true,
        searchoptions : {
            sopt : ['cn','nc','eq','ne','lt','le','gt','ge','bw','bn','in','ni','ew','en'],
            dataEvents:[
                {	type: 'keyup',
                    fn: function (e) {
                        $(this).change();
                    },
                }
            ]
        },
        // 单元格相关属性处理
        cellattr: function (rowId, value, rowObject, colModel, arrData) {
            // 需要赋予表格的属性
            var attrs = '';
            // 无效数值不做处理
            if (!$.isValidVariable(value)) {
                return attrs;
            }
            // 单元格原始值,未formatter
            var cellcontent = rowObject[colModel.name];
            // 若单元格值无效
            if (!$.isValidVariable(cellcontent)) {
                cellcontent = '';
            }
            /**
             *  处理时间单元格，用以单元格title显示值的格式
             * */
            // 单元格值长度
            var len = cellcontent.length;
            //时间格式
            var regexp = /(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})(((0[13578]|1[02])(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)(0[1-9]|[12][0-9]|30))|(02(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))0229)/;
            //12位有效时间
            if (regexp.test(cellcontent) && len == 12) {
                cellcontent = cellcontent.substring(0, 8) + ' ' + cellcontent.substring(8, 10) + ":" + cellcontent.substring(10, 12);
            } else if (regexp.test(cellcontent) && len == 14) { //14位有效时间
                cellcontent = cellcontent.substring(0, 8) + ' ' + cellcontent.substring(8, 10) + ":" + cellcontent.substring(10, 12) + ':' + cellcontent.substring(12, 14);
            }
            // 设置title属性
            attrs = ' title="' + cellcontent + '"';

            // 自定义航班号列单元格样式
            var colName = colModel.name;
            // 若单元此单元格对应的colName为航班号(flightId),则调整该单元格样式
            if(colName == 'flightId' ){
                attrs += 'style="color:#337ab7; cursor: pointer"';
            }


            return attrs;
        },
        sortfunc: function (a, b, direction) {
            // 若为升序排序，空值转换为最大的值进行比较
            // 保证排序过程中，空值始终在最下方
            if ($.type(a) === "number" || $.type(b) === "number") {
                // 数字类型
                var maxNum = Number.MAX_VALUE;
                if (!$.isValidVariable(a) || a < 0) {
                    if (direction > 0) {
                        a = maxNum;
                    }
                }
                if (!$.isValidVariable(b) || b < 0) {
                    if (direction > 0) {
                        b = maxNum;
                    }
                }
                return (a > b ? 1 : -1) * direction;
            } else {
                // 字符串类型
                var maxStr = 'ZZZZZZZZZZZZ';
                if (!$.isValidVariable(a)) {
                    if (direction > 0) {
                        a = maxStr;
                    } else {
                        a = '';
                    }
                }
                if (!$.isValidVariable(b)) {
                    if (direction > 0) {
                        b = maxStr;
                    } else {
                        b = '';
                    }
                }
                return a.localeCompare(b) * direction;
            }
        }
    };
    // 单元格时间格式化
    function formatterDateTime (cellvalue, options, rowObject) {
        var val = cellvalue * 1;
        if ($.isValidVariable(cellvalue) && !isNaN(val)) {
            // 12位时间
            if (cellvalue.length == 12) {
                return cellvalue.substring(0, 4) + '-' + cellvalue.substring(4, 6) +'-' +cellvalue.substring(6, 8) + ' ' + cellvalue.substring(8, 10) + ':' + cellvalue.substring(10, 12);
            }else if(cellvalue.length == 14){  // 14位时间
                return cellvalue.substring(0, 4) + '-' + cellvalue.substring(4, 6) +'-' +cellvalue.substring(6, 8) + ' ' + cellvalue.substring(8, 10) + ':' + cellvalue.substring(12, 14);
            }
        }else {
            return '';
        }
    };


    return {
        common : common,
        colModelTemplate : colModelTemplate,
    }
}();

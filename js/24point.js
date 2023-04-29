const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const boardWidth = canvas.width;
const boardHeight = canvas.height;

//////////////////////
//程序入口
////////////////////
function Start() {

}

//成行显示
function WriteTextsH(arr1, x, y, hei, scale) {
    let tbWid = 0;
    let x2 = x;
    let arr2 = [];
    for (let i = 0; i < arr1.length; ++i) {
        x2 = x2 + tbWid;
        let oTxt = WriteText(arr1[i], x2, y, hei, scale);
        //计算宽度
        tbWid = arr1[i].length * hei * 0.8;
        arr2.push(oTxt);
    }

    return arr2;
}

//绘制题目
function WriteText(str1, x, y, hei, scale) {
    scale = scale || 60;
    let fontHei = hei * scale + "px";
    ctx.font = "normal " + fontHei + " Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(str1, x * scale, y * scale);

    return { txt: str1, x: x, y: y, h: hei, s: scale };
}

const rowTotal = 6;
const rowHeight = 4.0;
//计算的范围
var hardMin, hardMin2, hardMax, hardMax2;
//公式的类型
var formulaMode1, formulaMode2;
var grade = 1;
var m_hard = 1;

function CreateA4(category) {
    var toastDlg = new Toast({
        text: "生成中"
    });
    toastDlg.Show();
    //ctx.clearRect(0,0,boardWidth,boardHeight);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, boardWidth, boardHeight);
    formulaMode1 = 1;
    formulaMode2 = 2;
    //1.title
    WriteText("24点", 8.5, 1.5, 1.0);
    //2.sub-title
    WriteTextsH(["班级________", "姓名________", "用时________", "得分________"], 2.5, 3.5, 0.5);
    //3.subjects
    if (category == 1) {
        //10以内
        [hardMin, hardMin2, hardMax, hardMax2] = [1, 1, 10, 10];
        //绘制公式的
        DrawFormula(Formula24, rowTotal, true);
    } else if (category == 2) {
        //10以内
        [hardMin, hardMin2, hardMax, hardMax2] = [1, 10, 10, 13];
        //绘制公式的
        DrawFormula(Formula24, rowTotal, true);
    }else if (category == 3) {
        //10以内 加减
        m_hard = 3;
        [hardMin, hardMin2, hardMax, hardMax2] = [1, 1, 10, 10];
        //绘制公式的
        DrawFormula(Formula24, rowTotal, true);
    } else if (category == 4) {
        //10以内 加减乘
        m_hard = 4;
        [hardMin, hardMin2, hardMax, hardMax2] = [1, 1, 10, 10];
        //绘制公式的
        DrawFormula(Formula24, rowTotal, true);
    } 
    //二维码
    DrawImage('./qr.png', () => {
        toastDlg.Close();
        ShowImageDlg();
    });
}

function DrawFormula(cb, num, bDrawV, startY) {
    startY = startY || 5.0;
    let rowY = startY;
    if (typeof cb == "function") {
        for (let i = 0; i < num; i++) {
            rowY = startY + i * rowHeight;
            let arr1 = WriteTextsH([cb(), cb(), cb(), cb()], 1.5, rowY, 0.5);
        }
    }
    return rowY;
}

//公式生成器
function Formula24() {
    let args = [];
    //是否有解检查
    let lstSolution = [];
    while (lstSolution.length == 0) {
        args[0] = RandomInt(hardMin, hardMax);
        args[1] = RandomInt(hardMin, hardMax);
        args[2] = RandomInt(hardMin, hardMax);
        args[3] = RandomInt(hardMin2, hardMax2);
        lstSolution = Check24Solution(args);
    }

    str1 = args[0] + ", " + args[1] + ", " + args[2] + ", " + args[3];
    //空格补齐
    str1 = MergeBlank(str1);
    return str1;
}

//计算是否存在24解
function Check24Solution(arr1) {
    let arrNumIdxs = rankFun([0, 1, 2, 3]);
    let arrOpbase = ["+", "-", "x", "÷"];
    if(m_hard == 3){
        arrOpbase = ["+", "-"];
    }else if(m_hard == 4){
        arrOpbase = ["+", "-", "x"];
    }
    let arrOps2 = [];
    for (let i = 0; i < 4; i++) {
        let t1 = arrOpbase[i];
        for (let j = 0; j < 4; j++) {
            let t2 = arrOpbase[j];
            for (let k = 0; k < 4; k++) {
                let t3 = arrOpbase[k];
                let arr1 = [t1, t2, t3];
                arrOps2.push(arr1);
            }
        }
    }
    let arrOps = arrOps2;
    let lst1 = [];

    for (let i = 0; i < arrNumIdxs.length; i++) {
        let arrNum = [];
        let arrIdx = arrNumIdxs[i];
        for (let j = 0; j < arrIdx.length; j++) {
            arrNum.push(arr1[arrIdx[j]]);
        }
        for (let k = 0; k < arrOps.length; k++) {
            let obj1 = Calculate24(arrNum, arrOps[k]);
            if (obj1.v == 24) {
                //console.log(obj1);
                lst1.push(obj1);
            }

            let obj2 = Calculate24B(arrNum, arrOps[k]);
            if (obj2.v == 24) {
                //console.log(obj2);
                lst1.push(obj2);
            }
        }
    }

    //去重复
    let obj={};
    lst1 = lst1.reduce(function (item, next) {
        obj[next.t] ? '' : obj[next.t] = true && item.push(next);
        return item;
    }, []);
 
    return lst1;
}

//生成24点公式，计算值
function Calculate24(arr1, ops1) {
    let dRes = 0.0;
    let strRes = "";
    let op2 = "";
    for (let i = 0; i < arr1.length - 1; i++) {
        if (i == 0) {
            dRes = arr1[0];
            strRes = arr1[0] + "";
        }
        let op1 = ops1[i];
        dRes = Equation(dRes, arr1[i + 1], op1);

        if ((op1 == "x" || op1 == "÷") && (op2 == "+" || op2 == "-")) {
            if (strRes.indexOf("+") >= 0 || strRes.indexOf("-") >= 0) {
                strRes = "(" + strRes + ")";
            }
        }
        strRes = strRes + op1 + arr1[i + 1];

        op2 = op1;
    }

    return { v: dRes, t: strRes, arrNum: arr1, arrOp: ops1 };
}

//前后计算
function Calculate24B(arr1, ops1) {
    let dRes = 0.0;
    let strRes = "";

    let dTmp1 = Equation(arr1[0], arr1[1], ops1[0]);
    let dTmp2 = Equation(arr1[2], arr1[3], ops1[2]);
    dRes = Equation(dTmp1, dTmp2, ops1[1]);

    strRes = arr1[0] + ops1[0] + arr1[1];
    if(ops1[0] == "+" || ops1[0] == "-"){
        strRes = "("+strRes+")";
    }
    strRes += ops1[1];
    if(ops1[2] == "+" || ops1[2] == "-"){
        strRes +="(" +arr1[2] + ops1[2] + arr1[3]+")";
    }else{
        strRes += arr1[2] + ops1[2] + arr1[3];
    }

    return { v: dRes, t: strRes, arrNum: arr1, arrOp: ops1 };
}

function Equation(arg1, arg2, op1) {
    let dRes = 0.0;
    if (op1 == "+") {
        dRes = arg1 + arg2;
    } else if (op1 == "-") {
        dRes = arg1 - arg2;
    } else if (op1 == "x") {
        dRes = arg1 * arg2;
    } else if (op1 == "÷") {
        dRes = arg1 / arg2;
    }

    return dRes;
}

//把输入和空白的进行组合
function MergeBlank(inputStr, strLen) {
    strLen = strLen || inputStr.length;
    if (strLen < 11) {
        strLen = 11;
    }
    let str2 = "";
    for (let i = 0, len = strLen; i < len; i++) {
        if (i < inputStr.length) {
            str2 = str2 + inputStr.charAt(i);
        } else {
            str2 = str2 + " ";
        }
    }

    return str2;
}

//左侧加字符
function MergeBlankLeft(inputStr, strLen) {
    strLen = strLen || inputStr.length;
    if (inputStr.length >= strLen) {
        return inputStr;
    }
    let str2 = "";
    for (let i = 0, len = (strLen - inputStr.length); i < len; i++) {
        str2 = str2 + "  ";
    }
    str2 = str2 + inputStr;

    return str2;
}

//生成随机值
function RandomInt(min, max) {
    var span = max - min + 1;
    var result = Math.floor(Math.random() * span + min);
    return result;
}

//显示生成的题目图片，长按保存
function ShowImageDlg() {
    let strImg = "<img ";
    strImg += "src=" + canvas.toDataURL('png', 1.0);
    strImg += " style='width:350px;height:500px;'></img>";
    let dlg1 = new Dialog({
        title: "长按图片，保存下载",
        text: strImg
    });

    dlg1.Show();
}

//下载
function DownLoad() {
    //确定图片的类型  获取到的图片格式 data:image/Png;base64,......
    let type = 'jpeg';
    let imgdata = canvas.toDataURL(type, 1.0);
    //将mime-type改为image/octet-stream,强制让浏览器下载
    let fixtype = function (type) {
        type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
        let r = type.match(/png|jpeg|bmp|gif/)[0];
        return 'image/' + r;
    };
    imgdata = imgdata.replace(fixtype(type), 'image/octet-stream');
    //将图片保存到本地
    let savaFile = function (data, filename) {
        let save_link = document.createElement('a');
        save_link.href = data;
        save_link.download = filename;
        let event = new MouseEvent('click');
        save_link.dispatchEvent(event);
    };

    let filename = '' + new Date().format('yyyy-MM-dd_hhmmss') + '.' + type;
    //用当前秒解决重名问题
    savaFile(imgdata, filename);
}

Date.prototype.format = function (format) {
    let o = {
        "y": "" + this.getFullYear(),
        "M": "" + (this.getMonth() + 1),  //month
        "d": "" + this.getDate(),         //day
        "h": "" + this.getHours(),        //hour
        "m": "" + this.getMinutes(),      //minute
        "s": "" + this.getSeconds(),      //second
        "S": "" + this.getMilliseconds(), //millisecond
    }
    return Object.keys(o).reduce((pre, k) => (new RegExp("(" + k + "+)").test(pre)) ? (pre.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : o[k].padStart(2, "0"))) : pre, format);
}

//绘制图片
function DrawImage(img0, cb) {
    let imgObj = new Image();
    imgObj.src = img0;
    imgObj.onload = function () {
        ctx.drawImage(imgObj, 10, 10, 150, 150);
        if (typeof cb == "function") {
            cb();
        }
    }
}

String.prototype.ATrim = function () {
    return this.replace(/(\s)*/g, "");
}

//从公式中得到元素
function GetItemsFromFormula(str1) {
    str1 = str1.ATrim();
    let arr1 = [];
    for (let i = 0; i < str1.length; i++) {
        let str2 = str1[i];
        if (["+", "-", "X", "÷", "="].indexOf(str2) >= 0) {
            arr1.push(str2);
            arr1.push("");
        } else {
            if (arr1.length == 0) {
                arr1.push(str2);
            } else {
                arr1[arr1.length - 1] += str2;
            }
        }

    }

    return arr1.filter((val) => {
        if (val !== "" && val != undefined) {
            return true;
        }
        return false;
    });
}

/* arr 第一个参数 需要排列组合的数组，len 第二个参数为需要组合的个数 */
/* 返回参数为多为数组[[],[]] */
/* 注意不能有重复的数字*/
function rankFun(arrInput, len) {
    len = len || arrInput.length;
    let arrOut = [];
    function arrange(arr2) {
        for (let i = 0; i < arrInput.length; i++) {
            if (arr2.length == len - 1) {
                if (arr2.indexOf(arrInput[i]) < 0) {
                    arr2.push(arrInput[i]);
                    arrOut.push(arr2);
                }
                continue;
            }
            if (arr2.indexOf(arrInput[i]) < 0) {
                let arr3 = [].concat(arr2);
                arr3.push(arrInput[i]);
                arrange(arr3);
            }
        }
    }
    arrange([]);
    return arrOut;
}

//let arr1 = Check24Solution([4, 4, 4, 3]);
//let arr1 = Check24Solution([2,2,2,7]);
//console.log(arr1);
// let arr2 = Check24Solution([10, 8, 6, 5]);
// console.log(arr2);
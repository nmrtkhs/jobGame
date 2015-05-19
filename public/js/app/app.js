$(function(){
	var state = 0;
	$("#map").japanMap(
	{
		// areas  : areas, //上で設定したエリアの情報
		selection : "area", //選ぶことができる範囲(県→prefecture、エリア→area)
		borderLineWidth: 0.25, //線の幅
		drawsBoxLine : false, //canvasを線で囲む場合はtrue
		movesIslands : true, //南西諸島を左上に移動させるときはtrue、移動させないときはfalse
		showsAreaName : false, //エリア名を表示しない場合はfalse
		width: 400, //canvasのwidth。別途heightも指定可。
		backgroundColor: "#ffffff", //canvasの背景色
		font : "MS Mincho", //地図に表示する文字のフォント
		fontSize : 12, //地図に表示する文字のサイズ
		fontColor : "areaColor", //地図に表示する文字の色。"areaColor"でエリアの色に合わせる
		fontShadowColor : "black", //地図に表示する文字の影の色
	});

	var isButton = false;
	$("#button").click(function(){isButton = true;});

	var createInputName = function() {
		$("#name").append('<input type="text" id="inputName" size="30" maxlength="20">');
		state = 1;
	};

	var areaCode = 0;
	var areaSelectInterval;
	var waitInputName = function() {
		if (isButton)	{
			isButton = false;
			var name = $("#inputName").val();
			$("#name").empty();
			$("#name").append(name);
			$("#button").val("地域決定")
			areaSelectInterval = setInterval(function() {
				areaCode++;
				if (areaCode > 47) {
					areaCode = 1;
				}
				var prefectures = [];
				for (var i = 1; i <= 47; ++i) {
					if (i != areaCode) {
						prefectures.push(i);
					}
				}
				$("#area").empty();
				$("#area").append(areaInfo[areaCode].name);

				$("#map").empty();
				$("#map").japanMap(
					{
						// areas  : areas, //上で設定したエリアの情報
						areas : [
							{"code": 1, "name": "", "color": "#a0a0a0", "prefectures": prefectures},
							{"code": 2, "name": "hoge", "color": "#123456", "prefectures": [areaCode]}],
						selection : "area", //選ぶことができる範囲(県→prefecture、エリア→area)
						borderLineWidth: 0.25, //線の幅
						drawsBoxLine : false, //canvasを線で囲む場合はtrue
						movesIslands : true, //南西諸島を左上に移動させるときはtrue、移動させないときはfalse
						showsAreaName : false, //エリア名を表示しない場合はfalse
						width: 400, //canvasのwidth。別途heightも指定可。
						backgroundColor: "#ffffff", //canvasの背景色
						font : "MS Mincho", //地図に表示する文字のフォント
						fontSize : 12, //地図に表示する文字のサイズ
						fontColor : "areaColor", //地図に表示する文字の色。"areaColor"でエリアの色に合わせる
						fontShadowColor : "black", //地図に表示する文字の影の色
					}
				);
			},100);
			state = 2;
		}
	};

	var rentSelectInterval;
	var rent;
	var waitSelectArea = function() {
		if (isButton) {
			isButton = false;
			clearInterval(areaSelectInterval);

			var min = areaInfo[areaCode].minRent;
			var max = areaInfo[areaCode].maxRent;
			rentSelectInterval = setInterval(function() {
				rent = parseInt(Math.random() * (max - min) + min);
				$("#rent").empty();
				$("#rent").append(rent + "円");
			}, 100);
			$("#button").val("家賃決定")
			state = 3;
		}
	};

	var jobInfo = null;
	var waitSelectRent = function() {
		if (isButton) {
			isButton = false;
			clearInterval(rentSelectInterval);
			$.ajax({
			  url: 'http://www.shigotonavi.co.jp/api/search/',
			  type: "GET",
				data: {key: "7e10c3a89d87cc92e20bd2b537ccccd2",
				spc: areaInfo[areaCode].shigotoNaviCode},
			  success: function(res) {
					jobInfo = $.parseJSON($(res.responseText).text().trim()).result;
			  }
			});
			state = 4
		}
	};

	var jobSelectInterval;
	var selectJob;
	var waitSearchJob = function() {
		if (jobInfo !== null) {
			jobSelectInterval = setInterval(function() {
				var index = parseInt(Math.random() * (jobInfo.length - 1));
				selectJob = jobInfo[index];
				$("#company").empty();
				$("#company").append(decodeURI(selectJob.companyname));
			}, 100);
			$("#button").val("会社決定")
			state = 5;
		}
	};

	var salary = 0;
	var waitSelectJob = function() {
		if (isButton) {
			isButton = false;
			clearInterval(jobSelectInterval);
			$("#company").empty();
			var aTag = $('<a>');
			aTag.attr('href', selectJob.url);
			aTag.attr('target', '_blank');
			aTag.text(decodeURI(selectJob.companyname));
			$("#company").append(aTag);

			if (selectJob.salary_y_min) {
				if (selectJob.salary_y_max) {
					salary = parseInt((selectJob.salary_y_min + selectJob.salary_y_max) / 2 / 12);
				} else {
					salary = parseInt(selectJob.salary_y_min / 12);
				}
			} else if (selectJob.salary_y_max) {
					salary = parseInt(selectJob.salary_y_max / 12);
			} else if (selectJob.salary_m_min) {
				if (selectJob.salary_m_max) {
					salary = parseInt((selectJob.salary_m_min + selectJob.salary_m_max) / 2);
				} else {
					salary = parseInt(selectJob.salary_m_min);
				}
			} else if (selectJob.salary_m_max) {
					salary = parseInt(selectJob.salary_m_max);
			} else if (selectJob.salary_d_min) {
				if (selectJob.salary_d_max) {
					salary = parseInt((selectJob.salary_d_min + selectJob.salary_d_max) / 2 * 20);
				} else {
					salary = parseInt(selectJob.salary_d_min * 20);
				}
			} else if (selectJob.salary_y_max) {
					salary = parseInt(selectJob.salary_d_max * 20);
			}
			$("#salary").empty();
			$("#salary").append(salary + "円")
			$("#button").val("日を進める")
			state = 6;
		}
	}

	var year = 2015;
	var month = 5;
	var money = 0;
	var waitNextMonth = function() {
		if (isButton) {
			isButton = false;
			month ++;
			if (month > 12) {
				month = 1;
				year++;
			}
			money += salary - rent;
			$('#time').empty();
			$('#time').append(year + '年' + month + '月');
			$('#money').empty();
			$('#money').append(money + '円');
		}
	};

	setInterval(function() {
		switch (state) {
			case 0:
			createInputName();
			break;

			case 1:
			waitInputName();
			break;

			case 2:
			waitSelectArea();
			break;

			case 3:
			waitSelectRent();
			break;

			case 4:
			waitSearchJob();
			break;

			case 5:
			waitSelectJob();
			break;

			case 6:
			waitNextMonth();
			break;

			default:
			break;
		}
	}, 20);


});
